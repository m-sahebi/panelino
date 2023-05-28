import { postsRouter } from "~/_server/routers/posts";
import { trpcCreateCaller } from "~/_server/utils/trpc-create-caller";
import JsonPrettied from "~/components/JsonPrettied";

type PageProps = { params: Record<string, string> };
export default async function Page({ params }: PageProps) {
  const { data: post } = await (
    await trpcCreateCaller(postsRouter)
  ).getById({ id: params.id });

  return <JsonPrettied object={post} />;
}
