import type React from "react";
import { createElement } from "react";
import { type AntMenuItem } from "~/data/types/component";

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
