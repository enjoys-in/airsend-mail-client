"use client"

import { useForm, FormProvider } from "react-hook-form"
import { Button } from "@/components/ui/button"

type LabelVisibility = {
  showInLabelList: boolean
  showIfUnread: boolean
  showInMessageList?: boolean
  showInIMAP: boolean
}

type LabelSettingsData = {
  [key: string]: LabelVisibility
}

export default function LabelSettings() {
  const defaultValues: LabelSettingsData = {
    inbox: { showInLabelList: false, showIfUnread: false, showInIMAP: false },
    starred: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    snoozed: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    important: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    sent: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    scheduled: { showInLabelList: true, showIfUnread: true, showInIMAP: true },
    drafts: { showInLabelList: true, showIfUnread: true, showInIMAP: true },
    allMail: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    spam: { showInLabelList: true, showIfUnread: true, showInIMAP: true },
    trash: { showInLabelList: true, showIfUnread: false, showInIMAP: true },
    categories: { showInLabelList: true, showIfUnread: false, showInIMAP: false },
    social: { showInLabelList: true, showIfUnread: false, showInMessageList: true, showInIMAP: false },
    updates: { showInLabelList: true, showIfUnread: false, showInMessageList: true, showInIMAP: false },
    forums: { showInLabelList: true, showIfUnread: false, showInMessageList: true, showInIMAP: false },
    promotions: { showInLabelList: true, showIfUnread: false, showInMessageList: true, showInIMAP: false },
    meetings: { showInLabelList: true, showIfUnread: true, showInMessageList: true, showInIMAP: true },
    repo: { showInLabelList: true, showIfUnread: true, showInMessageList: true, showInIMAP: true },
  }

  const methods = useForm<LabelSettingsData>({
    defaultValues,
  })

  const { handleSubmit, register } = methods

  const onSubmit = (data: LabelSettingsData) => {
    console.log("Form submitted:", data)
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-border/70 bg-card/70 p-4 sm:p-6 space-y-6">
        <div className="space-y-6">
          {/* System Labels Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              System Labels Visibility
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-semibold uppercase text-muted-foreground/70 pb-2 border-b border-border/40">
              <div>System labels</div>
              <div>Show in label list</div>
              <div>IMAP Visibility</div>
            </div>

            <div className="divide-y divide-border/30 text-xs sm:text-sm">
              {[
                { name: "Inbox", key: "inbox", imapOnly: true },
                { name: "Starred", key: "starred" },
                { name: "Snoozed", key: "snoozed" },
                { name: "Important", key: "important" },
                { name: "Sent", key: "sent" },
                { name: "Scheduled", key: "scheduled", hasUnread: true },
                { name: "Drafts", key: "drafts", hasUnread: true },
                { name: "All Mail", key: "allMail" },
                { name: "Spam", key: "spam", hasUnread: true },
                { name: "Trash", key: "trash" },
              ].map((item) => (
                <div key={item.key} className="grid grid-cols-1 sm:grid-cols-3 items-center py-2.5 gap-2">
                  <div className="font-medium text-foreground">{item.name}</div>
                  <div className="flex items-center gap-3">
                    {!item.imapOnly && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="rounded" {...register(`${item.key}.showInLabelList` as any)} />
                        <span className="text-xs text-muted-foreground">Show</span>
                      </label>
                    )}
                    {item.hasUnread && (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="rounded" {...register(`${item.key}.showIfUnread` as any)} />
                        <span className="text-xs text-muted-foreground">If unread</span>
                      </label>
                    )}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="rounded" {...register(`${item.key}.showInIMAP` as any)} />
                      <span className="text-xs text-muted-foreground">Show in IMAP</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" size="sm" className="rounded-xl px-5">
              Save Label Preferences
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
