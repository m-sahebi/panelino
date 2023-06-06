import { FilterFilled, FilterOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Select, Tag, Tooltip, type InputRef } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";
import { type ColumnsType, type ColumnType } from "antd/es/table";
import { type FilterConfirmProps } from "antd/es/table/interface";
import { PresetColors } from "antd/es/theme/interface/presetColors";
import { debounce, omit } from "radash";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Key,
  type ReactNode,
  type Ref,
} from "react";
import { DATE_TIME_FORMAT } from "~/data/configs";
import {
  TableColumnType,
  type TableColumnFilter,
  type TableColumnOptions,
} from "~/data/schemas/table";
import { dayjs } from "~/lib/dayjs";
import { type RangePickerRef, type SelectRef } from "~/utils/ant";
import { useQueryParamsObject } from "~/utils/hooks/useQueryParamsObject";
import { camelCasePrettify, jsonParse } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

const renderers = {
  [TableColumnType.DATE]: (_filter: TableColumnFilter[TableColumnType.DATE]) => (text: string) => {
    const d = dayjs(text);
    return <Tooltip title={d.format("YYYY-MM-DD HH:mm")}>{dayjs().from(d)}</Tooltip>;
  },
  [TableColumnType.ENUM]: (filter: TableColumnFilter[TableColumnType.ENUM]) => (text: string) => {
    const i = filter.values.indexOf(text);
    return <Tag color={PresetColors[i] ?? PresetColors[0]}>{text}</Tag>;
  },
  mono: (_filter: any) => (text: string) => {
    return <pre>{text}</pre>;
  },
};

const getInputComponent: {
  [p in
    | TableColumnType.STRING
    | TableColumnType.NUMBER
    | TableColumnType.ENUM
    | TableColumnType.DATE]: (
    ref: Ref<InputRef | RangePickerRef | SelectRef | HTMLInputElement>,
    value: string | undefined,
    setSelectedKeys: (keys: Key[]) => void,
    doSearch: () => void,
    filter: TableColumnFilter[p],
  ) => ReactNode;
} = {
  [TableColumnType.STRING]: (ref, value, setSelectedKeys, doSearch, _filter) => (
    <Input
      allowClear
      ref={ref as Ref<InputRef>}
      value={value}
      onChange={(e) => {
        const keys = e.target.value ? [e.target.value] : [];
        setSelectedKeys(keys);
      }}
      onPressEnter={doSearch}
    />
  ),
  [TableColumnType.ENUM]: (ref, value, setSelectedKeys, doSearch, filter) => (
    <Select
      ref={ref as Ref<SelectRef>}
      mode="multiple"
      allowClear
      value={value?.split(".")}
      onChange={(val) => setSelectedKeys(val?.length ? [val.join(".")] : [])}
      options={(filter as { values: string[] }).values.map((el) => ({
        label: el,
        value: el,
      }))}
    />
  ),
  [TableColumnType.NUMBER]: (ref, value, setSelectedKeys, doSearch, _filter) => (
    <InputNumber
      ref={ref as Ref<HTMLInputElement>}
      value={value}
      onChange={(val) => {
        const keys = val ? [val] : [];
        setSelectedKeys(keys);
      }}
      onPressEnter={doSearch}
    />
  ),
  [TableColumnType.DATE]: (ref, value, setSelectedKeys, _doSearch, _filter) => (
    <DatePicker.RangePicker
      ref={ref as Ref<RangePickerRef>}
      allowClear
      showTime={{ format: "HH:mm" }}
      format={DATE_TIME_FORMAT}
      value={
        value?.split(".").map((v) => v && dayjs(v, DATE_TIME_FORMAT)) as RangePickerProps["value"]
      }
      onChange={(val) => {
        if (!val) setSelectedKeys([]);
      }}
      onOk={(val) => {
        setSelectedKeys(
          val ? [val.map((v) => v && dayjs(v).format(DATE_TIME_FORMAT)).join(".")] : [],
        );
      }}
    />
  ),
};

function joinStringArray(value: string | string[]) {
  if (typeof value === "string") return value;
  return value.join(".");
}

export const useColumnsFromMeta = <
  TData extends object,
  TMeta extends {
    [p: string]: TableColumnOptions | null;
  } = {
    [p: string]: TableColumnOptions | null;
  },
>(
  columnsMeta: TMeta,
) => {
  const { queryParams } = useQueryParamsObject();

  const init = useRef(false);
  useEffect(() => {
    init.current = true;
  }, []);

  const [searches, setSearches] = useState<Record<string, string | undefined>>(() =>
    jsonParse<Record<string, string>>(decodeURIComponent(String(queryParams.filter ?? ""))),
  );

  const searchedColumns = Object.keys(searches);
  const searchInput = useRef<InputRef | RangePickerRef | SelectRef | HTMLInputElement>(null);

  const handleSearch = useMemo(
    () =>
      debounce(
        { delay: 400 },
        (selectedKeys: Key[], confirm: (param?: FilterConfirmProps) => void, dataIndex: string) => {
          // confirm(false);
          setSearches((s) =>
            selectedKeys[0] != null
              ? {
                  ...s,
                  [dataIndex]: selectedKeys[0] as string,
                }
              : omit(s, [dataIndex]),
          );
          confirm();
        },
      ),
    [setSearches],
  );

  const handleReset = useCallback(
    (
      setSelectedKeys: (key: Key[]) => void,
      confirm: (param?: FilterConfirmProps) => void,
      dataIndex: string,
    ) => {
      setSearches((s) => omit(s, [dataIndex]));
      handleSearch.cancel();
      setSelectedKeys([]);
      confirm();
    },
    [handleSearch],
  );

  const columns = useMemo(() => {
    function getColumnSearchProps(dataIndex: string | string[]): ColumnType<object> {
      const _dataIndex = joinStringArray(dataIndex);
      const i =
        _dataIndex in columnsMeta &&
        columnsMeta[_dataIndex]?.filterable &&
        columnsMeta[_dataIndex]?.type;

      const inputComponent =
        i && i in getInputComponent && getInputComponent[i as keyof typeof getInputComponent];

      return !inputComponent
        ? {}
        : {
            filterDropdown: ({
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters: _clearFilters,
            }) => {
              if (!init.current && searches[_dataIndex] !== selectedKeys[0])
                setSelectedKeys(searches[_dataIndex] ? [searches[_dataIndex] as string] : []);

              return (
                <div className="flex w-56 flex-col gap-3 p-2">
                  <div className="flex gap-3 self-stretch">
                    <Button
                      type="primary"
                      className="flex-1"
                      onClick={() => handleSearch(selectedKeys, confirm, _dataIndex)}
                    >
                      Apply
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleReset(setSelectedKeys, confirm, _dataIndex)}
                    >
                      Reset
                    </Button>
                  </div>
                  {inputComponent?.(
                    searchInput,
                    selectedKeys[0] as string | undefined,
                    setSelectedKeys,
                    () => handleSearch(selectedKeys, confirm, _dataIndex),
                    columnsMeta[_dataIndex] as any,
                  )}
                </div>
              );
            },

            filterIcon: () => {
              const isSelected = !!searches[_dataIndex];
              return isSelected ? (
                <FilterFilled className="text-daw-primary" style={{ scale: "1.2" }} />
              ) : (
                <FilterOutlined className={cn("transition-all")} style={{ scale: "1.2" }} />
              );
            },

            onFilterDropdownOpenChange: (visible: boolean) => {
              if (visible) {
                setTimeout(
                  () =>
                    searchInput.current &&
                    (
                      ("select" in searchInput.current && searchInput.current.select) ||
                      ("focus" in searchInput.current && searchInput.current.focus) ||
                      null
                    )?.(),
                  100,
                );
              }
            },
          };
    }

    return Object.keys(columnsMeta).map((key) => ({
      title: columnsMeta[key]?.title || camelCasePrettify(key),
      dataIndex: key,
      render: columnsMeta[key]?.mono
        ? renderers.mono(columnsMeta[key])
        : (renderers as any)[columnsMeta[key]?.type as any]?.(columnsMeta[key]) ?? String,
      sorter: columnsMeta[key]?.sortable,
      ellipsis: true,
      className: "max-w-[200px]",
      ...getColumnSearchProps(key),
    })) as ColumnsType<TData>;
  }, [searches, columnsMeta, handleReset, handleSearch]);

  return { columns, searchedColumns, searches };
};
