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
  IconHeartFilled,
  IconUserPlus,
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

  const handleDropdownClose = () => {
    if (unreadCount > 0 && user?.uid) {
      markAllAsRead(user.uid);
    }
  };

  if (!user) return null;

  return (
    <div className="dropdown dropdown-end">
      <summary
        onBlur={handleDropdownClose}
        tabIndex={0}
        className="btn btn-ghost list-none rounded-full p-2.5"
      >
        <div
          className="tooltip tooltip-left tooltip-primary"
          data-tip="Notifications"
        >
          <div className="indicator">
            {unreadCount > 0 ? (
              <IconBellRinging2Filled className="text-primary size-5 animate-pulse" />
            ) : (
              <IconBellRinging2 className="size-5" />
            )}
            <span className="sr-only">Notifications</span>
          </div>
        </div>
      </summary>

      <div
        tabIndex={-1}
        className="dropdown-content menu bg-base-100 border-primary z-1 mt-3 w-[350px] overflow-hidden rounded-3xl border-dashed p-0 shadow-md md:w-[400px] lg:w-[500px]"
      >
        <p className="bg-primary text-base-100 w-full p-4 text-xl font-bold tracking-wide">
          Notifications
        </p>
        {/* Notifications List */}
        <div className="flex max-h-[500px] w-full flex-col gap-1 overflow-y-auto p-2">
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

  const isUnread = !notification.isRead;

  const getNotificationIcon = () => {
    switch (notification.kind) {
      case "like":
        return (
          <div className="bg-primary rounded-full p-1">
            <IconHeartFilled className="text-base-100 size-3.5" />
          </div>
        );

      case "follow":
        return (
          <div className="bg-accent rounded-full p-1">
            <IconUserPlus className="text-base-content/60 size-3.5" />
          </div>
        );

      default:
        return (
          <div className="bg-info rounded-full p-1">
            <IconBell className="text-base-content/60 size-3.5" />
          </div>
        );
    }
  };

  return (
    <Link
      to="/profile/$userId/$wishlist"
      params={{ userId: notification.actorId, wishlist: "all" }}
      className={`group hover:bg-primary/10 flex cursor-pointer gap-3 rounded-2xl px-2 py-2 transition-colors last:border-0 ${
        isUnread ? "bg-primary/5 border-primary border-l-2" : ""
      }`}
    >
      {/* Avatar */}
      <div className="relative">
        <Avatar src={notification.actorPhotoURL} className="size-12 shrink-0" />
        <div className="absolute -right-1 bottom-2 flex h-5 w-5 items-center justify-center rounded-full">
          {getNotificationIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Actor info row with proper truncation */}
        <div className="flex min-w-0 items-baseline overflow-hidden">
          <span
            className={`shrink-0 truncate ${
              isUnread
                ? "text-base-content font-bold"
                : "text-base-content font-semibold"
            }`}
          >
            {notification.actorName}
          </span>
          <span className="text-base-content/60 min-w-0 flex-1 truncate text-sm font-medium">
            {notification.actorHandle}
          </span>
        </div>

        {/* Message */}
        <p
          className={`line-clamp-2 text-xs leading-relaxed wrap-break-word ${
            isUnread ? "text-base-content font-medium" : "text-base-content/80"
          }`}
        >
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
