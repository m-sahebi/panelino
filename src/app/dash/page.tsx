import { getServerAuthSession } from "~/_server/lib/next-auth";
import JsonPrettied from "~/components/JsonPrettied";

export default async function DashPage() {
  const session = await getServerAuthSession();
  return <JsonPrettied object={session} />;
}
