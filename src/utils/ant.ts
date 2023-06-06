import { type MenuProps } from "antd";
import type React from "react";

export type AntMenuItem = Required<MenuProps>["items"][number];

export function getAntMenuItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: AntMenuItem[],
  type?: "group",
): AntMenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as AntMenuItem;
}
