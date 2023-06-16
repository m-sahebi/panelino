import { type DatePickerProps, type MenuProps, type Select } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";
import type Link from "next/link";
import type React from "react";
import { createElement, type Component, type RefObject } from "react";

export type AntMenuItem = Required<MenuProps>["items"][number];

export function getAntMenuItem<T extends object>(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.FunctionComponent<T>,
  children?: AntMenuItem[],
  type?: "group",
): AntMenuItem {
  const el = icon && createElement(icon);
  return {
    key,
    icon: el,
    children,
    label,
    type,
  } as AntMenuItem;
}

export type CustomLinkProps<T = typeof Link> = T extends React.ForwardRefExoticComponent<infer I>
  ? I
  : never;

export type SelectRef<
  T = Exclude<Parameters<typeof Select>[0]["ref"], undefined | null | Function>,
> = T extends RefObject<infer I> ? I : never;
export type RangePickerRef = Component<RangePickerProps>;
export type DatePickerRef = Component<DatePickerProps>;
