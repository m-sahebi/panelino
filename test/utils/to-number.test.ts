import { toNumber } from "~/utils/to-number";

describe("toNumber()", function () {
  it("with bad value", function () {
    const n1 = toNumber("asdf");
    expect(n1).toBeUndefined();
    const n2 = toNumber({}, 56);
    expect(n2).toBe(56);
  });

  it("with valid value", function () {
    const n1 = toNumber("123", 46);
    expect(n1).toBe(123);
  });
});
