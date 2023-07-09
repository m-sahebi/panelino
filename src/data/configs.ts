import { IBM_Plex_Sans } from "next/font/google";
import { nonNullable } from "~/utils/primitive";

export const FONT_SANS = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "Roboto",
    "'Helvetica Neue'",
    "Arial",
    "'Noto Sans'",
    "sans-serif",
    "'Apple Color Emoji'",
    "'Segoe UI Emoji'",
    "'Segoe UI Symbol'",
    "'Noto Color Emoji'",
  ],
});

export const IS_DEV = process.env.NODE_ENV !== "production";
export const IS_SERVER = typeof window === "undefined";

export const BASE_URL = nonNullable(process.env.NEXT_PUBLIC_BASE_URL);
export const API_URL = `${BASE_URL}/api`;

export const PAGE_SIZE = 10;
export const PAGE_SIZE_LIMIT = 100;

export const DATE_TIME_FORMAT = "YYYY-MM-DD HH:mm";

export const REQUEST_TIMEOUT = 10000;

export const FILE_UPLOAD_SIZE_LIMIT = 5000000;

export const IMAGE_MEDIA_TYPE = ".jpg,.jpeg,.png,.webp,.gif";
