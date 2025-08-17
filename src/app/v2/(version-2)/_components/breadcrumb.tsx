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
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settings";

import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomEventKey, useCustomEvent } from "@/hooks/use-custom-event";
const BreadcrumbInfo = () => {
    const { selected_mailbox } = useMailStore();
    const { activeItem,keys } = useSettingsStore();

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
                                <BreadcrumbLink href="/v2/u/mail">Mail</BreadcrumbLink>
                                <BreadcrumbSeparator />
                                <BreadcrumbPage>
                                    {capitalCase(selected_mailbox || "Inbox")}
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
};

export default BreadcrumbInfo;
