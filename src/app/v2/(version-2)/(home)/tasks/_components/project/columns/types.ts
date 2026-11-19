import type getColumns from "@tasks/_fetchers/column/get-columns";

export type ProjectColumn = Awaited<ReturnType<typeof getColumns>>[number];
