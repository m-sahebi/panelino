import {
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Divider, Menu, Tooltip, Typography } from "antd";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React from "react";
import { useGlobalSearch } from "~/components/GlobalSearch";
import { ProfileIcon } from "~/components/ProfileIcon";
import { DASH_SIDEMENU_ITEMS } from "~/data/menus";
import { cn } from "~/utils/tailwind";

export const dashSidebarAtom = atomWithStorage("dashSidebarAtom", { collapsed: false });

export function Sidebar() {
  const { toggleGlobalSearchOpened } = useGlobalSearch();
  const [opt, setOpt] = useAtom(dashSidebarAtom);
  const segment = useSelectedLayoutSegment()?.split("/")[0] ?? "";
  const router = useRouter();

  const { collapsed } = opt;

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen w-64 flex-col items-center py-4",
        "gap-3 transition-all duration-500",
        {
          "w-20": collapsed,
          "px-3": !collapsed,
        },
      )}
    >
      <div
        className={cn("relative flex self-stretch", {
          "flex-col": collapsed,
        })}
      >
        <ProfileIcon
          collapsed={collapsed}
          popoverPlacement={collapsed ? "right" : "bottom"}
          className={cn("ms-1 min-w-0 flex-1", { "ms-5 mt-12": collapsed })}
        />
        <Button
          className={cn("absolute right-1 top-1 w-12", {
            "right-4 top-1": collapsed,
          })}
          onClick={() => setOpt((o) => ({ ...o, collapsed: !o.collapsed }))}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>

      <Tooltip title="Search" placement="right" overlayClassName={cn({ hidden: !collapsed })}>
        <Button
          className={cn("mx-1 flex w-auto cursor-pointer items-center justify-center self-stretch")}
          type={collapsed ? "text" : "default"}
          icon={<SearchOutlined className={cn({ "text-daw-neutral-400": !collapsed })} />}
          onClick={toggleGlobalSearchOpened}
        >
          {!collapsed && (
            <div className="flex w-full items-center text-start">
              <span className="float-left flex-1 truncate text-daw-neutral-400">
                &nbsp;&nbsp;Search...
              </span>
              <Typography.Text keyboard>/</Typography.Text>
            </div>
          )}
        </Button>
      </Tooltip>
      <Menu
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={["/" + segment]}
        className="min-w-0 flex-1 border-0 bg-transparent"
        items={DASH_SIDEMENU_ITEMS}
        onClick={({ key }) => router.push(`/dash${key}`)}
      />
      <Tooltip title="Home" placement="right" overlayClassName={cn({ hidden: !collapsed })}>
        <Button
          type="text"
          icon={<HomeOutlined />}
          className={cn(
            "mx-1 w-auto self-stretch transition-all",
            "h-10 overflow-hidden rounded-lg text-start",
            { "text-center": collapsed, "ps-6": !collapsed },
          )}
          onClick={() => router.push("/")}
        >
          {collapsed ? "" : "Home"}
        </Button>
      </Tooltip>
      <div className="w-full px-2">
        <Divider className="my-0" />
      </div>
      <div
        className={cn(
          "group mx-2 self-stretch truncate py-2 text-start text-sm transition-all text-daw-neutral-400",
          { "ps-6": !collapsed, "self-center": collapsed },
        )}
      >
        By{" "}
        <Link className="text-current" href="https://www.linkedin.com/in/m-sahebi/">
          {collapsed ? "M.S" : "M.Sahebi"}
        </Link>
      </div>
    </aside>
  );
}
