import { Dropdown, type DropdownProps } from "antd";
import {
  Children,
  cloneElement,
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { type HTMLElementTagName } from "~/data/types/html";
import { type Nullish } from "~/utils/type";

export type CustomDropdownRef = { setOpen: (o: boolean) => void };
export type CustomDropdownProps<T extends HTMLElementTagName = HTMLElementTagName> = SimpleMerge<
  DropdownProps,
  {
    scope?: string;
    targetClassName?: string;
    targetStyle?: React.HTMLAttributes<T>["style"];
    renderChildren?: (children: ReactNode) => ReactElement<JSX.IntrinsicElements[T]>;
    onOpenChange?: (open: boolean) => Nullish<boolean>;
    children?: ReactNode;
  }
>;

const GLOBAL_SCOPE = "global";
function getScope(scope: Nullish<string>) {
  return scope ?? GLOBAL_SCOPE;
}

const currentOpenFn: Record<string, (s: boolean) => void> = {};
function getCurrentOpenFn(scope: Nullish<string>) {
  return currentOpenFn[getScope(scope)];
}

export const CustomDropdown = forwardRef<CustomDropdownRef, CustomDropdownProps>(
  function CustomDropdown<T extends HTMLElementTagName>(
    {
      children,
      scope,
      onOpenChange,
      menu,
      renderChildren,
      targetClassName,
      targetStyle,
      ...props
    }: CustomDropdownProps<T>,
    ref: React.ForwardedRef<CustomDropdownRef>,
  ) {
    const [open, setOpen] = useState(false);

    useImperativeHandle(
      ref,
      () => {
        return { setOpen, open };
      },
      [setOpen, open],
    );

    return (
      <Dropdown
        open={open}
        {...props}
        onOpenChange={(o) => {
          if (onOpenChange?.(o)) return;
          if (o) {
            if (getCurrentOpenFn(scope) === setOpen) {
              setOpen(true);
              return;
            }
            // currentId = id.current;
            getCurrentOpenFn(scope)?.(false);
            currentOpenFn[getScope(scope)] = setOpen;
          }
          setOpen(o);
        }}
        menu={{
          onClick: (...args) => {
            currentOpenFn[getScope(scope)]?.(false);
            menu?.onClick?.(...args);
          },
          ...menu,
        }}
      >
        {renderChildren ? (
          cloneElement(renderChildren(children), {
            onContextMenu: (ev: React.MouseEvent<HTMLElement>) => {
              ev.stopPropagation?.();
              Children.only(renderChildren(children))?.props?.onContextMenu?.(ev as any);
            },
          })
        ) : (
          <div
            onContextMenu={(ev) => ev.stopPropagation()}
            className={targetClassName}
            style={targetStyle}
          >
            {children}
          </div>
        )}
      </Dropdown>
    );
  },
);
