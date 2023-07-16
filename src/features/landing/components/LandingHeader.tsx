import { Menu } from "antd";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useState } from "react";
import { ScrollYTracker } from "~/components/ScrollYTracker";
import { HOME_MAINMENU_ITEMS } from "~/data/menus";
import { ProfileIcon } from "~/features/user/components/ProfileIcon";
import { cn } from "~/utils/tailwind";

type LandingHeaderProps = { className?: string };

export function LandingHeader({ className }: LandingHeaderProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const segment = useSelectedLayoutSegment()?.split("/")[0] ?? "";
  return (
    <>
      <ScrollYTracker limit={20} onPassLimit={setScrolled} />
      <div
        className={cn(
          "sticky -top-px z-10 mx-auto mb-6 mt-4 w-[1200px] max-w-full rounded-lg",
          "border-0 border-transparent px-6 transition-all duration-300",
          {
            "w-full rounded-none border-0 border-b border-solid bg-neutral-200": scrolled,
            "bg-opacity-70 border-daw-neutral-300 dark:bg-neutral-800 dark:bg-opacity-70": scrolled,
          },
          className,
        )}
        style={{ backdropFilter: "blur(6px)" }}
      >
        <header
          className={cn(
            "mx-auto flex w-full max-w-screen-xl items-center justify-between",
            "rounded-lg px-6 py-3 duration-300 bg-daw-neutral-200",
            { "bg-transparent": scrolled },
          )}
        >
          <nav className="flex max-w-screen-xl self-center transition-all">
            <Menu
              className={cn("border-0 bg-transparent leading-6")}
              mode="horizontal"
              selectedKeys={[`/${segment}`]}
              items={HOME_MAINMENU_ITEMS}
              onClick={({ key }) => router.push(`${key}`)}
            />
          </nav>
          <ProfileIcon collapsed avatarWidth={32} />
        </header>
      </div>
    </>
  );
}
