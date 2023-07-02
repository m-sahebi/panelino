"use client";

import { Button, DatePicker, Form, Input, InputNumber, Select } from "antd";
import { useMemo, type ReactNode } from "react";
import { z } from "zod";
import { zerialize, type SzObject, type SzType } from "zodex";
import { SzDataType } from "~/data/types/basic";
import { camelCasePrettify, invariant } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

const getInputComponent: {
  [p in SzDataType["STRING"] | SzDataType["NUMBER"] | SzDataType["ENUM"] | SzDataType["DATE"]]: (
    sz: SzType,
  ) => ReactNode;
} = {
  [SzDataType.STRING]: (_sz) => <Input allowClear />,
  [SzDataType.NUMBER]: (_sz) => <InputNumber />,
  [SzDataType.ENUM]: (sz) => {
    invariant(sz.type === SzDataType.ENUM);
    return <Select options={sz.values.map((el: string) => ({ label: el, value: el }))} />;
  },
  [SzDataType.DATE]: (_sz) => <DatePicker.RangePicker />,
};

export function ZodForm<TShape extends Record<string, SzType>>({
  szObject,
  itemClassName,
}: {
  szObject: SzObject<TShape>;
  itemClassName?: string;
}) {
  const keys = useMemo(() => Object.keys(szObject.properties), [szObject]);

  return (
    <Form layout="vertical" className="flex flex-col gap-6" onFinish={console.log}>
      {keys.map((k) => {
        const t = szObject.properties[k].type;
        const input =
          t in getInputComponent ? getInputComponent[t as keyof typeof getInputComponent] : null;
        return (
          <Form.Item
            className={cn("m-0", itemClassName)}
            key={k}
            name={k}
            label={camelCasePrettify(k)}
            rules={[
              {
                required: !szObject.properties[k].isOptional,
                type: ["email", "url"].includes((szObject.properties[k] as { kind: string }).kind)
                  ? (szObject.properties[k] as { kind: "email" | "url" }).kind
                  : undefined,
              },
            ]}
          >
            {input?.(szObject.properties[k]) ||
              szObject.properties[k].type + " type is not supported"}
          </Form.Item>
        );
      })}
      <Button type="primary" htmlType="submit" className="self-start">
        Submit
      </Button>
    </Form>
  );
}

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  imageId: z.string().describe("file=image").optional(),
});
export function FormPage() {
  return <ZodForm szObject={zerialize(schema)} />;
}
