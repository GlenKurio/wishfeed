import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect } from "react";
import { toast } from "sonner";

// Notification type
export type Notification = {
  id: string;
  userId: string;
  type: "gift_reserved" | "gift_sent" | "gift_confirmed" | "gift_cancelled";
  postId: string;
  postTitle?: string;
  postImage?: string;
  actorId?: string; // Who did the action (for confirmed gifts)
  actorName?: string;
  actorHandle?: string;
  actorPhoto?: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
};

// Query options for notifications
export const notificationsQueryOptions = (userId: string) => ({
  queryKey: ["notifications", userId] as const,
  queryFn: async () => {
    // This will be replaced by real-time listener
    return [] as Notification[];
  },
  enabled: !!userId,
  staleTime: Infinity, // Real-time data, never stale
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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications: Notification[] = [];

      snapshot.docChanges().forEach((change) => {
        const notification = {
          id: change.doc.id,
          ...change.doc.data(),
        } as Notification;

        if (change.type === "added") {
          // Show toast for new notifications
          if (!notification.read) {
            showNotificationToast(notification, queryClient);
          }
        }
      });

      // Update all notifications in cache
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
        } as Notification);
      });

      // Update the query cache with real-time data
      queryClient.setQueryData(["notifications", userId], notifications);
    });

    return () => unsubscribe();
  }, [realtime, userId, queryClient, notificationLimit]);

  return result;
}

// Helper to show toast and invalidate queries
function showNotificationToast(
  notification: Notification,
  queryClient: ReturnType<typeof useQueryClient>,
) {
  switch (notification.type) {
    case "gift_reserved":
      toast.info("🎁 " + notification.message, {
        action: {
          label: "View",
          onClick: () => {
            // Navigate to post
            window.location.href = `/post/${notification.postId}`;
          },
        },
      });

      // Invalidate user's posts to refresh gift status
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

      // Invalidate gifts and stats
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

  return notifications?.filter((n) => !n.read).length || 0;
}

// Hook to mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return async (notificationId: string, userId: string) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
      });

      // Optimistically update cache
      queryClient.setQueryData<Notification[]>(
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
    }
  };
}

// Hook to mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return async (userId: string) => {
    try {
      const { data: notifications } = queryClient.getQueryData<{
        data: Notification[];
      }>(["notifications", userId]) || { data: [] };

      if (!notifications) return;

      const unreadNotifications = notifications.filter((n) => !n.read);

      // Update all unread notifications
      await Promise.all(
        unreadNotifications.map((n) =>
          updateDoc(doc(db, "notifications", n.id), { read: true }),
        ),
      );

      // Optimistically update cache
      queryClient.setQueryData<Notification[]>(
        ["notifications", userId],
        (old) => {
          if (!old) return old;
          return old.map((n) => ({ ...n, read: true }));
        },
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark notifications as read");
    }
  };
}
