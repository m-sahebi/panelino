import PostsPage from "@/app/dash/posts/PostsPage";
import { API_URL } from "@/data/configs";
import { getServersideHeaders } from "@/server/utils/fetch";

export default async function page() {
  const posts = await (
    await fetch(`${API_URL}/posts`, { headers: getServersideHeaders() })
  ).json();
  return <PostsPage posts={posts} />;
}
