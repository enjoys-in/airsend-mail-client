'use client'

import { useForm, Controller } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettingsStore } from '@/store/settings'
import { useEffect, useState } from 'react'
import { airsendDB } from '@/db'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AppearanceFormValues {
  dailyEmails: boolean
  inbox: string
  composer: string
  density: string
  composerMode: string
  conversationsPerPage: string
  textDirection: string
  defaultFont: string
  defaultFontSize: string
}

export default function MailAppearance({ email }: { email: string }) {
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)

  const { control, watch, handleSubmit, reset } = useForm<AppearanceFormValues>({
    defaultValues: {
      dailyEmails: settings?.personalization?.theme === 'dark' || true,
      inbox: settings?.display?.showRightSidebar ? 'column' : 'row',
      composer: 'normal',
      density: 'comfortable',
      composerMode: 'normal',
      conversationsPerPage: '50',
      textDirection: 'ltr',
      defaultFont: 'arial',
      defaultFontSize: '14',
    },
  })

  // Sync from settings when they load async
  useEffect(() => {
    if (settings?.personalization) {
      reset({
        dailyEmails: true,
        inbox: settings?.display?.showRightSidebar ? 'column' : 'row',
        composer: 'normal',
        density: 'comfortable',
        composerMode: 'normal',
        conversationsPerPage: '50',
        textDirection: 'ltr',
        defaultFont: 'arial',
        defaultFontSize: '14',
      })
    }
  }, [settings?.personalization, reset])

  const onSave = async (data: AppearanceFormValues) => {
    if (!email) return
    const displayUpdate = {
      ...settings?.display,
      showRightSidebar: data.inbox === 'column',
    }
    await airsendDB.updateNestedItem("settings", email, "settings.display", displayUpdate as any)
    setSettings({ display: displayUpdate as any })
    toast.success("Appearance settings saved")
  }

  return (
    <div className="text-white px-4 py-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white">Composing</h1>

          <div className="flex items-center justify-between">
            <span>Composer mode</span>
            <Controller
              name="composerMode"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px] bg-black border-gray-700">
                    <SelectValue placeholder="Normal" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="rich">Rich Text</SelectItem>
                    <SelectItem value="plain">Plain Text</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Conversations per page</span>
            <Controller
              name="conversationsPerPage"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[100px] bg-black border-gray-700">
                    <SelectValue placeholder="50" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Composer text direction</span>
            <Controller
              name="textDirection"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-[180px] bg-black border-gray-700">
                    <SelectValue placeholder="Left to Right" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="ltr">Left to Right</SelectItem>
                    <SelectItem value="rtl">Right to Left</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <span>Composer default font/size</span>
            <div className="flex gap-2">
              <Controller
                name="defaultFont"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[120px] bg-black border-gray-700">
                      <SelectValue placeholder="Arial" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      <SelectItem value="arial">Arial</SelectItem>
                      <SelectItem value="times">Times New Roman</SelectItem>
                      <SelectItem value="calibri">Calibri</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <Controller
                name="defaultFontSize"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-[70px] bg-black border-gray-700">
                      <SelectValue placeholder="14" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-gray-700">
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="14">14</SelectItem>
                      <SelectItem value="16">16</SelectItem>
                      <SelectItem value="18">18</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </div>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-12">Messages and composing</h1>

        {/* General Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">General</h2>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="sm:text-base text-sm">Daily email notifications</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Receive a daily summary of your messages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="dailyEmails"
              control={control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>
          <Link href="#" className="text-blue-500 text-sm">
            Set email address
          </Link>
        </section>

        {/* Layout Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Layout</h2>

          {/* Inbox Layout */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span>Inbox</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose how your inbox is displayed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Controller
                name="inbox"
                control={control}
                render={({ field }) => (
                  <>
                    <LayoutOption {...field} id="column" label="Column" imageSrc="/email-inbox-layout.png" />
                    <LayoutOption {...field} id="row" label="Row" imageSrc="/email-inbox-row.png" />
                  </>
                )}
              />
            </div>
          </div>

          {/* Composer Layout */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span>Composer</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Choose how your composer is displayed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Controller
                name="composer"
                control={control}
                render={({ field }) => (
                  <>
                    <LayoutOption {...field} id="normal" label="Normal" imageSrc="/email-composer-normal.png" />
                    <LayoutOption {...field} id="maximized" label="Maximized" imageSrc="/maximized-email-composer.png" />
                  </>
                )}
              />
            </div>
          </div>
        </section>

        {/* Density Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-bold">Density</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-blue-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose the spacing between elements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Controller
              name="density"
              control={control}
              render={({ field }) => (
                <>
                  <LayoutOption
                    {...field}
                    id="comfortable"
                    label="Comfortable"
                    imageSrc="/comfortable-email-density.png"
                  />
                  <LayoutOption
                    {...field}
                    id="compact"
                    label="Compact"
                    imageSrc="/placeholder.svg?height=150&width=150&query=email compact density"
                  />
                </>
              )}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

interface LayoutOptionProps {
  id: string
  name: string
  value: string
  onChange: (value: string) => void
  label: string
  imageSrc: string
}

function LayoutOption({ id, name, value, onChange, label, imageSrc }: LayoutOptionProps) {
  const selected = value === id
  return (
    <div className={`relative rounded-md overflow-hidden border ${selected ? "border-blue-500" : "border-gray-700"}`}>
      <input
        type="radio"
        id={id}
        name={name}
        value={id}
        checked={selected}
        onChange={() => onChange(id)}
        className="sr-only"
      />
      <label htmlFor={id} className="cursor-pointer block">
        <div className="bg-gray-800 aspect-square relative">
          <Image src={imageSrc || "/placeholder.svg"} alt={`${label} layout`} fill className="object-contain p-2" />
        </div>
        <div className="text-center py-2 bg-gray-900">{label}</div>
      </label>
    </div>
  )
}
