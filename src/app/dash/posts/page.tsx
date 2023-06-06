import { getServerAuthSession } from "~/_server/lib/next-auth";
import { postsRouter } from "~/_server/routers/posts";
import { trpcCreateCaller } from "~/_server/utils/trpc";
import { PostsPage } from "~/app/dash/posts/PostsPage";
import { paginateParams } from "~/utils/helpers";

type PageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ searchParams }: PageProps) {
  const data = await (
    await trpcCreateCaller(postsRouter)
  ).getMany({
    ...paginateParams(searchParams),
    search: searchParams.search as string,
    filter: searchParams.filter as string,
    groupId: (await getServerAuthSession())?.user.groupId ?? undefined,
    meta: "TRUE",
  });

  return <PostsPage dataSource={data} />;
}
