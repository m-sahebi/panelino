export function toNumber(str: unknown): number | undefined;
export function toNumber(str: unknown, defaultValue: number): number;
export function toNumber(str: unknown, defaultValue: undefined): number | undefined;
export function toNumber(str: unknown, defaultValue: number | undefined = undefined) {
  if (!str) return defaultValue;

  const num = +str;
  if (Number.isNaN(num)) return defaultValue;

  return num;
}
