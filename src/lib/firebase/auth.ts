import { queryOptions } from "@tanstack/react-query";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { firebaseApp } from ".";

export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

export const authQueryOptions = queryOptions<User | null>({
  queryKey: ["auth"],
  queryFn: () =>
    new Promise<User | null>((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        resolve(user);
        unsub();
      });
    }),
  staleTime: Infinity,
});
