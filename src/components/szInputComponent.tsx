import { Input, InputNumber, Select } from "antd";
import { type ReactNode } from "react";
import { type SzType } from "zodex";
import { CustomDatePicker } from "~/components/CustomDatePicker";
import { IMAGE_MEDIA_TYPE } from "~/data/configs";
import { SzDataType } from "~/data/types/basic";
import { FilePickerButton } from "~/features/file/components/FilePickerButton";
import { invariant } from "~/utils/primitive";
import { queryParamsParse } from "~/utils/query-params";

export const szInputComponent: {
  [p in SzDataType["STRING"] | SzDataType["NUMBER"] | SzDataType["ENUM"] | SzDataType["DATE"]]: (
    sz: SzType,
  ) => ReactNode;
} = {
  [SzDataType.STRING]: (_sz) => {
    const p = queryParamsParse(_sz.description ?? "");
    if ("file" in p) return <FilePickerButton fileTypes={IMAGE_MEDIA_TYPE} />;
    else return <Input allowClear />;
  },
  [SzDataType.NUMBER]: (_sz) => <InputNumber />,
  [SzDataType.ENUM]: (sz) => {
    invariant(sz.type === SzDataType.ENUM);
    return <Select options={sz.values.map((el: string) => ({ label: el, value: el }))} />;
  },
  [SzDataType.DATE]: (_sz) => <CustomDatePicker />,
};
