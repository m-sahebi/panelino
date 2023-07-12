import { Tag, Tooltip } from "antd";
import React from "react";
import { LuFileWarning } from "react-icons/lu";
import { cn } from "~/utils/tailwind";

type Props = {
  fileTypes?: string;
  className?: string;
  hideOnEmptyFileTypes?: boolean;
  collapsed?: boolean;
};

export function FileTypesInfo({
  fileTypes,
  className,
  hideOnEmptyFileTypes = true,
  collapsed = false,
}: Props) {
  if (!fileTypes && hideOnEmptyFileTypes) return null;
  return (
    <Tooltip
      title={
        fileTypes ? (
          collapsed ? (
            <span className={cn("inline-flex flex-col items-start gap-2", className)}>
              Allowed file types:{" "}
              <span className={cn("flex flex-wrap items-center gap-2", className)}>
                {fileTypes?.split(",").map((t) => (
                  <Tag className="m-0" key={t} color="blue">
                    {t}
                  </Tag>
                ))}
              </span>
            </span>
          ) : (
            "Allowed file types"
          )
        ) : (
          "All file types are allowed"
        )
      }
    >
      <span className={cn("inline-flex flex-wrap items-center gap-2", className)}>
        <LuFileWarning className="text-daw-blue-500" size={20} />
        {!collapsed &&
          fileTypes?.split(",").map((t) => (
            <Tag className="m-0" key={t} color="blue">
              {t}
            </Tag>
          ))}
      </span>
    </Tooltip>
  );
}
