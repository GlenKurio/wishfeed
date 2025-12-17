import { NOTIFICATIONS_PER_PAGE } from "@/lib/constsnts";
import { db } from "@/lib/firebase";
import {
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead as markAllAsReadHelper,
} from "@/lib/firebase/firestore/notifications";
import type { NotificationType } from "@/lib/types";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { toast } from "sonner";

export function useNotifications({
  userId,
  realtime = true,
}: {
  userId: string;
  realtime?: boolean;
}) {
  const queryClient = useQueryClient();

  const result = useInfiniteQuery({
    queryKey: ["notifications", userId],
    queryFn: async ({ pageParam }) => {
      const notificationsRef = collection(db, "notifications");
      let q = query(
        notificationsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(NOTIFICATIONS_PER_PAGE),
      );

      if (pageParam) {
        q = query(q, startAfter(pageParam));
      }

      const snapshot = await getDocs(q);
      const notifications: NotificationType[] = [];

      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        } as NotificationType);
      });

      return {
        notifications,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.notifications.length === NOTIFICATIONS_PER_PAGE
        ? lastPage.lastDoc
        : undefined;
    },
    initialPageParam: undefined as DocumentSnapshot | undefined,
    enabled: !!userId,
    staleTime: Infinity,
  });

  // Real-time listener only for the first page
  useEffect(() => {
    if (!realtime || !userId) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(NOTIFICATIONS_PER_PAGE),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newNotifications: NotificationType[] = [];

        // Get current data from queryClient instead of using result.data
        const currentData = queryClient.getQueryData<any>([
          "notifications",
          userId,
        ]);
        const currentFirstPage = currentData?.pages[0]?.notifications || [];
        const previousIds = new Set(
          currentFirstPage.map((n: NotificationType) => n.id),
        );

        snapshot.forEach((doc) => {
          newNotifications.push({
            id: doc.id,
            ...doc.data(),
          } as NotificationType);
        });

        // Show toasts for new notifications
        if (currentFirstPage.length > 0) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const notification = {
                id: change.doc.id,
                ...change.doc.data(),
              } as NotificationType;

              if (!notification.isRead && !previousIds.has(notification.id)) {
                showNotificationToast(notification, queryClient);
              }
            }
          });
        }

        // Update only the first page with real-time data
        queryClient.setQueryData(["notifications", userId], (oldData: any) => {
          if (!oldData) {
            return {
              pages: [
                {
                  notifications: newNotifications,
                  lastDoc: snapshot.docs[snapshot.docs.length - 1],
                },
              ],
              pageParams: [undefined],
            };
          }

          return {
            ...oldData,
            pages: [
              {
                notifications: newNotifications,
                lastDoc: snapshot.docs[snapshot.docs.length - 1],
              },
              ...oldData.pages.slice(1),
            ],
          };
        });
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        toast.error("Failed to load notifications");
      },
    );

    return () => unsubscribe();
  }, [realtime, userId, queryClient]);
  return result;
}

// Helper to show toast and invalidate queries
function showNotificationToast(
  notification: NotificationType,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  // TODO: finish notification toasts and queries invalidation
  switch (notification.kind) {
    case "follow":
      toast.info(notification.message);
      queryClient.invalidateQueries({
        queryKey: ["user-profile", notification.userId],
      });
      break;

    case "gift_reserved":
      toast.info("🎁 " + notification.message, {
        action: {
          label: "View",
          onClick: () => {
            window.location.href = `/post/${notification.postId}`;
          },
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["posts", "user"],
      });
      break;

    case "gift_sent":
      toast.success("📦 " + notification.message, {
        action: {
          label: "Confirm",
          onClick: () => {
            window.location.href = `/post/${notification.postId}`;
          },
        },
      });

      queryClient.invalidateQueries({
        queryKey: ["posts", "user"],
      });
      break;

    case "gift_confirmed":
      toast.success("🎉 " + notification.message, {
        duration: 5000,
      });

      queryClient.invalidateQueries({
        queryKey: ["gifts", "giving"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userStats"],
      });
      break;

    case "gift_cancelled":
      toast.info("ℹ️ " + notification.message);

      queryClient.invalidateQueries({
        queryKey: ["posts", "user"],
      });
      break;

    default:
      toast.info(notification.message);
  }
}

// Hook to get unread count
export function useUnreadNotificationsCount(userId: string) {
  const { data } = useNotifications({ userId, realtime: true });

  // Flatten all pages into a single array
  const notifications = data?.pages.flatMap((page) => page.notifications) || [];

  return notifications?.filter((n) => !n.isRead).length || 0;
}

// Hook to mark all notifications as read

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return async (userId: string) => {
    try {
      const count = await markAllAsReadHelper(userId);

      if (count === 0) {
        toast.info("All notifications already read");
        return;
      }

      // Optimistically update cache for infinite query structure
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((n: NotificationType) => ({
              ...n,
              isRead: true,
            })),
          })),
        };
      });

      toast.success(
        `Marked ${count} notification${count > 1 ? "s" : ""} as read`,
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };
}

// Hook to delete a notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return async (notificationId: string, userId: string) => {
    try {
      await deleteNotification(notificationId);

      // Remove from cache (infinite query structure)
      queryClient.setQueryData(["notifications", userId], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.filter(
              (n: NotificationType) => n.id !== notificationId,
            ),
          })),
        };
      });

      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };
}

// Hook to delete all notifications
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return async (userId: string) => {
    try {
      await deleteAllNotifications(userId);

      // Clear cache (infinite query structure)
      queryClient.setQueryData(["notifications", userId], {
        pages: [{ notifications: [], lastDoc: undefined }],
        pageParams: [undefined],
      });

      toast.success("All notifications deleted");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to delete notifications");
    }
  };
}
