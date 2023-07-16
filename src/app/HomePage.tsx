"use client";

import { useQuery } from "@tanstack/react-query";
import { Divider } from "antd";
import React from "react";
import { CustomEmpty } from "~/components/CustomEmpty";
import { CustomLink } from "~/components/CustomLink";
import { ArticleCard, ArticleCardSkeleton } from "~/features/landing/components/ArticleCard";
import { LandingHeader } from "~/features/landing/components/LandingHeader";
import { trpc } from "~/lib/trpc";
import { encodeQueryParamObjectValue } from "~/utils/helpers";

function ArticlesLoading({ active = false }) {
  return (
    <>
      {new Array(9).fill(0).map((_, idx) => (
        <ArticleCardSkeleton key={idx} active={active} />
      ))}
    </>
  );
}

export function HomePage() {
  const { data: posts, isLoading: isLoadingPosts } = trpc.posts.getMany.useQuery({
    sort: "createdAt",
    order: "desc",
    filter: encodeQueryParamObjectValue({ status: "PUBLISHED" }),
    pageSize: 100,
  });
  const { data: devtoArticles, isLoading: isLoadingDevtoArticles } = useQuery<any>({
    queryKey: ["https://dev.to/api/articles", { per_page: 10 }],
  });

  return (
    <>
      <LandingHeader />
      <div className="flex w-full max-w-screen-xl flex-col gap-10 self-center px-6">
        <main className="flex w-full flex-col gap-10">
          <div className="flex w-full flex-col gap-10">
            <div>
              <h1 className="mb-2 font-bold">Latest Posts</h1>
              <Divider
                className="m-0 text-daw-neutral-400"
                orientation="left"
                orientationMargin={0}
              >
                Latest articles from our authors
              </Divider>
            </div>

            <div
              className="grid w-full place-content-center place-items-center justify-start"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(20rem, 100%), 1fr))`,
                gridGap: "2rem 2rem",
              }}
            >
              {!posts && <ArticlesLoading active={isLoadingPosts} />}
              {posts?.items.length ? (
                posts?.items.map((post) => (
                  <ArticleCard
                    key={post.id}
                    url="#"
                    title={post.title}
                    coverImage={post.featuredImageId && `/api/files/${post.featuredImageId}`}
                    publishedAt={post.createdAt}
                    userName={post.author.name}
                    userProfileImage={post.author.imageId && `/api/files/${post.author.imageId}`}
                  />
                ))
              ) : (
                <CustomEmpty className="my-24" description="No post!" />
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-10">
            <div>
              <h1 className="mb-2 font-bold">Latest From Dev.to</h1>
              <Divider
                className="m-0 text-daw-neutral-400"
                orientation="left"
                orientationMargin={0}
              >
                Latest articles from <CustomLink href="https://dev.to">dev.to</CustomLink>
              </Divider>
            </div>

            <div
              className="grid w-full place-content-center place-items-start justify-start"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(20rem, 100%), 1fr))`,
                gridGap: "2rem 2rem",
              }}
            >
              {!devtoArticles && <ArticlesLoading active={isLoadingDevtoArticles} />}
              {devtoArticles?.map((article: any) => (
                <ArticleCard
                  key={article.path}
                  url={article.canonical_url}
                  title={article.title}
                  coverImage={article.cover_image}
                  coverImageUnoptimized
                  publishedAt={article.published_at}
                  userName={article.user.name}
                  userProfileImage={article.user.profile_image_90}
                  userProfileImageUnoptimized
                  userWebsiteUrl={article.user.website_url}
                  userTwitterUsername={article.user.twitter_username}
                  userGithubUsername={article.user.github_username}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
