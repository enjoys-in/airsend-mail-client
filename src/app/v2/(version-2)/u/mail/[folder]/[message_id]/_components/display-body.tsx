"use client";

import { Button } from "@/components/ui/button";
import { Fragment, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { MailData } from "@/lib/types/mail.interface";
import { ApiResponse } from "@/lib/types";
import { API } from "@/lib/api/handler";
import { AxiosResponse } from "axios";
import { useMailStore } from "@/store/mails";
import { airsendDB } from "@/db";
import { useAppSelector } from "@/store/hooks";
import { Security } from "@/lib/security";
import InlineReplyBox from "./inline-reply-box";
import { type ReplyMode } from "./use-mail-actions";
import { useMultiTabStore } from "@/store/settings/multiTabSystem";
import {
    getDecryptedFields,
    buildReplyBody,
    buildForwardBody,
} from "./use-mail-actions";

const s = new Security();

export const MailDisplay = ({
  folder,
  message_id,
  children,
}: {
  folder: string;
  message_id: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const currAccount = useAppSelector((state) => state.accounts.currAccount);
  const { selectedMail, setSelectedMail, setLoading } = useMailStore();
  const createTabWithData = useMultiTabStore((s) => s.createTabWithData);

  const fetchMailBodyFromCache = async () => {
    await airsendDB.getItemByKey("mails", message_id as string).then((item) => {
      if (!item) {
        setLoading(true);
        fetchMailBody();
        return;
      }
      if (item.is_read) {
        setLoading(false);
        setSelectedMail(item as any);
        return;
      }
    });
  };
  const fetchMailBody = async () => {
    try {
      const { data } = (await API.getSingleMailData(
        message_id
      )) as AxiosResponse<ApiResponse<MailData>>;
      if (!data.success) {
        throw new Error(data.message);
      }
      setLoading(false);
    } catch (error) {}
  };

  /** Pop-out handler: opens the inline reply as a compose popup tab */
  const handlePopOut = (mode: ReplyMode) => {
    if (!selectedMail) return;
    const f = getDecryptedFields(selectedMail);

    if (mode === "forward") {
      const body = buildForwardBody(selectedMail, f);
      createTabWithData(`Fwd: ${f.subject || "(no subject)"}`, {
        to: [],
        subject: f.subject?.startsWith("Fwd:") ? f.subject : `Fwd: ${f.subject || ""}`,
        body,
      });
    } else {
      const body = buildReplyBody(selectedMail, f);
      // Use reply_to if available, otherwise from_email
      const replyAddress = f.replyTo || f.fromEmail;
      const to =
        selectedMail.folder === "sent"
          ? (f.recipients.length > 0 ? f.recipients : [f.recipient])
          : [replyAddress];
      createTabWithData(`Re: ${f.subject || "(no subject)"}`, {
        to: to.filter(Boolean),
        subject: f.subject?.startsWith("Re:") ? f.subject : `Re: ${f.subject || ""}`,
        body,
      });
    }
  };

  useEffect(() => {
    if (!selectedMail) {
      fetchMailBody();
    } else {
      fetchMailBodyFromCache();
    }
  }, []);

  return (
    <Fragment>
      <Separator />
      <ScrollArea className="flex-1 flex flex-col overflow-auto border-t border-gray-300 dark:border-gray-800">
        {selectedMail && children}
      </ScrollArea>

      {/* Gmail-style inline reply / forward box — fixed at bottom, outside scroll */}
      <InlineReplyBox onPopOut={handlePopOut} />
    </Fragment>
  );
};
