import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { firebaseApp } from ".";
import { v4 as uuid } from "uuid";
export const storage = getStorage(firebaseApp);

export async function uploadPostImage(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  // Generate a unique file path, e.g. "posts/images/8d2f2b4c-1234.jpg"
  const fileExtension = file.name.split(".").pop() || "jpg";
  const filePath = `posts/${uuid()}.${fileExtension}`;

  const fileRef = ref(storage, filePath);

  // Upload the file as raw bytes
  await uploadBytes(fileRef, file);

  // Get a permanent public download URL
  const downloadUrl = await getDownloadURL(fileRef);

  return downloadUrl;
}

export async function uploadAvatar(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");
  const fileExtension = file.name.split(".").pop() || "jpg";
  const filePath = `avatars/${uuid()}.${fileExtension}`;

  const fileRef = ref(storage, filePath);

  await uploadBytes(fileRef, file);

  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}

export async function uploadWishlistImage(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const fileExtension = file.name.split(".").pop() || "jpg";
  const filePath = `wishlists/${uuid()}.${fileExtension}`;

  const fileRef = ref(storage, filePath);

  await uploadBytes(fileRef, file);

  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
}
