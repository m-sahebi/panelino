import { LoadingOutlined } from "@ant-design/icons";
import { AutoComplete, ConfigProvider, Divider, Empty, Modal, Pagination, Spin } from "antd";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { createStateContext, useDebounce } from "react-use";
import { trpc } from "~/lib/trpc";
import { type SelectRef } from "~/utils/ant";

type GlobalSearchState = { opened: boolean };
const [_useGlobalSearch, _GlobalSearchProvider] = createStateContext({
  opened: false,
} as GlobalSearchState);

export function useGlobalSearch() {
  const [state, setState] = _useGlobalSearch();
  const stateRef = useRef(state);
  stateRef.current = state;

  const toggleGlobalSearch = useCallback(
    () => setState((s: GlobalSearchState) => ({ ...s, opened: !s.opened })),
    [setState],
  );

  return {
    globalSearchState: state,
    toggleGlobalSearch,
    getGlobalSearchState: useCallback(() => stateRef.current, [stateRef]),
    setGlobalSearchState: setState,
  };
}

const modalTheme = {
  components: {
    Modal: {
      paddingContentHorizontalLG: 0,
      paddingMD: 0,
    },
    Select: {
      fontSizeLG: 20,
    },
  },
};

const SEARCH_MIN_LENGTH = 3;

const GlobalSearch = memo(function GlobalSearch() {
  const { globalSearchState, toggleGlobalSearch } = useGlobalSearch();
  const [search, setSearch] = useState<string>();
  const [searchDebounced, setSearchDebounced] = useState<string>();
  useDebounce(() => setSearchDebounced(search), 500, [search]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);
  const inputRef = useRef<SelectRef>(null);

  const searchLengthIsGteLimit = (searchDebounced?.length ?? 0) >= SEARCH_MIN_LENGTH;
  const { data, isLoading } = trpc.posts.getMany.useQuery(
    { search: searchDebounced, page, pageSize },
    { enabled: searchLengthIsGteLimit },
  );

  useEffect(() => {
    if (globalSearchState.opened) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch(undefined);
      setSearchDebounced(undefined);
    }
  }, [globalSearchState]);

  useHotkeys("/", toggleGlobalSearch, {}, [toggleGlobalSearch]);

  const dropdownRender = useCallback(
    (menu: ReactNode) => (
      <Spin size="large" spinning={isLoading} indicator={<LoadingOutlined />}>
        {menu}
        <Divider className="my-2" />
        <Pagination
          disabled={!data?.items.length}
          size="small"
          className="m-1"
          current={data?.page}
          // WORKAROUND cuz ant throws err when passing undefined to pageSize prop
          {...(data?.pageSize ? { pageSize: data.pageSize } : {})}
          total={data?.total}
          onChange={(page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
      </Spin>
    ),
    [isLoading, data],
  );

  return (
    <ConfigProvider theme={modalTheme}>
      <Modal
        className="-mt-16 p-0"
        maskStyle={{ backdropFilter: "blur(4px)" }}
        open={globalSearchState.opened}
        footer={null}
        closable={false}
        onCancel={toggleGlobalSearch}
        width={420}
        destroyOnClose
      >
        <div className="relative flex w-full items-center">
          <AutoComplete
            onKeyDown={(ev) => ev.key === "Escape" && toggleGlobalSearch()}
            allowClear
            showSearch
            className="m-0 w-full flex-1 px-3 py-2"
            open={searchLengthIsGteLimit || !!data}
            popupClassName="p-3"
            value={search}
            autoClearSearchValue={false}
            filterOption={false}
            bordered={false}
            ref={inputRef}
            placeholder="Search..."
            size="large"
            listHeight={540}
            listItemHeight={34}
            onChange={setSearch}
            onSearch={setSearch}
            // onSelect={}
            options={data?.items.map((v) => ({
              key: v.id,
              // value: v.id,
              label: <div className="text-base">{v.title}</div>,
            }))}
            notFoundContent={
              data == null ? (
                <div className="h-32" />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            }
            dropdownRender={dropdownRender}
            dropdownAlign={{ offset: [-12, 20] }}
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
});

export function GlobalSearchProvider({ children }: PropsWithChildren) {
  return (
    <_GlobalSearchProvider>
      <GlobalSearch />
      {children}
    </_GlobalSearchProvider>
  );
}
