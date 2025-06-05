
"use client"

import { useForm, FormProvider } from "react-hook-form"

type LabelVisibility = {
  showInLabelList: boolean
  showIfUnread: boolean
  showInMessageList?: boolean
  showInIMAP: boolean
}

type LabelSettings = {
  [key: string]: LabelVisibility
}

export default function LabelSettings() {
  const defaultValues: LabelSettings = {
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

  const methods = useForm<LabelSettings>({
    defaultValues,
  })

  const { handleSubmit, register, watch } = methods

  const onSubmit = (data: LabelSettings) => {
    console.log("Form submitted:", data)
    // Here you would typically send this data to your backend
  }

  const formValues = watch()

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className=" bg-[#0c0c0e] p-6 bg-white">
        <div className="space-y-6 bg-[#0c0c0e]">
          {/* System Labels Section */}
          <div>
            <div className="grid grid-cols-[1fr_1fr_1fr] font-medium text-sm mb-2">
              <div>System labels</div>
              <div>Show in label list</div>
              <div></div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Inbox</div>
                <div></div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("inbox.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Starred</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("starred.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("starred.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Snoozed</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("snoozed.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("snoozed.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Important</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("important.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("important.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Sent</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("sent.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("sent.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Scheduled</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("scheduled.showInLabelList")} />
                    <span>Show</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("scheduled.showIfUnread")} />
                    <span>Show if unread</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("scheduled.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm bg-gray-100">
                <div>Drafts</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("drafts.showInLabelList")} />
                    <span>Show</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("drafts.showIfUnread")} />
                    <span>Show if unread</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("drafts.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>All Mail</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("allMail.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("allMail.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Spam</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("spam.showInLabelList")} />
                    <span>Show</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("spam.showIfUnread")} />
                    <span>Show if unread</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("spam.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Trash</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("trash.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" className="mr-2" {...register("trash.showInIMAP")} />
                  <span>Show in IMAP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Section */}
          <div>
            <div className="grid grid-cols-[1fr_1fr_1fr]  bg-[#0c0c0e] font-medium text-sm mb-2">
              <div>Categories</div>
              <div>Show in label list</div>
              <div>Show in message list</div>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_1fr]  bg-[#0c0c0e] items-center py-1 text-sm">
                <div>Categories</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("categories.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div></div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr]  bg-[#0c0c0e] items-center py-1 text-sm">
                <div>Social</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("social.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("social.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr]  bg-[#0c0c0e] items-center py-1 text-sm">
                <div>Updates</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("updates.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("updates.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr]  bg-[#0c0c0e]   items-center py-1 text-sm">
                <div>Forums</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("forums.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("forums.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr] items-center py-1 text-sm">
                <div>Promotions</div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("promotions.showInLabelList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("promotions.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Labels Section */}
          <div>
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] font-medium text-sm mb-2">
              <div>Labels</div>
              <div>Show in label list</div>
              <div>Show in message list</div>
              <div>Actions</div>
            </div>

            <div>
              <button type="button" className="border border-gray-300 rounded px-2 py-1 text-sm mb-2">
                Create new label
              </button>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center py-1 text-sm">
                <div>
                  <div>Meetings</div>
                  <div className="text-gray-500 text-xs">5 conversations</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("meetings.showInLabelList")} />
                    <span>Show</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("meetings.showIfUnread")} />
                    <span>Show if unread</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("meetings.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" className="text-blue-600">
                    remove
                  </button>
                  <button type="button" className="text-blue-600">
                    edit
                  </button>
                  <div className="flex items-center ml-4">
                    <input type="checkbox" className="mr-2" {...register("meetings.showInIMAP")} />
                    <span>Show in IMAP</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center py-1 text-sm">
                <div>
                  <div>Repo</div>
                  <div className="text-gray-500 text-xs">0 conversations</div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("repo.showInLabelList")} />
                    <span>Show</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("repo.showIfUnread")} />
                    <span>Show if unread</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" {...register("repo.showInMessageList")} />
                    <span>Show</span>
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" className="text-blue-600">
                    remove
                  </button>
                  <button type="button" className="text-blue-600">
                    edit
                  </button>
                  <div className="flex items-center ml-4">
                    <input type="checkbox" className="mr-2" {...register("repo.showInIMAP")} />
                    <span>Show in IMAP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
