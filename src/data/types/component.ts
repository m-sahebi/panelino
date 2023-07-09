import { type MenuProps, type Select } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";
import { type PickerDateProps, type PickerTimeProps } from "antd/es/date-picker/generatePicker";
import { MessageInstance } from "antd/es/message/interface";
import { type ModalStaticFunctions } from "antd/es/modal/confirm";
import { type Dayjs } from "dayjs";
import type Link from "next/link";
import { type Component, type RefObject } from "react";
import type React from "react";

export type CustomLinkProps<T = typeof Link> = T extends React.ForwardRefExoticComponent<infer I>
  ? I
  : never;

export type AntMenuItem = Required<MenuProps>["items"][number];

export type DatePickerProps = PickerDateProps<Dayjs>;
export type TimePickerProps = PickerTimeProps<Dayjs>;

export type SelectRef<
  T = Exclude<Parameters<typeof Select>[0]["ref"], undefined | null | Function>,
> = T extends RefObject<infer I> ? I : never;
export type RangePickerRef = Component<RangePickerProps>;
export type DatePickerRef = Component<DatePickerProps>;

export type ModalFactory = Omit<ModalStaticFunctions, "warn">;
export type MessageFactory = MessageInstance;
