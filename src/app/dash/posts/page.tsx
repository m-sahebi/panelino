import { getServerAuthSession } from "~/_server/lib/next-auth";
import { postsRouter } from "~/_server/routers/posts";
import { trpcCreateCaller } from "~/_server/utils/trpc";
import { PostsPage } from "~/app/dash/posts/PostsPage";
import { type RouterOutputs } from "~/lib/trpc";
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
    sort: searchParams.sort as any,
    order: searchParams.order as any,
    search: searchParams.search as string,
    filter: searchParams.filter as string,
    groupId: (await getServerAuthSession())?.user.groupId ?? undefined,
    meta: "TRUE",
  });

  // TODO make data type assignable to data source by converting it to serialized type
  return <PostsPage dataSource={data as unknown as RouterOutputs["posts"]["getMany"]} />;
}
