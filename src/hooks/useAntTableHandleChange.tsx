import { type TableProps } from "antd";
import { type SorterResult } from "antd/es/table/interface";
import { mapValues, shake } from "radash";
import { useCallback } from "react";
import { useQueryParams } from "~/hooks/useQueryParams";

const dir = { ascend: "asc", descend: "desc" };

export function useAntTableHandleChange<TData extends object>() {
  const { setQueryParams } = useQueryParams();
  const handleTableChange = useCallback<NonNullable<TableProps<TData>["onChange"]>>(
    (
      { current, pageSize, total: _total },
      filters,
      sorter,
      { action, currentDataSource: _data },
    ) => {
      if (action === "filter") {
        const f = shake(mapValues(filters, (v) => v?.[0]));
        setQueryParams({
          filter: Object.keys(f).length ? encodeURIComponent(JSON.stringify(f)) : undefined,
        });
      } else if (action === "paginate") setQueryParams({ page: current, pageSize });
      else if (action === "sort") {
        const s = sorter as SorterResult<TData>;
        if (!s.column) setQueryParams({ sort: undefined, order: undefined });
        else if (s)
          setQueryParams({
            sort: s.field,
            order: s.order && dir[s.order],
          });
      }
    },
    [setQueryParams],
  );
  return { handleTableChange };
}
