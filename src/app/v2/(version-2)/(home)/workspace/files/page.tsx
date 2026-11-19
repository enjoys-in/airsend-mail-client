import { redirect } from "next/navigation";

export default function WorkspaceFilesRedirect() {
  redirect("/v2/files");
}
