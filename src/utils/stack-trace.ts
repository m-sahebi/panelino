export function getStackTrace() {
  const stack = Error().stack ?? "";

  const stackArray = stack.split("\n").map(function (line) {
    return line.trim();
  });
  return stackArray.splice(stack[0] == "Error" ? 2 : 1);
}
