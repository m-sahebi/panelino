import { MenuProps } from "antd";
import React from "react";

export type AntdMenuItem = Required<MenuProps>["items"][number];

export function getAntdMenuItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: AntdMenuItem[],
  type?: "group"
): AntdMenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as AntdMenuItem;
}
