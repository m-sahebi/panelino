import { isArray } from "radash";
import { type ZodSchema } from "zod";
import { appRouter, routerNames, routers, schemasRouter } from "~/_server/routers";
import { createTRPCContext } from "~/_server/trpc";
import { trpcCreateCaller } from "~/_server/utils/trpc";
import ModelTable from "~/app/dash/table/ModelTable";
import { arrayDiff, inArray } from "~/utils/primitive";

type PageProps = {
  params: Record<string, string | string[]>;
  searchParams: {
    [key in "_route" | "_method" | string]: string | string[] | undefined;
  };
};
export default async function Page({ searchParams }: PageProps) {
  const { _route, _method, ...methodParams } = searchParams;

  const methodName = isArray(_method) ? _method[0] : _method ?? "";
  const routerName = isArray(_route) ? _route[0] : _route ?? "";
  const routesList = arrayDiff(routerNames, ["schemas"] as const);

  if (!inArray(routesList, routerName))
    return (
      <ModelTable
        dataSource={null}
        routeName={null}
        dataSchema={null}
        methodName={null}
        methodParams={null}
        routesList={routesList}
        methodsList={null}
      />
    );

  const schemasCaller = await trpcCreateCaller(schemasRouter);
  const methodsList = await schemasCaller.getRouteMethods({
    route: routerName,
  });

  if (!inArray(methodsList, methodName))
    return (
      <ModelTable
        dataSource={null}
        routeName={routerName}
        dataSchema={null}
        methodName={null}
        methodParams={null}
        routesList={routesList}
        methodsList={methodsList}
      />
    );

  const schemaResult =
    routers[routerName][methodName] &&
    (await schemasCaller.getByName({ name: routerName, method: methodName }));

  const methodParamsParseResult = (
    routers[routerName][methodName]._def.inputs[0] as ZodSchema
  )?.safeParse(methodParams);

  const result =
    (methodParamsParseResult.success &&
      !schemaResult.isMutation &&
      (await appRouter[routerName]
        .createCaller(await createTRPCContext())
        [methodName]({ ...methodParams, meta: true } as any))) ||
    null;

  return (
    <ModelTable
      routesList={routesList}
      methodsList={methodsList}
      routeName={routerName}
      methodName={methodName}
      methodParams={methodParams}
      dataSource={result}
      dataSchema={schemaResult}
    />
  );
}
