"use client";

import { Button, Form, Input, InputNumber, Select } from "antd";
import { useMemo, type ReactNode } from "react";
import { z } from "zod";
import { zerialize, type SzObject, type SzType } from "zodex";
import { CustomDatePicker } from "~/components/CustomDatePicker";
import { FilePickerButton } from "~/components/file/FilePickerButton";
import { IS_DEV } from "~/data/configs";
import { UserModel } from "~/data/models/user";
import { SzDataType } from "~/data/types/basic";
import { camelCasePrettify, invariant } from "~/utils/primitive";
import { queryParamsParse } from "~/utils/query-params";
import { cn } from "~/utils/tailwind";

const getSzInputComponent: {
  [p in SzDataType["STRING"] | SzDataType["NUMBER"] | SzDataType["ENUM"] | SzDataType["DATE"]]: (
    sz: SzType,
  ) => ReactNode;
} = {
  [SzDataType.STRING]: (_sz) => {
    const p = queryParamsParse(_sz.description ?? "");
    if ("file" in p) return <FilePickerButton />;
    else return <Input allowClear />;
  },
  [SzDataType.NUMBER]: (_sz) => <InputNumber />,
  [SzDataType.ENUM]: (sz) => {
    invariant(sz.type === SzDataType.ENUM);
    return <Select options={sz.values.map((el: string) => ({ label: el, value: el }))} />;
  },
  [SzDataType.DATE]: (_sz) => <CustomDatePicker />,
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
          t in getSzInputComponent
            ? getSzInputComponent[t as keyof typeof getSzInputComponent]
            : null;
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
              szObject.properties[k].type + (IS_DEV ? " type is not supported" : "")}
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
  imageId: z.string().describe("file=image"),
});
export function FormPage() {
  const sz = zerialize(UserModel);
  return <ZodForm szObject={sz} />;
}
