import { getRawToken } from "~/_server/utils/fetch";
import { UploadPage } from "~/app/dash/upload/UploadPage";

export default async function Home() {
  return <UploadPage token={getRawToken()} />;
}
