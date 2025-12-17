import {
  NotificationSchema,
  type NotificationSchemaType,
  type NotificationType,
} from "@/lib/types";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "..";
import { auth } from "../auth";

export async function createNotification(notification: NotificationSchemaType) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const validatedNotification = NotificationSchema.parse(notification);

  const newNotificationRef = doc(collection(db, "notifications"));

  await setDoc(newNotificationRef, {
    ...validatedNotification,
    id: newNotificationRef.id,
    createdAt: serverTimestamp(),
  });
}

// Delete a single notification
export async function deleteNotification(notificationId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const notificationRef = doc(db, "notifications", notificationId);

  // Verify the notification belongs to the current user
  const notificationSnap = await getDoc(notificationRef);
  if (!notificationSnap.exists()) {
    throw new Error("Notification not found");
  }

  const notificationData = notificationSnap.data();
  if (notificationData.userId !== currentUser.uid) {
    throw new Error("Unauthorized to delete this notification");
  }

  await deleteDoc(notificationRef);
}

// Delete all notifications for current user
export async function deleteAllNotifications(userId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

// Mark a notification as read
export async function markNotificationAsRead(
  notificationId: string,
  userId: string,
) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, {
    isRead: true,
  });
}

// Mark a notification as unread
export async function markNotificationAsUnread(
  notificationId: string,
  userId: string,
) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, {
    isRead: false,
  });
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("isRead", "==", false),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });

  await batch.commit();

  return snapshot.size; // Return count of updated notifications
}

// Get notifications for a user (non-realtime)
export async function getNotifications(
  userId: string,
  options?: {
    limitCount?: number;
    onlyUnread?: boolean;
  },
) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationsRef = collection(db, "notifications");
  let q = query(
    notificationsRef,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  if (options?.onlyUnread) {
    q = query(q, where("isRead", "==", false));
  }

  if (options?.limitCount) {
    q = query(q, limit(options.limitCount));
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as NotificationType[];
}

// Get unread count
export async function getUnreadNotificationsCount(userId: string) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("isRead", "==", false),
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Delete old read notifications (cleanup utility)
export async function deleteOldReadNotifications(
  userId: string,
  olderThanDays: number = 30,
) {
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error("Not authenticated");
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const notificationsRef = collection(db, "notifications");
  const q = query(
    notificationsRef,
    where("userId", "==", userId),
    where("isRead", "==", true),
    where("createdAt", "<", Timestamp.fromDate(cutoffDate)),
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return 0;

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  return snapshot.size; // Return count of deleted notifications
}
