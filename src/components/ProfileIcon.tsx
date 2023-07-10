import { UserRole } from "@prisma/client";
import { Avatar, Button, Divider, Popover, Segmented, Tag, type PopoverProps } from "antd";
import { useAtom } from "jotai";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import { LuLogOut, LuMonitor, LuMoon, LuSun, LuUser } from "react-icons/lu";
import { ROLE_META } from "~/data/roles";
import { DarkModeOptions, globalSettingsAtom } from "~/store/atoms/global-settings";
import { cn } from "~/utils/tailwind";
import { type ObjectValues } from "~/utils/type";

export function ProfileIcon({
  collapsed = false,
  className,
  popoverPlacement,
  popoverClassName,
  collapsedWidth,
  avatarWidth,
}: {
  collapsed?: boolean;
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

  const [globalSettings, setGlobalSettings] = useAtom(globalSettingsAtom);

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
                icon={<LuLogOut />}
                className="flex items-center"
                onClick={() => (user ? void signOut() : void signIn())}
              >
                {user ? "Log out" : "Log in"}
              </Button>
              <Divider className="my-1" />
              <Segmented
                value={globalSettings.darkModeSetting}
                onChange={(val) =>
                  setGlobalSettings((s) => ({
                    ...s,
                    darkModeSetting: val as ObjectValues<DarkModeOptions>,
                  }))
                }
                options={[
                  { value: DarkModeOptions.ON, icon: <LuMoon /> },
                  { value: DarkModeOptions.SYSTEM, icon: <LuMonitor /> },
                  { value: DarkModeOptions.OFF, icon: <LuSun /> },
                ]}
              />
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
              icon={<LuUser />}
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
