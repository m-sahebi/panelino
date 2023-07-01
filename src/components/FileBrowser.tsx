import { FileOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Slider,
  type FormInstance,
  type MenuProps,
} from "antd";
import { type ModalFuncProps } from "antd/es/modal/interface";
import Image from "next/image";
import { toggle } from "radash";
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { FiMoreHorizontal } from "react-icons/fi";
import { type SimpleMerge } from "type-fest/source/merge";
import { type ApiFilesGetResponseType } from "~/app/api/files/route";
import { rqMutation } from "~/lib/tanstack-query";
import { fileNameExtSplit } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

export const FileBrowser = React.memo(function FileBrowser({
  onSelect,
  multiple = true,
}: {
  onSelect?: (selectedFilesIds: string[]) => void;
  multiple?: boolean;
}) {
  const [renameForm] = Form.useForm<{ name: string }>();
  const [zoom, setZoom] = useState(70);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const { data } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "DELETE", invalidatedKeys: [["/files"]] }),
  );
  const { mutateAsync: updateFile } = useMutation(
    rqMutation({ url: "/files/:id", method: "PATCH", invalidatedKeys: [["/files"]] }),
  );

  function selectAll(ev: KeyboardEvent) {
    ev.preventDefault();
    if (!multiple) return;
    const f = data?.items.map((itm) => itm.id) ?? [];
    setSelectedFiles(f);
    onSelect?.(f);
  }
  function selectNone(ev: KeyboardEvent) {
    ev.preventDefault();
    setSelectedFiles([]);
    onSelect?.([]);
  }
  function selectFile(fileId: string) {
    if (multiple) setSelectedFiles((s) => toggle(s, fileId));
    else {
      setSelectedFiles([fileId]);
      onSelect?.([fileId]);
    }
  }

  useHotkeys("Ctrl+A", selectAll, {}, [onSelect]);
  useHotkeys("Escape", selectNone, {}, [onSelect]);

  return (
    <>
      <div className="flex items-center gap-3">
        Zoom:
        <Slider
          className="max-w-[12rem] flex-1"
          min={40}
          max={300}
          step={10}
          value={zoom}
          onChange={setZoom}
        />
      </div>
      <ul
        tabIndex={0}
        className="grid w-full place-content-center place-items-center justify-between rounded-lg outline-0"
        style={{
          gridTemplateColumns: `repeat(auto-fit, minmax(${zoom / 10}rem, 1fr))`,
          gridGap: "1rem 1rem",
        }}
      >
        {data?.items.map((file) => {
          const [name, ext] = fileNameExtSplit(file.name);
          const isSelected = selectedFiles.includes(file.id);
          const items: MenuProps["items"] = [
            {
              label: "Open",
              key: "0",
              onClick: (ev) => {
                ev.domEvent.stopPropagation();
                window.open(`/api/files/${file.id}`, "_blank");
              },
            },
            {
              label: "Rename",
              key: "1",
              onClick: (ev) => {
                ev.domEvent.stopPropagation();
                renameForm.setFieldsValue({ name: file.name });
                modalForm({
                  form: renameForm,
                  type: "confirm",
                  title: `Rename "${file.name}"`,
                  content: (
                    <Form form={renameForm} initialValues={{ name: "" }}>
                      <Form.Item className="m-0" name="name" rules={[{ required: true }]}>
                        <Input ref={(el) => setTimeout(() => el?.focus(), 0)} />
                      </Form.Item>
                    </Form>
                  ),
                  onOk: async (form) =>
                    updateFile({ path: { id: file.id }, data: form.getFieldsValue() }),
                });
              },
            },
            {
              label: "Delete",
              key: "2",
              className: "text-daw-red-500",
              onClick: (ev) => {
                ev.domEvent.stopPropagation();
                Modal.confirm({
                  type: "warn",
                  title: `Delete "${file.name}"?`,
                  onOk: () =>
                    deleteFile({ path: { id: file.id } }).then(
                      () => void message.success(`Deleted ${file.id}`),
                    ),
                });
              },
            },
          ];

          return (
            <li
              role="checkbox"
              aria-checked={String(isSelected) as "true" | "false"}
              aria-labelledby={`file_${file.id}`}
              tabIndex={0}
              className={cn(
                `group relative flex w-full list-none flex-col gap-4 rounded
                px-2 outline-offset-2 outline-primary-dark hover:outline hover:outline-1 focus:outline focus:outline-2`,
                { "bg-primary-dark/30": isSelected },
              )}
              onClick={(ev) => !ev.defaultPrevented && selectFile(file.id)}
              onDoubleClick={(ev) =>
                !ev.defaultPrevented && window.open(`/api/files/${file.id}`, "_blank")
              }
              onKeyDown={(ev) => ev.code === "Space" && selectFile(file.id)}
              key={file.id}
              style={{
                height: `calc(${zoom / 10}rem + 4rem)`,
              }}
            >
              <Dropdown menu={{ items }} trigger={["click"]}>
                <Button
                  icon={<FiMoreHorizontal />}
                  onClick={(ev) => ev.preventDefault()}
                  onDoubleClick={(ev) => ev.preventDefault()}
                  className="absolute right-1 top-1 text-lg"
                  type="text"
                />
              </Dropdown>
              <div
                className="flex w-full items-center justify-center"
                style={{ height: `${zoom / 10}rem` }}
              >
                {file.mimeType?.startsWith("image") ? (
                  <Image
                    width={zoom * 1.6}
                    height={zoom * 1.6}
                    src={`/api/files/${file.id}`}
                    alt={file.key}
                    className="max-h-full max-w-full rounded object-contain"
                  />
                ) : (
                  <FileOutlined
                    className="text-daw-blue-500"
                    style={{ fontSize: `${zoom / 14}rem` }}
                  />
                )}
              </div>
              <label
                id={`file_${file.id}`}
                title={file.id + "." + file.key.split(".").at(-1)}
                className="flex w-full justify-center text-xs font-normal"
              >
                <span className="max-w-full flex-shrink truncate">{name}</span>.{ext}
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
});

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
  return Modal.confirm({
    ...p,
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
