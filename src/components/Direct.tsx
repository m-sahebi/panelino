import { type PropsWithChildren } from "react";

type Props = PropsWithChildren<{}>;

export function Direct({ children }: Props) {
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
