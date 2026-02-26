"use client";
import React from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

import { useMailStore } from "@/store/mails";
import { capitalCase } from "change-case";
import { SyncButton } from "./syncButton";
import { useParams, usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settings";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event";
const BreadcrumbInfo = React.memo(() => {
    const selected_mailbox = useMailStore((s) => s.selected_mailbox);
    const params = useParams();

    const activeItem = useSettingsStore((s) => s.activeItem);
    const keys = useSettingsStore((s) => s.keys);

    const { emit } = useCustomEvent(CustomEventKey.SyncSettings);
    const pathname = usePathname();
    const pattern = /^\/v2\/u\/mail\/(?!settings\/)[^\/]+\/[^\/]+$/;
    const match = pathname.match(pattern);

    return (
        <Fragment>
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        {pathname.includes("/v2/u/mail") && (
                            <>
                                <BreadcrumbLink href="/v2/u/mail/inbox">Mail</BreadcrumbLink>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>
                                    {capitalCase(selected_mailbox || (params as any)["folder"] || "Inbox")}
                                </BreadcrumbPage>
                            </>
                        )}
                        {pathname.includes("/v2/u/settings") && (
                            <>
                                <BreadcrumbLink href="/v2/u/mail">Settings</BreadcrumbLink>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>{keys[activeItem]}</BreadcrumbPage>
                                <BreadcrumbSeparator />
                                <Button
                                    onClick={emit}
                                    size={"icon"}
                                    variant={"ghost"}
                                    className="ml-2 rounded-full"
                                >
                                    <RefreshCcw />
                                </Button>

                            </>
                        )}
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {pathname.includes("/v2/u/mail") && !match && <SyncButton />}
        </Fragment>
    );
});

BreadcrumbInfo.displayName = "BreadcrumbInfo";

export default BreadcrumbInfo;