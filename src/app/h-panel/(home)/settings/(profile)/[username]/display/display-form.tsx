"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Section } from "@/components/h-panel/kit"
import { FormFooter } from "../../../_components/settings-shell"


const items = [
  {
    id: "folders",
    label: "Folders",
  },
  {
    id: "labels",
    label: "Labels",
  },
  {
    id: "applications",
    label: "Applications",
  },
  {
    id: "account-switcher",
    label: "Account Switcher",
  },
  {
    id: "right-sidebar",
    label: "Right Sidebar",
  },
  {
    id: "branding",
    label: "Branding",
  },
  {
    id: "analytics",
    label: "Analytics",
  },
  {
    id: "store",
    label: "Analytics",
  },
  {
    id: "store",
    label: "Space",
  },
  {
    id: "messages",
    label: "Messages",
  },
] as const

const displayFormSchema = z.object({
  items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
})

type DisplayFormValues = z.infer<typeof displayFormSchema>

// This can come from your database or API.
const defaultValues: Partial<DisplayFormValues> = {
  items: ["recents", "home"],
}

export function DisplayForm() {
  const form = useForm<DisplayFormValues>({
    resolver: zodResolver(displayFormSchema),
    defaultValues,
  })

  function onSubmit(data: DisplayFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <Section title="Sidebar" description="Select the items you want to display in the sidebar.">
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  {items.map((item, index) => (
                    <FormField
                      key={`${item.id}-${index}`}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-center space-x-3 space-y-0 border-b border-border/70 py-3 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <FormFooter>
          <Button type="submit">Update display</Button>
        </FormFooter>
      </form>
    </Form>
  )
}
