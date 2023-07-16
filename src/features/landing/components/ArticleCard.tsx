import { Skeleton, Tooltip } from "antd";
import Image from "next/image";
import React from "react";
import { LuBraces, LuGithub, LuGlobe, LuTwitter, LuUser } from "react-icons/lu";
import { CustomLink } from "~/components/CustomLink";
import { dateTime } from "~/lib/dayjs";
import { cn } from "~/utils/tailwind";
import { type Nullish } from "~/utils/type";

const DEFAULT_AUTHOR_NAME = "Admin";

export function ArticleCardSkeleton({ active = false }) {
  return (
    <div className="flex w-full flex-col items-start">
      <div className="relative mb-3 aspect-video w-full">
        <Skeleton.Image active={active} className="h-full w-full rounded-lg object-cover" />
      </div>

      <Skeleton.Input active={active} />
      <Skeleton.Input active={active} size="small" />
    </div>
  );
}

type ArticleCardProps = {
  url: string;
  title: string;
  publishedAt: string;
  coverImage?: Nullish<string>;
  coverImageUnoptimized?: boolean;
  userName?: Nullish<string>;
  userProfileImage?: Nullish<string>;
  userProfileImageUnoptimized?: boolean;
  userWebsiteUrl?: string;
  userTwitterUsername?: string;
  userGithubUsername?: string;
};

export function ArticleCard({
  url,
  title,
  publishedAt,
  coverImage,
  coverImageUnoptimized = false,
  userName = DEFAULT_AUTHOR_NAME,
  userProfileImage,
  userProfileImageUnoptimized = false,
  userWebsiteUrl,
  userTwitterUsername,
  userGithubUsername,
}: ArticleCardProps) {
  return (
    <div className="relative z-0 flex w-full flex-col items-start">
      {/* avatar */}
      <div
        className={cn(
          "flex-center group absolute -left-3 -top-3 z-10 rounded-full shadow",
          "bg-black/60 p-[.2rem] text-daw-neutral-100 dark:bg-white/60",
        )}
        style={{ backdropFilter: "blur(4px)" }}
      >
        {/* profile image */}
        <div className="flex-center-center relative h-12 w-12 rounded-full">
          {userProfileImage ? (
            <Image
              unoptimized={userProfileImageUnoptimized}
              src={userProfileImage}
              alt="user profile"
              className="rounded-full object-cover"
              fill
            />
          ) : (
            <LuUser className="h-full w-2/3 text-daw-neutral-400" />
          )}
        </div>

        {/* user info */}
        <div
          className="flex h-12 w-0 flex-col items-start justify-center gap-1
                        overflow-hidden px-0 transition-all group-hover:w-48 group-hover:px-2"
        >
          <div className="w-full truncate" title={userName ?? undefined}>
            {userName}
          </div>
          <div className="flex-center gap-2 text-daw-neutral-400">
            {userWebsiteUrl && (
              <CustomLink href={userWebsiteUrl}>
                <LuGlobe />
              </CustomLink>
            )}
            {userGithubUsername && (
              <CustomLink href={`https://github.com/${userGithubUsername}`}>
                <LuGithub />
              </CustomLink>
            )}
            {userTwitterUsername && (
              <CustomLink href={`https://twitter.com/${userTwitterUsername}`}>
                <LuTwitter />
              </CustomLink>
            )}
          </div>
        </div>
      </div>

      <CustomLink href={url} className="group flex w-full cursor-pointer flex-col">
        {/* cover image */}
        <div
          className="flex-center-center relative mb-6 aspect-video
            w-full overflow-hidden rounded-lg outline
            outline-1 bg-daw-white outline-daw-neutral-300"
        >
          {coverImage ? (
            <Image
              unoptimized={coverImageUnoptimized}
              src={coverImage}
              alt=""
              className="w-full object-cover group-hover:scale-125"
              fill
            />
          ) : (
            <LuBraces className="h-full w-1/3 text-daw-neutral-200" />
          )}
        </div>

        {/* timestamp */}
        <h2 className="font-semibold">{title}</h2>
        <Tooltip
          className="self-start text-daw-neutral-400"
          placement="right"
          title={dateTime(publishedAt).format("YYYY-MM-DD HH:mm")}
        >
          {dateTime().from(publishedAt)}
        </Tooltip>
      </CustomLink>
    </div>
  );
}
