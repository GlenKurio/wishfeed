import { useAuth } from "@/hooks/use-auth";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/use-notifications";
import { IconBellRinging2, IconBellRinging2Filled } from "@tabler/icons-react";

export default function NotificationsDropdown() {
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
    <div className="dropdown dropdown-end rounded-sm!">
      <div
        className="tooltip tooltip-left tooltip-primary"
        data-tip="Notifications"
      >
        <div className="indicator">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost rounded-full p-2.5"
            onClick={() => markAllAsRead(user.uid)}
          >
            {unreadCount > 0 ? (
              <IconBellRinging2Filled className="text-primary size-5 animate-pulse" />
            ) : (
              <IconBellRinging2 className="size-5" />
            )}
            <span className="sr-only">Notifications</span>
          </div>
        </div>
      </div>

      <div
        tabIndex={-1}
        className="dropdown-content menu bg-base-100 z-1 w-[500px] rounded-3xl p-2 shadow-sm"
      >
        {notifications?.map((notification) => (
          <div
            key={notification.id}
            onClick={() => markAsRead(notification.id, user.uid)}
          >
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}
