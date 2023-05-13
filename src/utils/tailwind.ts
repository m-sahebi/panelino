import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function cnMerge(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
