import { useSession } from "next-auth/react";
import { type UseSessionOptions } from "next-auth/src/react/types";
import { assertIt } from "~/utils/primitive";

export function useSessionStrict(options?: Omit<UseSessionOptions<true>, "required">) {
  const s = useSession({ ...options, required: true });
  assertIt(s.data, `No session found, session status: ${s.status}`);
  return s;
}
