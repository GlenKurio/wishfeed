import { useAuth } from "@/hooks/use-auth";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/use-notifications";
import type { NotificationType } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_protected/(notifications)/notifications",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const user = useAuth();

  const { data: notifications, isLoading } = useNotifications({
    userId: user?.uid || "",
    realtime: true,
  });
  const unreadCount = useUnreadNotificationsCount(user?.uid || "");
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  if (!user) return null;

  return (
    <div>
      <button onClick={() => markAllAsRead(user.uid)}>
        Mark all as read ({unreadCount})
      </button>

      {notifications?.map((notification) => (
        <div
          key={notification.id}
          onClick={() => markAsRead(notification.id, user.uid)}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}
