import { useSession } from "next-auth/react";
import { type UseSessionOptions } from "next-auth/src/react/types";
import { assert } from "~/utils/primitive";

export function useSessionStrict(options?: Omit<UseSessionOptions<true>, "required">) {
  const s = useSession({ ...options, required: true });
  assert(s.status === "authenticated");
  return s;
}
