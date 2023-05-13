import { notFound } from "next/navigation";
import ModelTable from "@/app/dash/table/[route]/ModelTable";
import { RoutePathType, routePaths } from "@/data/schemas/routes";
import { routeFetch } from "@/server/utils/fetch";

type PageProps = { params: Record<string, string> };
export default async function Page({ params }: PageProps) {
  const route = (params.route || "users") as RoutePathType;
  if (!routePaths.includes(route)) notFound();
  const dataSource = await routeFetch(route);

  return <ModelTable route={route} dataSource={dataSource} />;
}
