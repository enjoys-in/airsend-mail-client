import { Link } from "@tanstack/react-router";
import { FolderXIcon, LockIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageTitle from "@tasks/_components/page-title";
import { Button } from "@tasks/_components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@tasks/_components/ui/empty";
import type { ProjectUnavailableReason } from "@tasks/_lib/project-unavailable-reason";

type Props = {
  reason: ProjectUnavailableReason;
  workspaceId: string;
};

export default function ProjectUnavailable({ reason, workspaceId }: Props) {
  const { t } = useTranslation();
  const isForbidden = reason === "forbidden";
  const title = isForbidden
    ? t("workspace:projects.unavailable.noAccessTitle")
    : t("workspace:projects.unavailable.notFoundTitle");

  return (
    <Empty className="h-full">
      <PageTitle title={title} />
      <EmptyHeader>
        <EmptyMedia variant="icon">
          {isForbidden ? <LockIcon /> : <FolderXIcon />}
        </EmptyMedia>
        <EmptyTitle role="heading" aria-level={1}>
          {title}
        </EmptyTitle>
        <EmptyDescription>
          {isForbidden
            ? t("workspace:projects.unavailable.noAccessDescription")
            : t("workspace:projects.unavailable.notFoundDescription")}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          variant="outline"
          render={
            <Link
              to="/dashboard/workspace/$workspaceId"
              params={{ workspaceId }}
            />
          }
        >
          {t("workspace:projects.unavailable.backToWorkspace")}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
