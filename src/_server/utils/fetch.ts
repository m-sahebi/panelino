import "~/_server/utils/server-only";
import { cookies, headers as getHeaders } from "next/headers";
import { API_URL } from "~/data/configs";

const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function getRawToken() {
  return cookies().get("next-auth.session-token")?.value;
}

export function getServersideHeaders(headers: string[] = ["Cookie"]) {
  const headersInit = new Headers();
  const headersList = getHeaders();
  headers.forEach((key) => {
    const header = headersList.get(key);
    if (header) headersInit.set(key, header);
  });
  return headersInit;
}

export async function tFetch<T>(...args: Parameters<typeof fetch>) {
  const url =
    (typeof args[0] === "string" && !ABSOLUTE_URL_REGEX.test(args[0]) && `${API_URL}/${args[0]}`) ||
    args[0];
  const res = await fetch(url, { headers: getServersideHeaders(), ...args[1] });
  const result = await res.json();
  if (!res.ok) {
    return { data: null, error: result, res };
  }
  return { data: result as T, error: null, res };
}
