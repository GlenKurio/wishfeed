// useAuthListener.ts
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../lib/firebase/auth";

export function useAuthListener() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      qc.setQueryData(["auth"], user);
    });

    return () => unsub();
  });
}
