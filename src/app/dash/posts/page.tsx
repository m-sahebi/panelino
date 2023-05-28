import { schemasRouter } from "~/_server/routers";
import { postsRouter } from "~/_server/routers/posts";
import { paginateParams } from "~/_server/utils/paginate";
import { trpcCreateCaller } from "~/_server/utils/trpc-create-caller";
import { PostsPage } from "~/app/dash/posts/PostsPage";

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
  });
  const postsSchema = await (
    await trpcCreateCaller(schemasRouter)
  ).getByName({ name: "posts", method: "getMany" });

  return (
    <PostsPage dataSource={data} dataSchema={postsSchema.output.obj!.items.arr!.obj!} />
  );
}
