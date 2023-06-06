import { type Primitive } from "zod";

export function clog(...items: (Primitive | object)[]) {
  return items.forEach((item) =>
    console.log(typeof item === "object" ? JSON.stringify(item, null, 2) : item),
  );
}

export function getStackTrace() {
  const stack = Error().stack ?? "";

  const stackArray = stack.split("\n").map(function (line) {
    return line.trim();
  });
  return stackArray.splice(stack[0] == "Error" ? 2 : 1);
}

export function tlog(...items: (Primitive | object)[]) {
  console.log(`\x1b[37m${getStackTrace()[2]}\x1b[0m`);
  return items.forEach((item) =>
    console.log(typeof item === "object" ? JSON.stringify(item, null, 2) : item),
  );
}
