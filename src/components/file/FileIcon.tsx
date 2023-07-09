import { CloseCircleOutlined, FileOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Divider, Form, Input, Tooltip, type FormInstance, type MenuProps } from "antd";
import Image from "next/image";
import React, { useMemo, type ReactNode } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useToggle } from "react-use";
import { CustomDropdown } from "~/components/CustomDropdown";
import { modalForm } from "~/components/modals/modalForm";
import { globalMessage, globalModal } from "~/components/Providers/AntdProvider";
import { rqMutation } from "~/lib/tanstack-query";
import { fileNameExtSplit, formatBytes } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";
import { type Nullish } from "~/utils/type";

type Props = {
  width?: number;
  fileId: string;
  fileName: string;
  fileSize: number;
  fileMimeType?: Nullish<string>;
  formInstance: FormInstance<{ name: string }>;
  className?: string;
  onContextMenu?: (open: boolean, id: string, contextMenuItems: MenuProps["items"]) => boolean;
  onDelete?: (fileId: string) => void;
  selectable?: boolean;
  selected?: boolean;
};
export const FileIcon = React.memo(function FileIcon({
  width = 7,
  fileId,
  fileName,
  fileSize,
  fileMimeType,
  formInstance,
  className,
  onContextMenu,
  onDelete,
  selectable = false,
  selected = false,
}: Props) {
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "DELETE", invalidatedKeys: [["/files"]] }),
  );
  const { mutateAsync: updateFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "PATCH", invalidatedKeys: [["/files"]] }),
  );

  const [fileInfoOpened, toggleFileInfoOpened] = useToggle(false);

  const [filePureName, fileExt] = fileNameExtSplit(fileName);

  const items: MenuProps["items"] = useMemo(
    () => [
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
                  <Input
                    ref={(el) => setTimeout(() => el?.focus(), 0)}
                    addonAfter={"." + fileExt}
                  />
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
              deleteFile({ path: { id: fileId } }).then(() => {
                void globalMessage.success(`Deleted ${fileId}`);
                onDelete?.(fileId);
              }),
          });
        },
      },
      {
        label: "Details",
        key: "3",
        onClick: toggleFileInfoOpened,
      },
    ],
    [
      toggleFileInfoOpened,
      deleteFile,
      fileExt,
      fileId,
      fileName,
      filePureName,
      formInstance,
      onDelete,
      updateFile,
    ],
  );

  return (
    <Tooltip
      placement="rightTop"
      open={fileInfoOpened}
      title={
        <div className="relative max-w-[8rem]">
          <div
            className={`absolute -right-3 -top-3 float-right cursor-pointer
              rounded-full bg-black/70 p-0.5 leading-none text-white`}
          >
            <CloseCircleOutlined onClick={toggleFileInfoOpened} />
          </div>
          <div>{fileName}</div>
          <Divider className="my-1 border-daw-neutral-500" />
          <div>
            <span className="font-light">Size:&nbsp;</span>
            <span className="float-right">{formatBytes(fileSize)}</span>
          </div>
          <Divider className="my-1 border-daw-neutral-500" />
          <div>
            <span className="font-light">Type:&nbsp;</span>
            <span className="float-right">{fileMimeType}</span>
          </div>
          <Divider className="my-1 border-daw-neutral-500" />
          <div>
            <span className="font-light">Id:&nbsp;</span>
            <span className="float-right break-all">{fileId}</span>
          </div>
          <div className="clear-both" />
        </div>
      }
    >
      <CustomDropdown
        renderChildren={(c: ReactNode) => (
          <div
            role={selectable ? "checkbox" : undefined}
            aria-checked={selected}
            aria-labelledby={`file_${fileId}`}
            tabIndex={selectable ? 0 : undefined}
            className={cn(
              `group relative flex flex-col gap-4 rounded p-2 outline-0
            transition-all
            hover:shadow-[0_0_0_1px_rgba(var(--color-primary))]
            focus:shadow-[0_0_0_2px_rgba(var(--color-primary))]`,
              {
                "bg-primary/30": selected,
                "rounded-lg": width > 6,
              },
              className,
            )}
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
              tabIndex={-1}
              icon={<FiMoreHorizontal />}
              onClick={(ev) => ev.preventDefault()}
              onDoubleClick={(ev) => ev.preventDefault()}
              className="absolute right-1 top-1 flex h-6 items-center justify-center text-lg"
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
    </Tooltip>
  );
});
