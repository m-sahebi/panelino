"use client";

import {
  AppstoreOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Menu, Popover, Tag, Tooltip, Typography } from "antd";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useState } from "react";
import { ROLE_META } from "~/data/roles";
import DashTitle from "~/layouts/panel/DashTitle";
import { getAntMenuItem, type AntMenuItem } from "~/utils/ant";
import { useSessionStrict } from "~/utils/hooks/useSessionStrict";
import { cn } from "~/utils/tailwind";

type PanelLayoutProps = { children: React.ReactNode };

const items: AntMenuItem[] = [
  getAntMenuItem("Home", "home", <MailOutlined />),
  getAntMenuItem("Posts", "posts", <AppstoreOutlined />),
  getAntMenuItem("Flows", "flows", <SettingOutlined />),
  getAntMenuItem("Table", "table", <SettingOutlined />),
];

export default function PanelLayout({ children }: PanelLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const segment = useSelectedLayoutSegment()?.split("/")[0] || "home";
  const router = useRouter();
  const {
    data: { user },
  } = useSessionStrict();

  return (
    <div className="relative flex w-full">
      <aside
        className={cn(
          "sticky top-0 flex h-screen w-64 flex-col items-center py-4",
          "gap-3 transition-all",
          {
            "w-20": isCollapsed,
            "px-3": !isCollapsed,
          },
        )}
      >
        <div
          className={cn("relative flex self-stretch", {
            "flex-col": isCollapsed,
          })}
        >
          <Popover
            trigger="hover"
            placement={isCollapsed ? "right" : "bottom"}
            align={{ offset: [0, 0] }}
            className={cn("self-start", { "self-stretch": isCollapsed })}
            content={
              <div className="flex flex-col items-stretch gap-2">
                <Tag
                  className={cn(
                    "m-0 flex items-center justify-center text-center font-bold",
                    ROLE_META[user.role].classes.bg,
                    ROLE_META[user.role].classes.text,
                  )}
                >
                  {user.role}&nbsp;
                  <span className="text-daw-neutral-700">#{user.id}</span>
                </Tag>
                <Button
                  type="text"
                  size="small"
                  icon={<LogoutOutlined />}
                  className="flex items-center"
                  onClick={() => void signOut()}
                >
                  Log Out
                </Button>
              </div>
            }
          >
            <div
              className={cn("ms-1 min-w-0 flex-1 transition-all", {
                "ms-5 mt-12": isCollapsed,
              })}
            >
              <div className={cn("flex w-44 gap-2 transition-all", { "w-10": isCollapsed })}>
                <div
                  className={cn(
                    `outline-3 self-center rounded-full outline`,
                    ROLE_META[user.role].classes.outline,
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0" src={user.image} />
                </div>
                <div
                  className={cn(
                    "flex flex-shrink flex-col justify-between self-stretch truncate py-1",
                  )}
                >
                  <div className="truncate font-bold">{user.name}</div>
                  <div className="truncate text-sm text-daw-neutral-600">{user.email}</div>
                </div>
              </div>
            </div>
          </Popover>
          <Button
            className={cn("absolute right-1 top-1 w-12", {
              "right-4 top-1": isCollapsed,
            })}
            onClick={() => setIsCollapsed((c) => !c)}
          >
            {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>

        <Tooltip title="Search" placement="right" overlayClassName={cn({ hidden: !isCollapsed })}>
          <Button
            className={cn(
              "mx-1 flex w-auto cursor-pointer items-center justify-center self-stretch",
            )}
            type={isCollapsed ? "text" : "default"}
            icon={<SearchOutlined />}
          >
            {!isCollapsed && (
              <div className="w-full text-start">
                <span className="text-daw-neutral-400">&nbsp;&nbsp;Search...</span>
                <Typography.Text keyboard className="-mt-0.25 float-right">
                  /
                </Typography.Text>
              </div>
            )}
          </Button>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed={isCollapsed}
          selectedKeys={[segment]}
          className="min-w-0 flex-1 border-0 bg-transparent"
          items={items}
          onClick={({ key }) =>
            key === "home" ? router.push("/dash") : router.push(`/dash/${key}`)
          }
        />
        <div className="group mx-2 truncate text-start transition-all text-daw-neutral-400">
          By{" "}
          <Link className="text-current" href="https://www.linkedin.com/in/m-sahebi/">
            {isCollapsed ? "M.S" : "M.Sahebi"}
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-6 pt-4">
        <DashTitle />
        {children}
      </main>
    </div>
  );
}
