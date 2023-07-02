import { FileOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, type FormInstance, type MenuProps } from "antd";
import Image from "next/image";
import React from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { CustomDropdown } from "~/components/CustomDropdown";
import { modalForm } from "~/components/modals/modalForm";
import { globalMessage, globalModal } from "~/components/Providers/AntdProvider";
import { rqMutation } from "~/lib/tanstack-query";
import { fileNameExtSplit } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";
import { type Nullish } from "~/utils/type";

type Props = {
  width?: number;
  fileId: string;
  fileName: string;
  fileMimeType?: Nullish<string>;
  formInstance: FormInstance<{ name: string }>;
  className?: string;
  onContextMenu?: (open: boolean, id: string, contextMenuItems: MenuProps["items"]) => boolean;
};
export const FileIcon = React.memo(function FileIcon({
  width = 7,
  fileId,
  fileName,
  fileMimeType,
  formInstance,
  className,
  onContextMenu,
}: Props) {
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "DELETE", invalidatedKeys: [["/files"]] }),
  );
  const { mutateAsync: updateFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "PATCH", invalidatedKeys: [["/files"]] }),
  );

  const [filePureName, fileExt] = fileNameExtSplit(fileName);

  const items: MenuProps["items"] = [
    {
      label: "Open",
      key: "0",
      onClick: (ev) => {
        ev.domEvent.stopPropagation();
        window.open(`/api/files/${fileId}`, "_blank");
      },
    },
    {
      label: "Rename",
      key: "1",
      onClick: (ev) => {
        ev.domEvent.stopPropagation();
        formInstance.setFieldsValue({ name: filePureName });
        modalForm({
          form: formInstance,
          type: "confirm",
          title: `Rename "${fileName}"`,
          content: (
            <Form form={formInstance} initialValues={{ name: "" }}>
              <Form.Item
                className="m-0"
                name="name"
                rules={[{ required: true, type: "string", whitespace: false }]}
              >
                <Input ref={(el) => setTimeout(() => el?.focus(), 0)} addonAfter={"." + fileExt} />
              </Form.Item>
            </Form>
          ),
          onOk: async (form) => updateFile({ path: { id: fileId }, data: form.getFieldsValue() }),
        });
      },
    },
    {
      label: "Delete",
      key: "2",
      className: "text-daw-red-500",
      onClick: (ev) => {
        ev.domEvent.stopPropagation();
        globalModal.confirm({
          type: "warn",
          title: `Delete "${fileName}"?`,
          onOk: () =>
            deleteFile({ path: { id: fileId } }).then(
              () => void globalMessage.success(`Deleted ${fileId}`),
            ),
        });
      },
    },
  ];

  return (
    <CustomDropdown
      // ref={dropdownRef}
      targetClassName={cn(`group relative flex flex-col gap-4 p-2`, className)}
      targetStyle={{ width: `calc(${width}rem + 8px)` }}
      renderChildren={(c) => (
        <div
          onKeyDown={console.log}
          className={cn(`group relative flex flex-col gap-4 p-2`, className)}
          style={{ width: `calc(${width}rem + 8px)` }}
        >
          {c}
        </div>
      )}
      menu={{ items }}
      trigger={["contextMenu"]}
      onOpenChange={(o) => {
        return onContextMenu?.(o, fileId, items);
      }}
    >
      <CustomDropdown
        menu={{ items }}
        trigger={["click", "contextMenu"]}
        renderChildren={() => (
          <Button
            icon={<FiMoreHorizontal />}
            onClick={(ev) => ev.preventDefault()}
            onDoubleClick={(ev) => ev.preventDefault()}
            className="absolute right-1 top-1 text-lg"
            type="text"
          />
        )}
        onOpenChange={(o) => {
          return onContextMenu?.(o, fileId, items);
        }}
      />
      <div className="flex w-full items-center justify-center" style={{ height: `${width}rem` }}>
        {fileMimeType?.startsWith("image") ? (
          <Image
            draggable={false}
            width={width * 16}
            height={width * 16}
            src={`/api/files/${fileId}`}
            alt={`An image file with name: ${fileName}`}
            className="max-h-full max-w-full object-contain transition-all"
          />
        ) : (
          <FileOutlined
            className="transition-all text-daw-blue-500"
            style={{ fontSize: `${width / 1.4}rem` }}
          />
        )}
      </div>
      <label
        id={`file_${fileId}`}
        title={fileName}
        className="flex w-full justify-center text-xs font-normal"
      >
        <span className="max-w-full flex-shrink truncate">{filePureName}</span>.{fileExt}
      </label>
    </CustomDropdown>
  );
});
