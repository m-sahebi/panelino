import { DatePicker } from "antd";
import { type PickerDateProps } from "antd/es/date-picker/generatePicker";
import { type Dayjs } from "dayjs";
import { type SimpleMerge } from "type-fest/source/merge";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { dayjs } from "~/lib/dayjs";
import { type Nullish } from "~/utils/type";

export function CustomDatePicker({
  value,
  onChange,
  ...p
}: SimpleMerge<
  PickerDateProps<Dayjs>,
  {
    onChange?: (dateStr: String | Nullish) => void;
    value?: string | Nullish;
  }
>) {
  return (
    <DatePicker
      {...p}
      format={DATE_TIME_FORMAT}
      showTime={{ format: "HH:mm" }}
      value={value ? dayjs(value) : null}
      onChange={(val) => {
        onChange?.(val?.toISOString());
      }}
    />
  );
}
