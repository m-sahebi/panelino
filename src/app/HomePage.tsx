"use client";

import { Menu, Tooltip } from "antd";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";
import { ProfileIcon } from "~/components/ProfileIcon";
import { HOME_MAINMENU_ITEMS } from "~/data/menus";
import { dayjs } from "~/lib/dayjs";
import { trpc } from "~/lib/trpc";
import { cn } from "~/utils/tailwind";

const WindowScrollYTracker = React.memo(function ScrollTracker({
  limit,
  onPassLimit,
}: {
  limit: number;
  onPassLimit: (passed: boolean) => void;
}) {
  const { y } = useWindowScroll();
  const prevY = useRef<number>();

  useEffect(() => {
    if (prevY.current === undefined) {
      prevY.current = y;
      if (y > limit) onPassLimit(true);
    }
    if (y > limit && prevY.current <= limit) onPassLimit(true);
    else if (y <= limit && prevY.current > limit) onPassLimit(false);
    prevY.current = y;
    // no need to recall onPassLimit on reference change
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [limit, y]);

  return null;
});

export function HomePage() {
  // const { data: session } = useSession();
  const { data: posts } = trpc.posts.getMany.useQuery({});
  const [scrolled, setScrolled] = useState(false);
  // const { data } = useQuery({ queryKey: ["https://dev.to/api/articles"] });
  const router = useRouter();
  const segment = useSelectedLayoutSegment()?.split("/")[0] ?? "";

  return (
    <>
      <WindowScrollYTracker limit={20} onPassLimit={(s) => setScrolled(s)} />
      <div
        className={cn(
          "sticky top-0 z-10 mx-auto mb-6 mt-4 w-[948px] max-w-full rounded-lg border-0 border-transparent px-6 transition-all duration-300",
          {
            "w-full rounded-none border-0 border-b border-solid bg-neutral-200 bg-opacity-70 border-daw-neutral-300 dark:bg-neutral-800 dark:bg-opacity-70":
              scrolled,
          },
        )}
        style={{ backdropFilter: "blur(4px)" }}
      >
        <header
          className={cn(
            "mx-auto flex w-full max-w-[900px] items-center justify-center rounded-lg px-6 py-3 duration-300 bg-daw-neutral-200",
            {
              "bg-transparent": scrolled,
            },
          )}
        >
          <nav className="max-w-[900px] flex-1 self-center transition-all">
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
      <div className="mx-auto flex w-full max-w-[948px] flex-col gap-8 px-6">
        <main className="flex flex-col gap-6">
          {posts?.items.map((post) => (
            <div key={post.id} className="flex flex-col items-start p-3">
              <h2>{post.title}</h2>
              <Tooltip placement="right" title={dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}>
                {dayjs().from(post.createdAt)}
              </Tooltip>
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
