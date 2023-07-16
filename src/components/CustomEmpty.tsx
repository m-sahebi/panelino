import { Empty, type EmptyProps } from "antd";

export function CustomEmpty(p: EmptyProps) {
  return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} {...p} />;
}
