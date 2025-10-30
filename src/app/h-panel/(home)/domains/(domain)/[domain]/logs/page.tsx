import * as React from "react";
import serverAxios from "@/lib/api/serverAxios";
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong";
import { LogViewer } from "./_components/logViewer";

const page = async ({ params }: { params: any }) => {
  const { domain } = await params;

  try {
    const { data } = await serverAxios.get(
      `/api/v1/admin/domain/logs/${domain}`,
      {
        withCredentials: true,
      }
    );
    if (!data.success) {
      throw new Error(data.message);
    }
    return <LogViewer logs={data.result} />;
  } catch (error) {
    return <SomethingWentWrong />;
  }
};

export default page;
