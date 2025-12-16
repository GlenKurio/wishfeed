// useAuthListener.ts
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../lib/firebase/auth";
import { createUserProfile } from "../lib/firebase/firestore/users";

export function useAuthListener() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      qc.setQueryData(["auth"], user);
      if (user) {
        await createUserProfile(user);
      }
    });

    return () => unsub();
  });
}
