import { AutoComplete, ConfigProvider, Divider, Modal, Pagination, Spin, Tag } from "antd";
import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { LuLoader2 } from "react-icons/lu";
import { useDebounce } from "react-use";
import { CustomEmpty } from "~/components/CustomEmpty";
import { type SelectRef } from "~/data/types/ant";
import { useGlobalSearch } from "~/hooks/useGlobalSearch";
import { trpc } from "~/lib/trpc";

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

export const GlobalSearch = memo(function GlobalSearch() {
  const { globalSearch, toggleGlobalSearchOpened } = useGlobalSearch();
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
    if (globalSearch.opened) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearch(undefined);
      setSearchDebounced(undefined);
    }
  }, [globalSearch]);

  useHotkeys("/", toggleGlobalSearchOpened, {}, [toggleGlobalSearchOpened]);

  const dropdownRender = useCallback(
    (menu: ReactNode) => (
      <Spin size="large" spinning={isLoading} indicator={<LuLoader2 className="animate-spin" />}>
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
        open={globalSearch.opened}
        footer={null}
        closable={false}
        onCancel={toggleGlobalSearchOpened}
        width={420}
        destroyOnClose
      >
        <div className="relative flex w-full items-center">
          <AutoComplete
            onKeyDown={(ev) => ev.key === "Escape" && toggleGlobalSearchOpened()}
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
              label: (
                <div className="flex items-center gap-1">
                  <Tag>Post</Tag>
                  <span className="text-base">{v.title}</span>
                </div>
              ),
            }))}
            notFoundContent={data == null ? <div className="h-32" /> : <CustomEmpty />}
            dropdownRender={dropdownRender}
            dropdownAlign={{ offset: [-12, 20] }}
          />
        </div>
      </Modal>
    </ConfigProvider>
  );
});
