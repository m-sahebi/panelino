"use client";

import { Menu, Tooltip } from "antd";
import Image from "next/image";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";
import { ProfileIcon } from "~/components/ProfileIcon";
import { HOME_MAINMENU_ITEMS } from "~/data/menus";
import { dayjs } from "~/lib/dayjs";
import { trpc } from "~/lib/trpc";
import { cn } from "~/utils/tailwind";

const ScrollYTracker = React.memo(function ScrollTracker({
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
  }, [limit, y, onPassLimit]);

  return null;
});

export function HomePage() {
  // const { data: session } = useSession();
  const { data: posts } = trpc.posts.getMany.useQuery({ sort: "createdAt", pageSize: 100 });
  const [scrolled, setScrolled] = useState(false);
  // const { data } = useQuery({ queryKey: ["https://dev.to/api/articles"] });
  const router = useRouter();
  const segment = useSelectedLayoutSegment()?.split("/")[0] ?? "";

  return (
    <>
      <ScrollYTracker limit={20} onPassLimit={setScrolled} />
      <div
        className={cn(
          "sticky -top-px z-10 mx-auto mb-6 mt-4 w-[948px] max-w-full rounded-lg border-0 border-transparent px-5 transition-all duration-300",
          {
            "w-full rounded-none border-0 border-b border-solid bg-neutral-200 bg-opacity-70 border-daw-neutral-300 dark:bg-neutral-800 dark:bg-opacity-70":
              scrolled,
          },
        )}
        style={{ backdropFilter: "blur(4px)" }}
      >
        <header
          className={cn(
            "mx-auto flex w-full max-w-[900px] items-center justify-center rounded-lg px-5 py-3 duration-300 bg-daw-neutral-200",
            {
              "bg-transparent": scrolled,
            },
          )}
        >
          <ProfileIcon collapsed avatarWidth={32} />
          <nav className="flex max-w-[900px] flex-1 justify-end self-center transition-all">
            <Menu
              className={cn("border-0 bg-transparent leading-6")}
              mode="horizontal"
              selectedKeys={[`/${segment}`]}
              items={HOME_MAINMENU_ITEMS}
              onClick={({ key }) => router.push(`${key}`)}
            />
          </nav>
        </header>
      </div>

      <div className="mx-auto flex w-full max-w-[948px] flex-col gap-8 px-5">
        <main className="flex flex-col gap-6">
          {posts?.items.map((post) => (
            <div key={post.id} className="flex flex-col items-start py-3">
              <h2>{post.title}</h2>

              {post.featuredImageId && (
                <div className="relative mb-3 aspect-[21/9] w-full">
                  <Image
                    src={`/api/files/${post.featuredImageId}`}
                    alt=""
                    className="w-full rounded-lg object-cover"
                    fill
                  />
                </div>
              )}

              <Tooltip
                className="text-daw-neutral-400"
                placement="right"
                title={dayjs(post.createdAt).format("YYYY-MM-DD HH:mm")}
              >
                {dayjs().from(post.createdAt)}
              </Tooltip>
            </div>
          ))}
        </main>
      </div>
    </>
  );
}
