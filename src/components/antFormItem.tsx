import { Form, Input, InputNumber, Select, Switch } from "antd";
import { type SzType } from "zodex";
import { camelCasePrettify } from "~/utils/primitive";

export const AntFormItem: Record<
  "string" | "number" | "union" | "enum" | "boolean",
  (p: string, t: SzType) => React.ReactNode
> = {
  ["string"]: (p, t) => (
    <Form.Item
      className="m-0"
      key={p}
      name={p}
      label={camelCasePrettify(p)}
      rules={[{ required: !t.isOptional }]}
    >
      <Input />
    </Form.Item>
  ),
  ["number"]: (p, t) => (
    <Form.Item
      className="m-0"
      key={p}
      name={p}
      label={camelCasePrettify(p)}
      rules={[{ required: !t.isOptional }]}
    >
      <InputNumber className="w-full" />
    </Form.Item>
  ),
  ["union"]: (p, t) => {
    return (
      <Form.Item
        className="m-0"
        key={p}
        name={p}
        label={camelCasePrettify(p)}
        rules={[{ required: !t.isOptional }]}
      >
        <Select
          allowClear={t.isOptional}
          options={(t as { options: any[] }).options.map((el) => ({
            label: camelCasePrettify(el.value),
            value: el.value,
          }))}
        />
      </Form.Item>
    );
  },
  ["enum"]: (p, t) => {
    return (
      <Form.Item
        className="m-0"
        key={p}
        name={p}
        label={camelCasePrettify(p)}
        rules={[{ required: !t.isOptional }]}
      >
        <Select
          allowClear={t.isOptional}
          options={(t as { values: any[] }).values.map((el) => ({
            label: camelCasePrettify(el),
            value: el,
          }))}
        />
      </Form.Item>
    );
  },
  ["boolean"]: (p, t) => (
    <Form.Item
      className="m-0"
      key={p}
      name={p}
      label={camelCasePrettify(p)}
      rules={[{ required: !t.isOptional }]}
    >
      <Switch />
    </Form.Item>
  ),
};
