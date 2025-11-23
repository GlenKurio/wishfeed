// useAuthListener.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase/auth";

export function useAuthListener() {
  const qc = useQueryClient();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      qc.setQueryData(["auth"], user);
    });

    return () => unsub();
  });
}
