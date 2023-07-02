import { Dropdown, type DropdownProps } from "antd";
import {
  cloneElement,
  forwardRef,
  useImperativeHandle,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { type Nullish } from "~/utils/type";

export type CustomDropdownRef = { setOpen: (o: boolean) => void };
export type CustomDropdownProps<
  T extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements,
> = SimpleMerge<
  DropdownProps,
  {
    scope?: string;
    targetClassName?: string;
    targetStyle?: React.HTMLAttributes<T>["style"];
    renderChildren?: (children: ReactNode) => ReactElement;
    onOpenChange?: (open: boolean) => Nullish<boolean>;
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
  function CustomDropdown<T extends keyof JSX.IntrinsicElements>(
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
            onContextMenu: (ev: any) => ev.stopPropagation?.(),
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
