import { type DatePickerProps, type MenuProps, type Select } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";
import type React from "react";
import { type Component, type RefObject } from "react";

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

export type SelectRef<
  // TODO it's a bug in eslint that marks T as unused
  // eslint-disable-next-line unused-imports/no-unused-vars
  T = Exclude<Parameters<typeof Select>[0]["ref"], undefined | null | Function>,
> = T extends RefObject<infer T> ? T : never;
export type RangePickerRef = Component<RangePickerProps>;
export type DatePickerRef = Component<DatePickerProps>;
