import { getServerAuthSession } from "~/_server/lib/next-auth";
import { postsRouter } from "~/_server/routers/posts";
import { trpcCreateCaller } from "~/_server/utils/trpc";
import { PostsPage } from "~/app/dash/posts/PostsPage";
import { paginateParams } from "~/utils/helpers";

type PageProps = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageProps) {
  const data = await (
    await trpcCreateCaller(postsRouter)
  ).getMany({
    ...paginateParams(searchParams),
    filter: searchParams.filter as string,
    groupId: (await getServerAuthSession())?.user.groupId ?? undefined,
    meta: true,
  });

  return <PostsPage dataSource={data} />;
}
