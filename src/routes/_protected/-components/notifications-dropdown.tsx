import Avatar from "@/components/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  useMarkAllNotificationsAsRead,
  useNotifications,
  useUnreadNotificationsCount,
} from "@/hooks/use-notifications";
import type { NotificationType } from "@/lib/types";
import {
  IconBell,
  IconBellRinging2,
  IconBellRinging2Filled,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
export default function NotificationsDropdown() {
  const user = useAuth();

  const { data: notifications, isLoading } = useNotifications({
    userId: user?.uid || "",
    realtime: true,
  });

  const unreadCount = useUnreadNotificationsCount(user?.uid || "");
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
        className="dropdown-content menu bg-base-100 border-primary z-1 w-[350px] rounded-3xl border-2 border-dashed shadow-md md:w-[400px] lg:w-[500px]"
      >
        {/* Notifications List */}
        <div className="max-h-[500px] w-full overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <div className="text-base-content flex flex-col items-center justify-center py-12 text-center">
              <IconBell className="mb-3 size-12" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-base-content/70 mt-1 text-xs">
                {"We'll notify you when something arrives!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
}: {
  notification: NotificationType;
}) {
  // Format timestamp
  const timestamp = formatDistanceToNow(notification.createdAt.toDate(), {
    addSuffix: true,
  });

  return (
    <Link
      to="/profile/$userId/$wishlist"
      params={{ userId: notification.actorId, wishlist: "all" }}
      className={`group hover:bg-primary/10 flex cursor-pointer gap-3 rounded-2xl px-2 py-2 transition-colors last:border-0`}
    >
      {/* Avatar */}
      <Avatar src={notification.actorPhotoURL} className="size-10 shrink-0" />

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Actor info row with proper truncation */}
        <div className="flex min-w-0 items-baseline overflow-hidden">
          <span className="text-base-content shrink-0 truncate font-semibold">
            {notification.actorName}
          </span>
          <span className="text-base-content/60 min-w-0 flex-1 truncate text-sm font-medium">
            {notification.actorHandle}
          </span>
        </div>

        {/* Message */}
        <p className="text-base-content/80 line-clamp-2 text-xs leading-relaxed wrap-break-word">
          {notification.message}
        </p>

        {/* Timestamp */}
        <span className="text-base-content/50 mt-auto text-xs font-medium">
          {timestamp}
        </span>
      </div>
    </Link>
  );
}
