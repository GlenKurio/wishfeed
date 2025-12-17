import { db } from "@/lib/firebase";
import {
  deleteAllNotifications,
  deleteNotification,
  markAllNotificationsAsRead as markAllAsReadHelper,
  markNotificationAsRead,
} from "@/lib/firebase/firestore/notifications";
import type { NotificationType } from "@/lib/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect } from "react";
import { toast } from "sonner";

// Query options for notifications
export const notificationsQueryOptions = (userId: string) => ({
  queryKey: ["notifications", userId] as const,
  queryFn: async () => {
    return [] as NotificationType[];
  },
  enabled: !!userId,
  staleTime: Infinity,
});

// Hook to get notifications with real-time updates
export function useNotifications({
  userId,
  realtime = true,
  limit: notificationLimit = 20,
}: {
  userId: string;
  realtime?: boolean;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const result = useQuery(notificationsQueryOptions(userId));

  useEffect(() => {
    if (!realtime || !userId) return;

    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(notificationLimit),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications: NotificationType[] = [];
        const previousNotifications =
          queryClient.getQueryData<NotificationType[]>([
            "notifications",
            userId,
          ]) || [];

        const previousIds = new Set(previousNotifications.map((n) => n.id));

        snapshot.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data(),
          } as NotificationType;

          notifications.push(notification);
        });

        // Show toasts only for truly new notifications
        if (previousNotifications.length > 0) {
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

        queryClient.setQueryData(["notifications", userId], notifications);
      },
      (error) => {
        console.error("Error in notifications listener:", error);
        toast.error("Failed to load notifications");
      },
    );

    return () => unsubscribe();
  }, [realtime, userId, queryClient, notificationLimit]);

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
  const { data: notifications } = useNotifications({ userId, realtime: true });

  return notifications?.filter((n) => !n.isRead).length || 0;
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return async (notificationId: string, userId: string) => {
    try {
      await markNotificationAsRead(notificationId, userId);

      // Optimistically update cache
      queryClient.setQueryData<NotificationType[]>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;
          return old.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n,
          );
        },
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };
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

      // Optimistically update cache
      queryClient.setQueryData<NotificationType[]>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;
          return old.map((n) => ({ ...n, isRead: true }));
        },
      );

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

      // Remove from cache
      queryClient.setQueryData<NotificationType[]>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;
          return old.filter((n) => n.id !== notificationId);
        },
      );

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

      // Clear cache
      queryClient.setQueryData<Notification[]>(["notifications", userId], []);

      toast.success("All notifications deleted");
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      toast.error("Failed to delete notifications");
    }
  };
}
