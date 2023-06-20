import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { UserRole } from "@prisma/client";
import { Avatar, Button, Popover, Tag, type PopoverProps } from "antd";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import { ROLE_META } from "~/data/roles";
import { cn } from "~/utils/tailwind";

export function ProfileIcon({
  collapsed,
  className,
  popoverPlacement,
  popoverClassName,
  collapsedWidth,
  avatarWidth,
}: {
  collapsed: boolean;
  className?: string;
  popoverPlacement?: PopoverProps["placement"];
  popoverClassName?: string;
  collapsedWidth?: number | string;
  avatarWidth?: number | string;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role || UserRole.GUEST;
  const widthAvatar = avatarWidth ?? "2.5rem";
  const heightAvatar = avatarWidth ?? "2.5rem";
  const widthCollapsed = collapsedWidth ?? "10rem";

  return (
    <div className={cn("transition-all", className)}>
      <div
        className={cn("flex gap-2 transition-all")}
        style={{ width: collapsed ? widthAvatar : widthCollapsed }}
      >
        <Popover
          trigger="hover"
          placement={popoverPlacement}
          arrow={false}
          className={popoverClassName}
          content={
            <div className="flex flex-col items-stretch gap-2">
              <Tag
                className={cn(
                  "m-0 flex items-center justify-center text-center font-bold",
                  ROLE_META[role].classes.bg,
                  ROLE_META[role].classes.text,
                )}
              >
                {role}&nbsp;
                {user?.id && <span className="text-daw-neutral-700">#{user.id}</span>}
              </Tag>
              <Button
                type="text"
                size="small"
                icon={<LogoutOutlined />}
                className="flex items-center"
                onClick={() => (user ? void signOut() : void signIn())}
              >
                {user ? "Log out" : "Log in"}
              </Button>
            </div>
          }
        >
          <div
            className={cn(
              `outline-3 self-center rounded-full outline`,
              ROLE_META[role].classes.outline,
            )}
          >
            <Avatar
              className="flex flex-shrink-0 items-center justify-center"
              style={{ width: widthAvatar, height: heightAvatar }}
              icon={!user && <UserOutlined />}
              src={user?.image}
            />
          </div>
        </Popover>
        <div
          className={cn(
            "flex flex-shrink flex-col justify-around self-stretch truncate transition-all",
            {
              "h-0": collapsed,
            },
          )}
          style={{ height: heightAvatar }}
        >
          <div className="truncate font-bold">{user ? user.name : "Guest"}</div>
          {user?.email ? (
            <div className="truncate text-sm text-daw-neutral-600">{user.email}</div>
          ) : (
            <Button className="px-0" type="text" size="small" onClick={() => void signIn()}>
              Log in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
