import { useSession } from "next-auth/react";
import { type UseSessionOptions } from "next-auth/src/react/types";
import { invariant } from "~/utils/primitive";

export function useSessionStrict(options?: Omit<UseSessionOptions<true>, "required">) {
  const s = useSession({ ...options, required: true });
  invariant(s.data, `No session found, session status: ${s.status}`);
  return s;
}
