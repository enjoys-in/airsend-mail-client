"use client";

import { memo, useState } from "react";
import { Check, InfoIcon as InfoCircle, TicketIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { airsendDB } from "@/db";
import { useSettingsStore } from "@/store/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function EmailSettings({ email }: { email: string }) {
  const { settings,setSettings } = useSettingsStore();
  const [footerText, setFooterText] = useState("Sent with ❤️ by Airsend");
  const [systemReply, setSystemReply] = useState("This mailbox is read-only.");

  const [localSettings, setLocalSettings] = useState(settings?.email_settings);
  const handleSaveSettings = async () => {
    if (!email) return;


    localSettings!.email_footer.footer_text = footerText.trim() as string;
    localSettings!.system_email.system_email_reply = systemReply.trim() as string;
    await airsendDB.updateNestedItem(
      "settings",
      email,
      "settings.email_settings",
      localSettings as any
    );
    setSettings({ email_settings: localSettings });

  };
  return (
    <div className=" text-white p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Messages Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold  text-white ">Messages</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Keep messages in Sent/Drafts</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.keepMessages}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  keepMessages: checked,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Exclude Spam/Trash from All mail</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.excludeSpam}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  excludeSpam: checked,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Confirm link URLs</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.confirmLinks}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  confirmLinks: checked,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Conversation grouping</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.conversationGrouping}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  conversationGrouping: checked,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto-delete unwanted messages</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded">
                AI
              </div>
              <Switch
                checked={localSettings?.autoDeleteUnwanted}
                onCheckedChange={(checked) =>
                  setLocalSettings({
                    ...(localSettings as any),
                    excludeSpam: checked,
                  })
                }
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Sticky labels</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.stickyLabels}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  stickyLabels: checked,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Auto-unsubscribe</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Select defaultValue="ask">
              <SelectTrigger className="w-[180px] bg-black border-gray-700">
                <SelectValue placeholder="Ask each time" />
              </SelectTrigger>
              <SelectContent className="bg-black border-gray-700">
                <SelectItem value="ask">Ask each time</SelectItem>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <span> Monthly Limit</span>
            <Input
              type="number"
              value={localSettings?.monthly_limit}
              inputMode="numeric"
              min={0}
              max={localSettings?.thresold_limit}
              className="w-[100px] bg-black border-gray-700"
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings!,
                  monthly_limit: e.target.value,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <span> Thresold Limit</span>
            <Input
              value={localSettings?.thresold_limit}
              type="number"
              inputMode="numeric"
              min={0}
              max={300}
              className="w-[100px] bg-black border-gray-700"
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings!,
                  thresold_limit: e.target.value,
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Email Footer</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.email_footer?.footer_enabled}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  email_footer: {
                    ...localSettings?.email_footer,
                    footer_enabled: checked,
                  } as any,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          {localSettings?.email_footer?.footer_enabled && (
            <div className="relative w-full">
              <Input
                className="w-full bg-black border-gray-700 pr-10" // add padding-right for icon space
                value={footerText}
                onChange={(e) => {
                  setFooterText(e.target.value);
                }}
              />
              <Button
                type="button"
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  if (
                    localSettings?.email_footer.footer_enabled &&
                    footerText?.trim() === ""
                  ) {
                    return toast.error("Footer text cannot be empty");
                  }
                  setLocalSettings({
                    ...(localSettings as any),
                    email_footer: {
                      ...localSettings?.email_footer,
                      footer_text: footerText,
                    } as any,
                  });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white rounded-md"
              >
                <Check className="w-5 h-5" />
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Is System Email</span>
              <InfoCircle className="h-4 w-4 text-blue-400" />
            </div>
            <Switch
              checked={localSettings?.system_email?.is_system_email}
              onCheckedChange={(checked) =>
                setLocalSettings({
                  ...(localSettings as any),
                  system_email: {
                    ...localSettings?.system_email,
                    is_system_email: checked,
                  } as any,
                })
              }
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          {localSettings?.system_email?.is_system_email && (
            <div className="relative w-full">
              <Input
                className="w-full bg-black border-gray-700 pr-10" // add padding-right for icon space
                value={systemReply}
                onChange={(e) => {
                  setSystemReply(e.target.value);
                }}
              />
              <Button
                type="button"
                variant={"ghost"}
                size={"icon"}
                onClick={() => {
                  if (
                    localSettings?.system_email.is_system_email &&
                    systemReply?.trim() === ""
                  ) {
                    return toast.error("System reply text cannot be empty");
                  }
                  setLocalSettings({
                    ...(localSettings as any),
                    email_footer: {
                      ...localSettings?.email_footer,
                      footer_text: footerText,
                    } as any,
                  });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white rounded-md"
              >
                <Check className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-50">
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} size="lg">
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(EmailSettings);
