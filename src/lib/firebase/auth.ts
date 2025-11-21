import { queryOptions } from "@tanstack/react-query";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { firebaseApp } from ".";

export const auth = getAuth(firebaseApp);

export const authQueryOptions = queryOptions({
  queryKey: ["auth"],
  queryFn: () =>
    new Promise((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        resolve(user);
        unsub(); // immediate cleanup; we'll re-subscribe below
      });
    }),
  staleTime: Infinity,
});
