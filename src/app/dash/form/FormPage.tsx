"use client";

import { Button, Form } from "antd";
import { useMemo } from "react";
import { zerialize, type SzObject, type SzType } from "zodex";
import { globalMessage } from "~/components/Providers/AntProvider";
import { szInputComponent } from "~/components/szInputComponent";
import { IS_DEV } from "~/data/configs";
import { PostModel } from "~/data/models/post";
import { trpc } from "~/lib/trpc";
import { camelCasePrettify } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

export function ZodForm<TShape extends Record<string, SzType>>({
  szObject,
  itemClassName,
}: {
  szObject: SzObject<TShape>;
  itemClassName?: string;
}) {
  const { mutateAsync } = trpc.posts.create.useMutation({
    onSuccess: () => globalMessage.success("Success!"),
  });
  const keys = useMemo(() => Object.keys(szObject.properties), [szObject]);

  return (
    <Form layout="vertical" className="flex flex-col gap-6" onFinish={void mutateAsync}>
      {keys.map((k) => {
        const t = szObject.properties[k].type;
        const input =
          t in szInputComponent ? szInputComponent[t as keyof typeof szInputComponent] : null;
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

// const schema = z.object({
//   name: z.string(),
//   email: z.string().email(),
//   imageId: z.string().describe("file=image"),
// });
export function FormPage() {
  const sz = zerialize(
    PostModel.omit({ createdAt: true, updatedAt: true, deletedAt: true, authorId: true, id: true }),
  );
  return <ZodForm szObject={sz} />;
}
