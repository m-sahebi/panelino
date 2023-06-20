import { QueryClient, type QueryFunctionContext } from "@tanstack/react-query";
import axios, { type AxiosRequestConfig } from "axios";
import { isObject } from "radash";
import { API_URL, REQUEST_TIMEOUT } from "~/data/configs";
import { assertIt } from "~/utils/primitive";

export const request = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export function rqFetch<TQueryKey extends readonly unknown[], TBody>({
  queryKey,
  signal,
  meta,
}: QueryFunctionContext<TQueryKey> & { meta: AxiosRequestConfig<TBody> | undefined }) {
  assertIt(typeof queryKey[0] === "string");
  assertIt(queryKey[1] === undefined || isObject(queryKey[1]));
  return request({
    url: queryKey[0],
    signal,
    params: queryKey[1] || {},
    ...meta,
  }).then((res) => res.data);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: rqFetch,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 60000,
      networkMode: "online",
      retry: 3,
    },
    mutations: {},
  },
});
