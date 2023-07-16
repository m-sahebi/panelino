import { type FormInstance } from "antd";
import { type ModalFuncProps } from "antd/es/modal/interface";
import { type SimpleMerge } from "type-fest/source/merge";
import { globalModal } from "~/components/configs/Providers/AntProvider";
import { cn } from "~/utils/tailwind";

export function modalForm<T>({
  form,
  ...p
}: SimpleMerge<
  ModalFuncProps,
  {
    form: FormInstance<T>;
    onOk: (form: FormInstance<T>) => ReturnType<NonNullable<ModalFuncProps["onOk"]>>;
    onCancel?: (
      form: FormInstance<T>,
      close: () => void,
    ) => ReturnType<NonNullable<ModalFuncProps["onCancel"]>>;
  }
>) {
  return globalModal.confirm({
    icon: null,
    ...p,
    wrapClassName: cn(p.wrapClassName, "full-modal-confirm-content"),
    afterClose: () => {
      form.resetFields();
      p.afterClose?.();
    },
    onOk: async () => {
      await form.validateFields({ validateOnly: false });
      return p.onOk?.(form);
    },
  });
}
