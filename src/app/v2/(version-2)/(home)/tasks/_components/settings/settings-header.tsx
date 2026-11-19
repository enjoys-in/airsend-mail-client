import { HostedHeader } from "@tasks/_components/common/hosted-header";
import { ShortcutKeys } from "@tasks/_components/shortcuts/shortcut-keys";
import { useTranslation } from "react-i18next";
import type { SettingsBreadcrumb } from "@tasks/_components/settings/nav/get-settings-breadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@tasks/_components/ui/breadcrumb";
import { SidebarTrigger } from "@tasks/_components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@tasks/_components/ui/tooltip";

type SettingsHeaderProps = {
  breadcrumb: SettingsBreadcrumb | null;
};

export function SettingsHeader({ breadcrumb }: SettingsHeaderProps) {
  const { t } = useTranslation();

  const content = (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="-ml-1 h-6 w-6" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="flex items-center gap-2 text-[10px]">
              {t("navigation:settingsLayout.toggleSidebar")}
              <ShortcutKeys id="toggleSidebar" />
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="mx-1.5 h-4 w-px shrink-0 bg-border/80" />
      <Breadcrumb className="min-w-0 text-xs">
        <BreadcrumbList className="flex-nowrap text-xs">
          <BreadcrumbItem className="min-w-0">
            <span className="truncate font-normal text-muted-foreground">
              {breadcrumb?.section ?? t("navigation:page.settingsTitle")}
            </span>
          </BreadcrumbItem>
          {breadcrumb ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate text-xs font-normal text-card-foreground">
                  {breadcrumb.page}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : null}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );

  // Desktop, inside the AirSend shell: the breadcrumb goes in the AirSend top bar.
  return (
    <HostedHeader
      fallback={
        <header className="flex h-10 shrink-0 items-center gap-1 border-b border-border bg-card p-2">
          {content}
        </header>
      }
    >
      {content}
    </HostedHeader>
  );
}
