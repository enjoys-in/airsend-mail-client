"use client"

import { useCallback, useLayoutEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import EmailInbox from "./email-inbox"
import randomName from '@scaleway/random-name'
import { API } from "@/lib/api/handler"
import { toast } from "@/components/ui/use-toast"


const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  domain: z.string({
    required_error: "Please select a domain.",
  }),
})

type FormValues = z.infer<typeof formSchema>
const usernamePattern = /^[a-zA-Z0-9\_]+$/;

export default function MailboxForm() {
  const [isMailboxCreated, setIsMailboxCreated] = useState(false)
  const [isDisabled, setDisabled] = useState(false)
  const [mailboxAddress, setMailboxAddress] = useState("")
  const [alldomains, setAlldomains] = useState([
    {
      domain_name: "airsend.in",
      metadata:{
        is_free: true
      }
    }
  ])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: randomName('', '_'),
      domain: "",
    },
  })
  const fetchAllPublicDomains = useCallback(async () => {
    try {
      const { data } = await API.getDomains()
      if (data.success) {
        setAlldomains(data.result)
      }
    } catch (error) {

    }
  }, [])
  async function onSubmit(values: FormValues) {
    try {
      setDisabled(true)
      if (
        !usernamePattern.test(values.username)
      ) {
        toast({
          title: "Username can only contain letters, numbers, and hyphens",
          variant: "destructive",
        })
        return
      }
      const fullAddress = `${values.username}.tmp@${values.domain}`
      const { data } = await API.handleTempCreateMailbox({ email: fullAddress, domain: values.domain })
      if (!data.success) {
        throw new Error(data.message)
      }
      setMailboxAddress(fullAddress)
      setIsMailboxCreated(true)
    } catch (error: any) {

      if (error?.status === 422) {
        error.response.data.result.forEach((element: string) => {
          toast({
            title: element,
            variant: "destructive",
          })
        });

        return
      }
      toast({
        title: error.message,
        variant: "destructive",
      })
    } finally {
      setDisabled(false)
    }

  }
  useLayoutEffect(() => {
    fetchAllPublicDomains()

  }, []);

  if (isMailboxCreated) {
    return <EmailInbox emailAddress={mailboxAddress} onReset={() => setIsMailboxCreated(false)} />
  }
  const filterDomain = (is_free: boolean) => alldomains.filter((domain: any) => domain.metadata.is_free === is_free)
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 rounded-none">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Your Temporary Email</h2>
          <p className="text-muted-foreground">Get a disposable email address to protect your privacy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="johndoe" className="rounded-none focus:outline-none outline-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose domain</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="rounded-none text-sm md:text-base">
                      <SelectValue defaultValue="no_domain">
                        {field.value ? field.value : "Select a domain"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="dark:text-[#e7e6e6] dark:bg-stone-700 bg-stone-50 text-stone-900">Available Free Domains</SelectLabel>
                        {alldomains.length > 0 ? (
                          alldomains
                            .filter((domain: any) => domain.metadata.is_free)
                            .map((domain: any) => (
                              <SelectItem key={domain.domain_name} value={domain.domain_name}>
                                {domain.domain_name}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="freee-none1" disabled>No Free Domains</SelectItem>
                        )}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className=" dark:text-[#e7e6e6] dark:bg-stone-700 bg-stone-50  text-fuchsia-900"> Available Premium Domains</SelectLabel>
                        {alldomains.length > 0 && (filterDomain(false) || []).length > 0 ? filterDomain(false).map((domain: any) => (
                          <SelectItem key={domain.domain_name} value={domain.domain_name}>
                            {domain.domain_name}
                          </SelectItem>
                        )) : (
                          <SelectItem value="paid-none" disabled>No Paid Domains</SelectItem>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full rounded-none" disabled={isDisabled}>
          Create Mailbox
        </Button>
      </form>
    </Form>
  )
}

