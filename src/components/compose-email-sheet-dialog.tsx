import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { InputTags } from "@/components/input-tags";
import { SendMail } from "./server-actions/send-mail";
import { useToast } from "./ui/use-toast";
import { CustomMailOptions } from "@/lib/types/mail.interface";

import { useAppSelector } from "@/store/hooks";
import EditorClient from "./editor/EditorClient";
import { Card } from "./ui/card";
import { X } from "lucide-react";
export function ComposeEmailDrawerSheet({ children }: { children: ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const currAccount = useAppSelector(state => state.accounts.currAccount)
  const [mailOptions, setMailOptions] = useState<Partial<CustomMailOptions & { is_scheduled: boolean, scheduled_time: string }>>({
    to: [],
    from: currAccount?.email,
    cc: [],
    bcc: [],
    subject: "",
    html: ``,
    attachments: [],
    is_scheduled: false,
    scheduled_time: "",
  })

  const { toast } = useToast();

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const sendMail = async () => {
    if (mailOptions.to?.length === 0) {
      toast({ title: "Please Enter Recipients", description: "Press Enter to Add Recipients" })
      return
    }
    toast({ title: "Sending Mail", })
    try {

      // const data = await SendMail({ ...mailOptions, from: currAccount?.email, html, attachments });

      // if (!data.success) {
      //   throw new Error(data.message)
      // }
      toast({
        title: "Success",
        description: "Email Sent",
      })
      setOpen(false)

    } catch (error: any) {

      toast({
        title: "Error while sending mail",
        description: error.message,
      })

    }
  }
  const handleInputChange = (key: string, value: any) => {
    setMailOptions({ ...mailOptions, [key]: value })
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      // sendMail(mailOptions);
    }
  }
  if (isDesktop) {
    return (
      <>
        <div onClick={() => setOpen(!open)}>
          {children}
        </div>
        {open &&
          <Card className="fixed bottom-0 right-4 h-[550px]  md:w-[600px]  p-4 shadow-xl z-50 md:bottom-24 md:right-12 lg:bottom-0 lg:right-12">

            <Button
              onClick={() => setOpen(false)}
              className={cn(
                "absolute top-2 right-2 shadow-lg",
                "hover:scale-110 transition-transform duration-200",
                "bg-accent  text-white",
                "h-8 w-8 rounded-full p-0"
              )}

              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
            <EditorClient />

          </Card>}
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="p-4 min-h-[85dvh] flex flex-col">
        <DrawerTitle className="mb-5">New Message</DrawerTitle>
        <Content value={mailOptions} handleInputChange={handleInputChange} />
        <DrawerFooter className="flex flex-row justify-end">
          <SendButton onClick={sendMail} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
const SendButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button className="w-40" onClick={onClick}>
      Send
    </Button>
  );
}
const Content = ({ value, handleInputChange }: { value: any, handleInputChange: any }) => {
  const [emails, setEmails] = useState<string[]>([]);
  useEffect(() => {
    handleInputChange("to", emails)
  }, [emails])
  return (
    <form className="flex-1 flex flex-col gap-2">
      <div className="flex flex-row gap-4 items-center w-full">
        <InputTags id="to-mail" value={emails} onChange={setEmails} />
      </div>
      <div className="w-full">
        <Input id="subject" value={value.subject} placeholder="Subject" className="flex-1 focus:outline-none"
          onChange={(e) => handleInputChange("subject", e.target.value)} />
      </div>
      <div className="flex-1 flex max-h-[600px] overflow-y-auto rounded-lg focus:!ring-transparent">

      </div>
    </form>
  );
};
