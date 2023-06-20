import PageLoading from "~/layouts/common/PageLoading";

export function AppLayout ({children}:{children:React.ReactNode}) {

  return <><PageLoading />{children}</>
}
