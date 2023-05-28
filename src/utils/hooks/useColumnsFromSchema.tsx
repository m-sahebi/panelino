import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Tag,
  Tooltip,
  type InputRef,
} from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
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
  type Ref,
} from "react";
import { type z } from "zod";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { colors } from "~/data/theme";
import { dayjs } from "~/lib/dayjs";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { jsonParse } from "~/utils/json-parse";
import { cn } from "~/utils/tailwind";
import { ZodFirstPartyTypeKind, type ZodParsedDef } from "~/utils/zod";

const renderers = {
  [ZodFirstPartyTypeKind.ZodDate]: (schemaDefVal: z.ZodDateDef) => (text: string) => {
    const d = dayjs(text);
    return <Tooltip title={d.format("YYYY-MM-DD HH:mm")}>{dayjs().from(d)}</Tooltip>;
  },
  [ZodFirstPartyTypeKind.ZodNativeEnum]:
    (schemaDefVal: z.ZodNativeEnumDef) => (text: string) => {
      const keys = Object.keys(schemaDefVal.values);
      let i = keys.indexOf(text);
      i = i === -1 ? 0 : i;
      const d = dayjs(text);
      return <Tag color={PresetColors[i]}>{text}</Tag>;
    },
};

const getInputComponent = {
  [ZodFirstPartyTypeKind.ZodString]: (
    ref: Ref<InputRef>,
    value: string | undefined,
    setSelectedKeys: (keys: Key[]) => void,
    doSearch: () => void,
  ) => (
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
  [ZodFirstPartyTypeKind.ZodNativeEnum]: (
    ref: Ref<InputRef>,
    value: string | undefined,
    setSelectedKeys: (keys: Key[]) => void,
    doSearch: () => void,
  ) => (
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
  [ZodFirstPartyTypeKind.ZodNumber]: (
    ref: Ref<HTMLInputElement>,
    value: string | undefined,
    setSelectedKeys: (keys: Key[]) => void,
    doSearch: () => void,
  ) => (
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
  [ZodFirstPartyTypeKind.ZodDate]: (
    ref: Ref<any>,
    value: string | undefined,
    setSelectedKeys: (keys: Key[]) => void,
    doSearch: () => void,
  ) => (
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

export const useColumnsFromSchema = <
  TDef extends {
    [p: string]: ZodParsedDef<z.ZodTypeDef & { typeName?: string }>;
  },
>(
  schemaDef: TDef,
) => {
  const { queryParams, setQueryParams } = useQueryParams();

  const init = useRef(false);
  useEffect(() => {
    init.current = true;
  }, []);

  const [searches, setSearches] = useState<Record<string, string | undefined>>(() =>
    jsonParse<Record<string, string>>(
      decodeURIComponent(String(queryParams.filter ?? "")),
    ),
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
      (
        selectedKeys: Key[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: string,
      ) => {
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
      const i = _dataIndex in schemaDef && schemaDef[_dataIndex].typeName;
      const inputComponent =
        i &&
        i in getInputComponent &&
        getInputComponent[i as keyof typeof getInputComponent];
      return !inputComponent
        ? {}
        : {
            filterDropdown: ({
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
            }) => {
              if (!init.current && searches[_dataIndex] !== selectedKeys[0])
                setSelectedKeys(searches[_dataIndex] ? [searches[_dataIndex]!] : []);
              return (
                <div className={"flex w-56 flex-col gap-3 p-2"}>
                  {inputComponent?.(
                    searchInput,
                    selectedKeys[0] as string | undefined,
                    setSelectedKeys,
                    () => handleSearch(selectedKeys, confirm, _dataIndex),
                  )}
                  <div className="flex gap-3">
                    <Button
                      type={"primary"}
                      onClick={() => handleSearch(selectedKeys, confirm, _dataIndex)}
                    >
                      Apply
                    </Button>
                    <Button
                      onClick={() => handleReset(setSelectedKeys, confirm, _dataIndex)}
                    >
                      Reset
                    </Button>
                  </div>
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
    [searches],
  );

  const columns: ColumnsType<object> = useMemo(
    () =>
      Object.keys(schemaDef).map((key) => ({
        title: key,
        key,
        dataIndex: key,
        render: (renderers as any)[schemaDef[key].typeName!]?.(schemaDef[key]),
        sorter: true,
        ...getColumnSearchProps(key),
      })),
    [schemaDef],
  );

  return { columns, searchedColumns, searches };
};
