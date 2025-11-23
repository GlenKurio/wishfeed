import { useQuery } from "@tanstack/react-query";
import { authQueryOptions } from "../lib/firebase/auth";

export function useAuth() {
  return useQuery(authQueryOptions).data;
}
