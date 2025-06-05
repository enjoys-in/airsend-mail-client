import {
  ChevronDown,
  ChevronLeft,
  Forward,
  Lock,
  MoreVertical,
  Reply,
  Star,
  Trash2,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import Link from "next/link";
import { cn, formatEmail } from "@/lib/utils";
import {
  toggleMailStar,
  removeMails,
  updateReadStatus,
  setCurrentMail,
} from "@/store/slices/mail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMemo, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { useRouter } from "next/navigation";
import moment from "moment";
import { ROLE } from "@/lib/types/user.interface";
import FileAttachment from "./file-attachment";
import { FileAttachmentInterface } from "@/lib/types/mail.interface";

function MailDisplay() {
  const router = useRouter()
  const dispatch = useAppDispatch();
  const currAccount = useAppSelector((state) => state.accounts.currAccount);
  const currMail = useAppSelector((state) => state.mails.currentMail);

  const replyTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const emailContents = useMemo(
    () => currMail?.content || "",
    [currMail?.content]
  );

  const handleReplyBtnClicked = () => {
    if (!replyTextAreaRef.current || !currMail) return;
    replyTextAreaRef.current.focus();
    if (replyTextAreaRef.current.value.trim().length === 0) {
      replyTextAreaRef.current.value = "@" + currMail.from + " ";
    }
  };

  return (
    <div className="md:flex-1 flex h-[100dvh] md:h-full flex-col w-full overflow-auto md:overflow-hidden">
      {!currMail ? (
        <div className="p-8 text-center flex-1 flex flex-col justify-center items-center opacity-30 select-none">
          <Image
            draggable={false}
            className="hidden dark:block"
            src={"/no-msg-dark.svg"}
            alt="no message"
            width={200}
            height={200}
          />
          <Image
            draggable={false}
            className="block dark:hidden"
            src={"/no-msg-light.svg"}
            alt="no message"
            width={200}
            height={200}
          />
          <p>No message selected</p>
        </div>
      ) : (
        <div
          className="flex-1 md:flex-none flex flex-col overflow-auto"
          style={{ height: "calc(100dvh - 80px)" }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start p-4 pl-1 md:p-4 md:pl-1">
            <div className="flex items-start text-sm flex-1 md:gap-2">
              <Button size={"icon"} variant={"ghost"} onClick={() => router.back()}>
                <ChevronLeft />
              </Button>

              <Avatar>
                <AvatarImage alt={currMail?.from&&formatEmail(currMail.from)} />
                <AvatarFallback>
                  {currMail?.from&&formatEmail(currMail.from)
                    .split(" ")
                    .map((chunk) => chunk[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col ml-2 md:ml-0">
                <div className="flex flex-col sm:flex-row gap-2 align-text-bottom">
                  <div className="font-semibold">{currMail?.from&&formatEmail(currMail.from)}</div>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <span className="text-xs text-zinc-500">To me</span>
                  <Tooltip>
                    <Popover>
                      <PopoverTrigger asChild>
                        <TooltipTrigger asChild>
                          <Button
                            size={"icon"}
                            variant={"ghost"}
                            className="w-5 h-5"
                          >
                            <ChevronDown size={10} />
                          </Button>
                        </TooltipTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="flex w-[450px] px-4 sm:px-6 md:px-8 lg:px-10">
                        <div className="flex flex-row gap-4 px-2 py-4 text-sm">
                          {/* Left Column */}
                          <div className="flex flex-col items-end text-right shrink-0">
                            <div>from:</div>
                            <div>to:</div>
                            <div>date:</div>
                            <div>subject:</div>
                            <div>mailed-by:</div>
                            <div>security:</div>
                          </div>
                          {/* Right Column */}
                          <div className="flex flex-col">
                            <div>
                              <strong>{currMail.from&&formatEmail(currMail.from)}</strong>
                                                        
                            </div>                          
                            <div>{currMail?.to}</div>
                            <div>{moment(currMail.timestamp).format("lll")}</div>
                            <div>{currMail.subject}</div>
                            <div>{currMail.to}</div>
                            <div className="flex items-center gap-1">
                              <Lock size={10} />
                              Standard encryption (TLS)
                            </div>
                          </div>
                        </div>
                      </PopoverContent>

                    </Popover>
                    <TooltipContent>Show details</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            {currAccount?.role === ROLE.USER && (
              <div className="w-full lg:w-auto flex justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!currMail}
                      onClick={handleReplyBtnClicked}
                    >
                      <Reply className="h-4 w-4" />
                      <span className="sr-only">Reply</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reply</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!currMail}>
                      <Forward className="h-4 w-4" />
                      <span className="sr-only">Forward</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Forward</TooltipContent>
                </Tooltip>
                 
                <AlertDialog>
                  <AlertDialogTrigger
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" })
                    )}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Trash2 className={cn("h-4 w-4")} />
                          <span className="sr-only">Trash</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Add to Trash</TooltipContent>
                    </Tooltip>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this mail from your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => dispatch(removeMails([currMail.message_id]))}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!currMail}>
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        dispatch(
                          updateReadStatus({
                            selectedIds: [currMail.message_id],
                            newIsRead: currMail.synced ? false : true,
                          })
                        )
                      }
                    >
                      Mark as {currMail.synced ? "unread" : "read"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>Star thread</DropdownMenuItem>
                    <DropdownMenuItem>Add label</DropdownMenuItem>
                    <DropdownMenuItem>Mute thread</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          <ScrollArea className="flex-1 flex flex-col overflow-auto border-t border-gray-300 dark:border-gray-800">
            <h2 className="pl-4 text-2xl font-bold mt-4">{currMail.subject}</h2>
            {Array.isArray(currMail.hasAttachment) && currMail.hasAttachment.length > 0 && (<FileAttachment attachments={currMail.hasAttachment} messageId={currMail.message_id} />)}
            <div
              className="flex-1 whitespace-pre-wrap px-1 py-4 md:p-4 text-sm"
              // dangerouslySetInnerHTML={{ __html: `<iframe  class="w-full h-full bg-black" srcdoc="${emailContents}" />` }}
            dangerouslySetInnerHTML={{ __html: emailContents }}
            />
            <Separator className="mt-auto" />
            {currAccount?.role === ROLE.USER && (
              <div className="p-4 ">
                <form>
                  <div className="grid gap-4">
                    <Textarea
                      ref={replyTextAreaRef}
                      className="p-4"
                      placeholder={`Reply ${currMail.from}...`}
                    />
                    <div className="flex items-center">
                      <Button
                        onClick={(e) => e.preventDefault()}
                        size="sm"
                        className="ml-auto"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}

          </ScrollArea>
        </div>
      )}
    </div>
  );
}
export default MailDisplay;
