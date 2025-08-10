import {
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    Dialog,
    DialogFooter,
    DialogHeader,
    DialogClose,
  } from '../ui/dialog';
  import { BellOff, Check,  LoaderCircleIcon, Lock } from 'lucide-react';
  import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
  import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
 
  import { getListUnsubscribeAction } from '@/lib/email-utils';
 
  import { memo, useEffect, useMemo, useState, useRef } from 'react';
 
 
  import { TextShimmer } from '../ui/text-shimmer';
  import { cn } from '@/lib/utils';
 
  import { Separator } from '../ui/separator';
 
  import { MailIframe } from './mail-iframe';
  import { Button } from '../ui/button';
  import { format } from 'date-fns';
  import Image from 'next/image';
import { StreamingText } from './StreamingText';
import AttachmentsAccordion from './attachments-accordion';
import AttachmentDialog from './attachment-dialog';
const MailDisplay = ({ emailData, isMuted, index, totalEmails, demo }:any ) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [unsubscribed, setUnsubscribed] = useState(false);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);
    const [selectedAttachment, setSelectedAttachment] = useState<null | {
      id: string;
      name: string;
      type: string;
      url: string;
    }>(null);
    const [openDetailsPopover, setOpenDetailsPopover] = useState<boolean>(false);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    
  
     
  
    useEffect(() => {
      if (!demo) {
        if (totalEmails && index === totalEmails - 1) {
          setIsCollapsed(false);
          if (totalEmails > 5) {
            setTimeout(() => {
              const element = document.getElementById(`mail-${emailData.id}`);
              element?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        } else {
          setIsCollapsed(true);
        }
      }
    }, [index, emailData.id, totalEmails, demo]);
  
    const listUnsubscribeAction = useMemo(
      () =>
        emailData.listUnsubscribe
          ? getListUnsubscribeAction({
            listUnsubscribe: emailData.listUnsubscribe,
            listUnsubscribePost: emailData.listUnsubscribePost,
          })
          : undefined,
      [emailData.listUnsubscribe, emailData.listUnsubscribePost],
    );
  
    const _handleUnsubscribe = async () => {
      setIsUnsubscribing(true);
      try {
        // await handleUnsubscribe({
        //   emailData,
        // });
        setIsUnsubscribing(false);
        setUnsubscribed(true);
      } catch (e) {
        setIsUnsubscribing(false);
        setUnsubscribed(false);
      }
    };
  
    return (
      <div className={cn('relative flex-1 overflow-hidden')} id={`mail-${emailData.id}`}>
        <div className="relative h-full overflow-y-auto">
          <div
            className="flex flex-col gap-4 p-4 pb-2 transition-all duration-200 cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start justify-center gap-4">
                <Avatar className="h-8 w-8">
                  
                  <AvatarFallback className="bg-muted-foreground/50 dark:bg-muted/50">
                    {emailData?.sender?.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
  
                <div className="relative bottom-1 flex-1">
                  <div className="flex items-center justify-start gap-2">
                    <span className="font-semibold">{emailData?.sender?.name}</span>
                    <span className="text-muted-foreground flex grow-0 items-center gap-2 text-sm">
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap min-w-0">{emailData?.sender?.email}</span>
  
                      {listUnsubscribeAction && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={unsubscribed || isUnsubscribing}
                            >
                              {unsubscribed && <Check className="h-4 w-4" />}
                              {isUnsubscribing && (
                                <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                              )}
                              {unsubscribed
                                ?  "Unsubscribed"
                                :  "Unsubscribe"}
                            </Button>
                          </DialogTrigger>
  
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Unsubscribe</DialogTitle>
                              <DialogDescription className="break-words">
                               
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="gap-2">
                              <DialogClose asChild>
                                <Button disabled={isUnsubscribing} variant="outline">
                              Cancel
                                </Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button disabled={isUnsubscribing} onClick={_handleUnsubscribe}>
                                Unsubscribe
                                </Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {isMuted && <BellOff className="h-4 w-4" />}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <time className="text-muted-foreground text-xs">
                      {format(new Date(emailData?.receivedOn), 'PPp')}
                    </time>
                    <Popover open={openDetailsPopover} onOpenChange={setOpenDetailsPopover}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs underline hover:bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDetailsPopover(!openDetailsPopover);
                          }}
                          ref={triggerRef}
                        >
                           Details
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[420px] rounded-lg border p-3 shadow-lg"
                        onBlur={(e) => {
                          if (!triggerRef.current?.contains(e.relatedTarget)) {
                            setOpenDetailsPopover(false);
                          }
                        }}
                      >
                        <div className="space-y-1 text-sm">
                          <div className="flex">
                            <span className="w-24 text-end text-gray-500">
                            From:
                            </span>
                            <div className="ml-3">
                              <span className="text-muted-foreground pr-1 font-bold">
                                {emailData?.sender?.name}
                              </span>
                              {emailData?.sender?.name !== emailData?.sender?.email && (
                                <span className="text-muted-foreground">
                                  {emailData?.sender?.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex">
                            <span className="w-24 text-end text-gray-500">
                         To:
                            </span>
                            <span className="text-muted-foreground ml-3">
                              {/* {emailData?.to?.map((t) => t.email).join(', ')} */}
                            </span>
                          </div>
                          {emailData?.cc && emailData.cc.length > 0 && (
                            <div className="flex">
                              <span className="w-24 text-end text-gray-500">cc:
                              </span>
                              <span className="text-muted-foreground ml-3">
                                {/* {emailData?.cc?.map((t) => t.email).join(', ')} */}
                              </span>
                            </div>
                          )}
                          {emailData?.bcc && emailData.bcc.length > 0 && (
                            <div className="flex">
                              <span className="w-24 text-end text-gray-500">
                               bcc:
                              </span>
                              <span className="text-muted-foreground ml-3">
                                {/* {emailData?.bcc?.map((t) => t.email).join(', ')} */}
                              </span>
                            </div>
                          )}
                          <div className="flex">
                            <span className="w-24 text-end text-gray-500">
                              {/* {t('common.mailDisplay.date')}: */}
                            </span>
                            <span className="text-muted-foreground ml-3">
                              {format(new Date(emailData?.receivedOn), 'PPpp')}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="w-24 text-end text-gray-500">
                            mailed-by:
                            </span>
                            <span className="text-muted-foreground ml-3">
                              {emailData?.sender?.email}
                            </span>
                          </div>
                          <div className="flex">
                            <span className="w-24 text-end text-gray-500">
                            signed-by:
                            </span>
                            <span className="text-muted-foreground ml-3">
                              {emailData?.sender?.email}
                            </span>
                          </div>
                          {emailData.tls && (
                            <div className="flex items-center">
                              <span className="w-24 text-end text-gray-500">
                              TLS
                              </span>
                              <div className="text-muted-foreground ml-3 flex items-center gap-1">
                                <Lock className="h-4 w-4 text-green-600" />{' '}
                              Standard Encryption
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              {true ? (
                <div className='relative -top-1'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size={'icon'}
                        variant="ghost"
                        className="rounded-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src="/ai.svg"
                          alt="logo"
                          className="h-6 w-6"
                          width={100}
                          height={100}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="relative -left-24 rounded-lg border p-3 shadow-lg">
                      {/* <StreamingText text={data.content} /> */}
                    </PopoverContent>
                  </Popover>
                </div>
              ) : null}
            </div>
          </div>
  
          <div
            className={cn(
              'h-0 overflow-hidden transition-all duration-200',
              !isCollapsed && 'h-[1px]',
            )}
          >
            <Separator />
          </div>
  
          <div
            className={cn(
              'grid overflow-hidden transition-all duration-200',
              isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
            )}
          >
            <div className="min-h-0 overflow-hidden">
              {emailData?.attachments && emailData?.attachments.length > 0 ? (
                <>
                  <AttachmentsAccordion
                    attachments={emailData?.attachments}
                    setSelectedAttachment={setSelectedAttachment}
                  />
                  <Separator />
                </>
              ) : null}
  
              <div className="h-fit w-full p-0">
                 <div
                    className="flex h-[500px] w-full items-center justify-center"
                    style={{ minHeight: '500px' }}
                  >
                    <div className="bg-secondary h-32 w-32 animate-pulse rounded-full" />
                  </div>
              </div>
            </div>
          </div>
        </div>
  
        <AttachmentDialog
          selectedAttachment={selectedAttachment}
          setSelectedAttachment={setSelectedAttachment}
        />
      </div>
    );
  };
  
  export default memo(MailDisplay);