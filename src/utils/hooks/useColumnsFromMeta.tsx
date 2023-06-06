import { SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, InputNumber, Select, Tag, Tooltip, type InputRef } from "antd";
import { type RangePickerProps } from "antd/es/date-picker";
import { type ColumnsType, type ColumnType } from "antd/es/table";
import { type FilterConfirmProps } from "antd/es/table/interface";
import { PresetColors } from "antd/es/theme/interface/presetColors";
import { debounce, omit } from "radash";
import { useCallback, useEffect, useMemo, useRef, useState, type Key, type Ref } from "react";
import { DATE_TIME_FORMAT } from "~/data/configs";
import {
  TableColumnType,
  type TableColumnFilter,
  type TableColumnOptions,
} from "~/data/schemas/table";
import { colors } from "~/data/theme";
import { dayjs } from "~/lib/dayjs";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { camelCasePrettify, jsonParse } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

const renderers = {
  [TableColumnType.DATE]: (filter: TableColumnFilter[TableColumnType.DATE]) => (text: string) => {
    const d = dayjs(text);
    return <Tooltip title={d.format("YYYY-MM-DD HH:mm")}>{dayjs().from(d)}</Tooltip>;
  },
  [TableColumnType.ENUM]: (filter: TableColumnFilter[TableColumnType.ENUM]) => (text: string) => {
    const keys = filter.values;
    let i = keys.indexOf(text);
    i = i === -1 ? 0 : i;
    const d = dayjs(text);
    return <Tag color={PresetColors[i]}>{text}</Tag>;
  },
  mono: (_filter: any) => (text: string) => {
    return <pre>{text}</pre>;
  },
};

const getInputComponent = {
  [TableColumnType.STRING]:
    (filter: TableColumnFilter[TableColumnType.STRING]) =>
    (
      ref: Ref<InputRef>,
      value: string | undefined,
      setSelectedKeys: (keys: Key[]) => void,
      doSearch: () => void,
    ) =>
      (
        <Input
          allowClear
          ref={ref}
          value={value}
          onChange={(e) => {
            const keys = e.target.value ? [e.target.value] : [];
            setSelectedKeys(keys);
          }}
          onPressEnter={doSearch}
        />
      ),
  [TableColumnType.ENUM]:
    (filter: TableColumnFilter[TableColumnType.ENUM]) =>
    (
      ref: Ref<InputRef>,
      value: string | undefined,
      setSelectedKeys: (keys: Key[]) => void,
      doSearch: () => void,
    ) =>
      (
        <Select
          mode={"multiple"}
          allowClear
          value={value?.split(".")}
          onChange={(val) => setSelectedKeys(val?.length ? [val.join(".")] : [])}
          options={(filter as { values: string[] }).values.map((el) => ({
            label: el,
            value: el,
          }))}
        ></Select>
      ),
  [TableColumnType.NUMBER]:
    (filter: TableColumnFilter[TableColumnType.NUMBER]) =>
    (
      ref: Ref<HTMLInputElement>,
      value: string | undefined,
      setSelectedKeys: (keys: Key[]) => void,
      doSearch: () => void,
    ) =>
      (
        <InputNumber
          ref={ref}
          value={value}
          onChange={(val) => {
            const keys = val ? [val] : [];
            setSelectedKeys(keys);
          }}
          onPressEnter={doSearch}
        />
      ),
  [TableColumnType.DATE]:
    (filter: TableColumnFilter[TableColumnType.DATE]) =>
    (
      ref: Ref<any>,
      value: string | undefined,
      setSelectedKeys: (keys: Key[]) => void,
      doSearch: () => void,
    ) =>
      (
        <DatePicker.RangePicker
          ref={ref}
          allowClear
          showTime={{ format: "HH:mm" }}
          format={DATE_TIME_FORMAT}
          value={
            value
              ?.split(".")
              .map((v) => v && dayjs(v, DATE_TIME_FORMAT)) as RangePickerProps["value"]
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
  const { queryParams, setQueryParams } = useQueryParams();

  const init = useRef(false);
  useEffect(() => {
    init.current = true;
  }, []);

  const [searches, setSearches] = useState<Record<string, string | undefined>>(() =>
    jsonParse<Record<string, string>>(decodeURIComponent(String(queryParams.filter ?? ""))),
  );

  useEffect(() => {
    if (init.current)
      setQueryParams({
        ...queryParams,
        filter: Object.keys(searches).length
          ? encodeURIComponent(JSON.stringify(searches))
          : undefined,
      });
  }, [searches]);

  const searchedColumns = Object.keys(searches);
  const searchInput = useRef<InputRef | HTMLInputElement | any>(null);

  const handleSearch = useCallback(
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
    [],
  );

  const handleReset = (
    setSelectedKeys: (key: Key[]) => void,
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: string,
  ) => {
    setSearches((s) => omit(s, [dataIndex]));
    handleSearch.cancel();
    setSelectedKeys([]);
    confirm();
  };

  const getColumnSearchProps = useCallback(
    (dataIndex: string | string[]): ColumnType<object> => {
      const _dataIndex = joinStringArray(dataIndex);
      const i =
        _dataIndex in columnsMeta &&
        columnsMeta[_dataIndex]?.filterable &&
        columnsMeta[_dataIndex]?.type?.typeName;
      const inputComponent =
        i &&
        i in getInputComponent &&
        getInputComponent[i as keyof typeof getInputComponent](
          columnsMeta[_dataIndex]?.type as any,
        );

      return !inputComponent
        ? {}
        : {
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
              if (!init.current && searches[_dataIndex] !== selectedKeys[0])
                setSelectedKeys(searches[_dataIndex] ? [searches[_dataIndex]!] : []);

              return (
                <div className={"flex w-56 flex-col gap-3 p-2"}>
                  <div className="flex gap-3 self-stretch">
                    <Button
                      type={"primary"}
                      className={"flex-1"}
                      onClick={() => handleSearch(selectedKeys, confirm, _dataIndex)}
                    >
                      Apply
                    </Button>
                    <Button
                      className={"flex-1"}
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
                  )}
                </div>
              );
            },

            filterIcon: () => {
              const isSelected = !!searches[_dataIndex];
              return (
                <SearchOutlined
                  className={cn("transition-all", {
                    // "text-daw-primary": isSelected,
                  })}
                  style={{
                    scale: "1.2",
                    color: isSelected ? colors.primary.dark : undefined,
                  }}
                />
              );
            },

            onFilterDropdownOpenChange: (visible: boolean) => {
              if (visible) {
                setTimeout(
                  () => searchInput.current?.select?.() ?? searchInput.current?.focus?.(),
                  100,
                );
              }
            },

            // render: (text, record) => {
            //   const search = searches[_dataIndex];
            //   const highlighted = search ? (
            //     <mark>
            //       <Highlight
            //         searchWords={[search]}
            //         autoEscape
            //         textToHighlight={text ? text.toString() : ""}
            //       />
            //     </mark>
            //   ) : (
            //     text
            //   );
            //   if (render) {
            //     return render(highlighted, record, search);
            //   }
            //   return highlighted;
            // },
          };
    },
    [searches, columnsMeta],
  );

  const columns: ColumnsType<TData> = useMemo(
    () =>
      Object.keys(columnsMeta).map((key) => ({
        title: columnsMeta[key]?.title || camelCasePrettify(key),
        dataIndex: key,
        render: columnsMeta[key]?.mono
          ? renderers.mono(columnsMeta[key]?.type)
          : (renderers as any)[columnsMeta[key]?.type?.typeName as any]?.(columnsMeta[key]?.type) ??
            String,
        sorter: columnsMeta[key]?.sortable,
        ellipsis: true,
        className: "max-w-[200px]",
        ...getColumnSearchProps(key),
      })) as ColumnsType<TData>,
    [columnsMeta],
  );

  return { columns, searchedColumns, searches };
};
