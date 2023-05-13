"use client";

import {
  AppstoreOutlined,
  LogoutOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Menu, Tooltip } from "antd";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React, { useState } from "react";
import DashTitle from "@/layouts/panel/DashTitle";
import { AntdMenuItem, getAntdMenuItem } from "@/utils/antd";
import { cn } from "@/utils/tailwind";

type PanelLayoutProps = { children: React.ReactNode };

const items: AntdMenuItem[] = [
  getAntdMenuItem("Home", "home", <MailOutlined />),
  getAntdMenuItem("Posts", "posts", <AppstoreOutlined />),
  getAntdMenuItem("Flows", "flows", <SettingOutlined />),
  getAntdMenuItem("Table", "table", <SettingOutlined />),
];

export default function PanelLayout({ children }: PanelLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const segment = useSelectedLayoutSegment()?.split("/")[0] || "home";
  const router = useRouter();
  const session = useSession().data!;

  return (
    <div className={"relative flex w-full"}>
      <aside
        className={cn(
          "sticky top-0 flex h-screen w-64 flex-col items-center py-4",
          "border-daw-neutral-300 bg-daw-white gap-3 transition-all",
          "border-0 border-x border-solid",
          {
            "w-20": isCollapsed,
            "px-3": !isCollapsed,
          }
        )}
      >
        <div
          className={cn("flex gap-3 self-stretch", {
            "flex-col": isCollapsed,
          })}
        >
          <div
            className={cn("min-w-0 flex-1 transition-all", {
              "ms-4 mt-12": isCollapsed,
            })}
          >
            <Avatar className={"h-12 w-12"} src={session.user?.image}></Avatar>
          </div>
          <Button
            className={cn("absolute left-[12.25rem]", {
              "left-4 top-4": isCollapsed,
            })}
            onClick={() => setIsCollapsed((c) => !c)}
          >
            {isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
        </div>
        <Menu
          mode="inline"
          inlineCollapsed={isCollapsed}
          selectedKeys={[segment]}
          className={"min-w-0 flex-1 border-0 bg-transparent"}
          items={items}
          onClick={({ key }) =>
            key === "home" ? router.push("/dash") : router.push(`/dash/${key}`)
          }
        />
        <Tooltip
          title={"Log out"}
          placement={"right"}
          overlayClassName={cn({ hidden: !isCollapsed })}
        >
          <Button
            type={"text"}
            icon={<LogoutOutlined />}
            className={cn(
              "mx-1 w-auto self-stretch transition-all",
              "h-10 overflow-hidden rounded-lg text-start",
              { "text-center": isCollapsed, "ps-6": !isCollapsed }
            )}
            onClick={signOut}
          >
            {isCollapsed ? "" : "Log Out"}
          </Button>
        </Tooltip>
      </aside>
      <main className={"min-w-0 flex-1 px-6 pt-4"}>
        <DashTitle />
        {children}
      </main>
    </div>
  );
}
