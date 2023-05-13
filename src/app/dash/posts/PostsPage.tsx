"use client";

import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  PostModelKeysList,
  PostModelKeysMeta,
  PostModelType,
} from "@/data/models/post";
import { ZodFirstPartyTypeKind } from "@/utils/zod";

dayjs.extend(relativeTime);

const postsMeta = PostModelKeysMeta;
const columns: ColumnsType<PostModelType> = PostModelKeysList.map((key) => ({
  title: key,
  key,
  dataIndex: key,
  render:
    postsMeta[key].typeName === ZodFirstPartyTypeKind.ZodDate
      ? (text) => {
          if (!text) return null;
          const d = dayjs(text);
          return (
            <Tooltip title={d.format("YYYY-MM-DD HH:mm")}>
              {dayjs().from(d)}
            </Tooltip>
          );
        }
      : undefined,
}));

export default function PostsPage({ posts = [] as PostModelType[] }) {
  return <Table columns={columns} dataSource={posts}></Table>;
}
