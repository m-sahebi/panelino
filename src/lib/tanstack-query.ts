import {
  QueryClient,
  type QueryFunction,
  type QueryFunctionContext,
  type QueryKey,
} from "@tanstack/react-query";
import { message } from "antd";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
import { isObject } from "radash";
import { type SimpleMerge } from "type-fest/source/merge";
import { API_URL, REQUEST_TIMEOUT } from "~/data/configs";
import { generatePath } from "~/utils/generate-path";
import { assertIt } from "~/utils/primitive";

export const request = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export type RqQueryKey = readonly [string, ...object[]];

export function rqFetch<TQueryKey extends QueryKey, TBody>({
  queryKey,
  signal,
  meta,
}: QueryFunctionContext<TQueryKey> & { meta: AxiosRequestConfig<TBody> | undefined }) {
  assertIt(
    typeof queryKey[0] === "string",
    `first element of the queryKey must be a string, received ${typeof queryKey[0]} with value: ${String(
      queryKey[0],
    )}`,
  );
  assertIt(
    queryKey[1] === undefined || isObject(queryKey[1]),
    `second element of the queryKey must be an object, received ${typeof queryKey[0]} with value: ${String(
      queryKey[0],
    )}`,
  );
  return request({
    url: queryKey[0],
    signal,
    params: queryKey[1] || {},
    ...meta,
  }).then((res) => res.data);
}

// TODO use `Record<PathParam<TUrl, string | null> for TPath, but webstorm hangs after importing rqMutate anywhere
export async function rqMutate<
  TBody extends Record<string, unknown> | undefined,
  TUrl extends string,
  TPath extends Record<string, string | null>,
>(
  opt: SimpleMerge<
    AxiosRequestConfig<TBody>,
    {
      invalidatedKeys?: RqQueryKey[];
      url: TUrl;
      path?: TPath;
      toastError?: boolean;
    }
  >,
) {
  const { invalidatedKeys = [], path, url, toastError = true, ...config } = opt;
  await Promise.all(invalidatedKeys.map((key) => queryClient.cancelQueries(key)));
  const res = await request({ ...config, url: generatePath(url, path as any) }).catch(
    (e: AxiosError) => {
      if (toastError) void message.error((e.response?.data as any).message || e.message);
      console.error(e);
      throw e;
    },
  );
  if (!res) return;
  await Promise.all(invalidatedKeys.map((key) => queryClient.invalidateQueries(key)));
  return Promise.resolve(res?.data);
}

export function rqMutation<
  TBody extends Record<string, unknown> | undefined,
  TUrl extends string,
  TPath extends Record<string, string | null>,
>(
  opt: SimpleMerge<
    AxiosRequestConfig<TBody>,
    {
      invalidatedKeys?: RqQueryKey[];
      url: TUrl;
      path?: TPath;
      mutationKey?: RqQueryKey;
      toastError?: boolean;
    }
  >,
) {
  const { invalidatedKeys = [], mutationKey, ...config } = opt;
  return {
    mutationFn(arg: Partial<Parameters<typeof rqMutate>[0]>) {
      return rqMutate({
        invalidatedKeys,
        ...config,
        ...arg,
      });
    },
    mutationKey,
  };
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: rqFetch as QueryFunction<unknown, QueryKey>,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      staleTime: 60000,
      networkMode: "online",
      retry: 3,
    },
  },
});
