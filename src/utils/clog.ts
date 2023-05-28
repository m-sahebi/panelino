import { type Primitive } from "zod";
import { getStackTrace } from "~/utils/stack-trace";

export function clog(...items: (Primitive | object)[]) {
  return items.forEach((item) =>
    console.log(typeof item === "object" ? JSON.stringify(item, null, 2) : item),
  );
}
export function tlog(...items: (Primitive | object)[]) {
  console.log(`\x1b[37m${getStackTrace()[2]}\x1b[0m`);
  return items.forEach((item) =>
    console.log(typeof item === "object" ? JSON.stringify(item, null, 2) : item),
  );
}
