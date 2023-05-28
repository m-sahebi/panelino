import { isArray } from "radash";
import { z, ZodFirstPartyTypeKind, type Primitive } from "zod";

import { zCreateUnionSchema, zParseDef } from "~/utils/zod";

function deepCheckTypeNotInObject(
  obj: Record<string, any>,
  forbiddenTypes: ("function" | "object" | Primitive)[] = ["function"],
  path = "",
): string | undefined {
  if (isArray(obj)) {
    for (const el of obj) {
      if (typeof el === "object") {
        return deepCheckTypeNotInObject(el as object, forbiddenTypes, path ? path + ".arr" : "arr");
      }
      if (forbiddenTypes.includes(typeof el))
        return (path ? path + ".arr" : "arr") + " is " + typeof el;
    }
  } else {
    for (const p in obj) {
      if (typeof obj[p] === "object") {
        return deepCheckTypeNotInObject(obj[p], forbiddenTypes, path ? path + "." + p : p);
      }
      if (forbiddenTypes.includes(typeof obj[p]))
        return (path ? path + "." + p : p) + " is " + typeof obj[p];
    }
  }
  return undefined;
}

describe("zParseDef()", () => {
  const pd1 = zParseDef(z.number().describe("bye").min(3).optional().describe("hi")._def);
  const pd2 = zParseDef(z.string().max(30).email().nullable().describe("hi there")._def);
  const pd3 = zParseDef(z.number().nullish()._def);

  it("has proper typeName", () => {
    expect(pd1.typeName).toBe(ZodFirstPartyTypeKind.ZodNumber);
    expect(pd2.typeName).toBe(ZodFirstPartyTypeKind.ZodString);
  });
  it("is optional", () => {
    expect(pd1.optional).toBe(true);
    expect(pd1.nullable).toBe(undefined);
    expect(pd1.nullish).toBe(true);
  });
  it("is nullable", () => {
    expect(pd2.optional).toBe(undefined);
    expect(pd2.nullable).toBe(true);
    expect(pd2.nullish).toBe(true);
  });
  it("is nullish", () => {
    expect(pd3.optional).toBe(true);
    expect(pd3.nullable).toBe(true);
    expect(pd3.nullish).toBe(true);
  });
  it("has description", () => {
    expect(pd1.description).toBe("hi");
    expect(pd2.description).toBe("hi there");
  });

  const s = z
    .object({
      s: z.number().min(3).max(6).optional(),
      p: z.array(z.string().nullable()),
      o: z.object({
        o1: z.date(),
        o2: z.null().nullish(),
        o3: z.object({ oo1: z.number().optional() }).nullable(),
      }),
      u: zCreateUnionSchema(["first", "second"]),
    })
    .optional();
  const parsedDef = zParseDef(s._def);

  it("is (almost) serializable", () => {
    expect(deepCheckTypeNotInObject(parsedDef)).toBeUndefined();
  });

  it("match whole result", () => {
    expect(parsedDef).toEqual({
      keys: expect.arrayContaining(["p", "s", "o", "u"]),
      obj: {
        s: {
          checks: expect.arrayContaining([
            {
              kind: "min",
              value: 3,
              inclusive: true,
            },
            {
              kind: "max",
              value: 6,
              inclusive: true,
            },
          ]),
          typeName: "ZodNumber",
          coerce: false,
          optional: true,
          nullish: true,
        },
        p: {
          arr: {
            checks: [],
            typeName: "ZodString",
            coerce: false,
            nullable: true,
            nullish: true,
          },
        },
        o: {
          keys: expect.arrayContaining(["o2", "o3"]),
          obj: {
            o1: {
              checks: [],
              coerce: false,
              typeName: "ZodDate",
            },
            o2: {
              typeName: "ZodNull",
              optional: true,
              nullable: true,
              nullish: true,
            },
            o3: {
              keys: ["oo1"],
              obj: {
                oo1: {
                  checks: [],
                  typeName: "ZodNumber",
                  coerce: false,
                  optional: true,
                  nullish: true,
                },
              },
              nullable: true,
              nullish: true,
            },
          },
        },
        u: {
          options: [
            {
              typeName: "ZodLiteral",
              value: "first",
            },
            {
              typeName: "ZodLiteral",
              value: "second",
            },
          ],
        },
      },
      optional: true,
      nullish: true,
    });
  });
});
