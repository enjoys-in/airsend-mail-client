import React, { ComponentProps, useEffect, useState } from "react";

import { cn, dateToFromNowDaily, formatEmail } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  ChevronDown,
  EllipsisVertical,
  Paperclip,
  RotateCw,
  Star,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelected,
  setMainCheckbox,
  updateReadStatus,
  removeMails,
  IMail,
  setCurrentMail,
} from "@/store/slices/mail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import moment from "moment";
import { ROLE, ROLE_TYPE } from "@/lib/types/user.interface";
import { airsendDB } from "@/db";
import { MailData } from "@/lib/types/mail.interface";
import { API } from "@/lib/api/handler";
import { Badge } from "@/components/ui/badge";

export function MailList() {
  const mails = useAppSelector((state) => state.mails.mails);
  const selectedMails = useAppSelector((state) => state.mails.selected);
  const currentMail = useAppSelector((state) => state.mails.currentMail);
  const mainCheckbox = useAppSelector((state) => state.mails.mainCheckbox);
  const currAccount = useAppSelector((state) => state.accounts.currAccount);
  const [mailStore, setMailStore] = useState<MailData[]>([])
  const dispatch = useAppDispatch();



  const syncMails = async () => {
    try {
      const { data } = await API.getAllMailData()
      if (!data.success) {
        return
      }
      await airsendDB.bulkAddItems("mails", (data.result))     
      setMailStore([...mails, ...data.result as any[]] as MailData[])
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    if (selectedMails.length === mails.length) {
      dispatch(setMainCheckbox(true));
    } else if (selectedMails.length === 0) {
      dispatch(setMainCheckbox(false));
    } else {
      dispatch(setMainCheckbox("indeterminate"));
    }

  }, [selectedMails]);

  useEffect(() => {
    // airsendDB.getItemByKey("mails",currAccount?.email as string).then((data) => {
    //   if (data) {
    //     setMailStore([...mails, ...data as any[]] as MailData[])
    //   }
    // })
  }, []);
  const handleSelectAll = (
    currState: "allChecked" | "allUnchecked" | "indeterminate"
  ) => {
    if (currState === "allChecked") {
      dispatch(setSelected([]));
    } else if (currState === "allUnchecked") {
      dispatch(setSelected(mails.map((mail) => mail.message_id)));
    } else if (currState === "indeterminate") {
      dispatch(setSelected(mails.map((mail) => mail.message_id)));
    }
  };
  const handleDeleteSelected = () => {
    dispatch(removeMails(selectedMails));
  };
  const handleMarkSeleted = () => {
    dispatch(updateReadStatus({ selectedIds: selectedMails, newIsRead: true }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-row gap-2 justify-between px-3 border-b">
        <div className="flex gap-2 items-center">
          <Checkbox
            checked={mainCheckbox}
            onCheckedChange={(checked) => {
              if (selectedMails.length === mails.length) {
                handleSelectAll("allChecked");
              } else if (selectedMails.length === 0) {
                handleSelectAll("allUnchecked");
              } else {
                handleSelectAll("indeterminate");
              }
            }}
            className={
              selectedMails.length > 0 ? "border-white" : "border-zinc-700"
            }
          />
          {selectedMails.length > 0 && (
            <p className="text-zinc-300">{selectedMails.length}</p>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size={"icon"}
                disabled={selectedMails.length === 0}
              >
                <ChevronDown
                  className={cn(
                    selectedMails.length > 0 ? "text-white" : "text-zinc-500"
                  )}
                  size={20}
                />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMarkSeleted}>
                Mark Read
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteSelected}>
                Delete({selectedMails.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center text-zinc-500">
          <Button variant="ghost" size={"icon"} onClick={syncMails}>
            <RotateCw size={20} />
          </Button>
        </div>
      </div>


      <ScrollArea
        className="flex flex-col gap-2 py-4 pt-0 w-full"
        style={{ height: "calc(100dvh - 72px - 40px)" }}
      >
        {[...mails, ...mailStore].length === 0 ?
          <div className=" flex flex-col gap-2 justify-center items-center mt-8 w-96">
            <span className="text-center sm:text-lg md:text-2xl">
              <p>Your Inbox is Empty</p><br />

            </span>
          </div>
          : [...mails, ...mailStore].map((mail, idx) => (
            <MailItem
              key={idx}
              mail={mail}
              isLast={idx === [...mails, ...mailStore].length - 1}
              currentMail={currentMail}
              selectedMails={selectedMails}

            />
          ))}
      </ScrollArea>
    </div>
  );
}

const MailItem = ({
  mail,
  currentMail,
  isLast,
  selectedMails,

}: {
  mail: MailData;
  currentMail: MailData | null;
  isLast: boolean;
  selectedMails: string[];

}) => {
  const dispatch = useAppDispatch();
  const handleFetchData = async (mailId: string ) => {
    const { data } = await API.getSingleMailData(mailId!);
    return data
  }
  const handleSetCurrentMail = async (message_id: string, synced: boolean) => {

    if (!synced) {
      const data = await handleFetchData(message_id)
      if (!data.success) return
      await airsendDB.updateItem("mails", message_id as string, {
        ...data.result, synced: true, isRead: true
      })
      return dispatch(setCurrentMail({ ...data.result, synced: true, isRead: true }))
    }
    const mail = await airsendDB.getItemByKey("mails", message_id)
    dispatch(setCurrentMail(mail))
  }

  return (
    <ContextMenu key={mail.message_id}>
      <ContextMenuTrigger>
        <Link
          onClick={() => handleSetCurrentMail(mail.message_id, mail.synced)}
          href={`?id=${mail.message_id}`}
          className={cn(
            "flex flex-row justify-between pl-3 mr-2 text-left text-sm transition-all duration-75",
            " hover:bg-zinc-200 dark:hover:bg-accent",
            "cursor-pointer w-screen md:w-full",
            currentMail?.message_id === mail.message_id &&
            "border-l-4 border-zinc-500 bg-zinc-300 dark:border-white dark:bg-[#1B1C1E]",
            isLast && "mb-28 md:mb-0"
          )}
        >
          <Checkbox
            className={cn(
              selectedMails.includes(mail.message_id)
                ? "border-white"
                : "border-zinc-700",
              "text-zinc-500 my-3"
            )}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (!selectedMails.includes(mail.message_id)) {
                dispatch(setSelected([...selectedMails, mail.message_id]));
              } else {
                dispatch(
                  setSelected(selectedMails.filter((id) => id !== mail.message_id))
                );
              }
            }}
            checked={selectedMails.includes(mail.message_id)}
          />

          <div className="flex flex-col flex-[4] justify-self-start ml-4 py-3">
            <div className="flex flex-row gap-2 items-center">
              <p className="text-xs">{formatEmail(mail.from)}</p>
              {mail.hasAttachment && (
                <span className="text-zinc-500">
                  <Paperclip size={16} />
                </span>
              )}
              {!mail.synced && (
                <div className="w-2 h-2 bg-red-500 rounded-full"> </div>
              )}
            </div>
            <p className="mt-2 font-bold">{mail.subject}</p>
            <p className="mt-2 text-zinc-500 text-xs line-clamp-2 max-w-[330px]">
              {mail.content}
            </p>
            <div>
              <Badge className="mt-2 font-bold">personal</Badge>
            </div>

          </div>
          <div className="flex flex-col flex-1 justify-between items-end">
            <div className="flex flex-row items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-fit h-fit p-3 hover:bg-zinc-500 dark:hover:bg-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    <EllipsisVertical size={16} />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Mark as read</DropdownMenuItem>
                  <DropdownMenuItem>Star thread</DropdownMenuItem>
                  <DropdownMenuItem>Add label</DropdownMenuItem>
                  <DropdownMenuItem>Mute thread</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className={cn("text-xs ", !mail.synced ? "font-bold text-gray-300" : "text-zinc-400")}>{dateToFromNowDaily(moment(mail.timestamp).toDate())}</div>
            
          </div>
        </Link>
      </ContextMenuTrigger>
      <Separator orientation="horizontal" />
      <ContextMenuContent>
        <ContextMenuItem>Mark as read</ContextMenuItem>
        <ContextMenuItem>Star thread</ContextMenuItem>
        <ContextMenuItem>Add label</ContextMenuItem>
        <ContextMenuItem>Mute thread</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
