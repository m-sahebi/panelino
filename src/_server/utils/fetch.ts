import { headers as getHeaders } from "next/headers";
import { API_URL } from "~/data/configs";
import "~/_server/utils/server-only";

const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function getServersideHeaders(headers: string[] = ["Cookie"]) {
  const headersInit = new Headers();
  const headersList = getHeaders();
  headers.forEach((key) => {
    const header = headersList.get(key);
    if (header) headersInit.set(key, header);
  });
  return headersInit;
}

export function tFetch<T>(...args: Parameters<typeof fetch>): Promise<T> {
  const url =
    (typeof args[0] === "string" &&
      !ABSOLUTE_URL_REGEX.test(args[0]) &&
      `${API_URL}/${args[0]}`) ||
    args[0];
  return fetch(url, { headers: getServersideHeaders(), ...args[1] }).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  });
}
