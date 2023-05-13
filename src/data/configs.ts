export const IS_DEV = process.env.NODE_ENV !== "production";
export const IS_SERVER = typeof window === "undefined";

export const APP_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export const API_URL = `${APP_BASE_URL}/api`;

export const PAGE_SIZE = 10;
