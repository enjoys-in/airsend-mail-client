"use client"

import { z } from "zod"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { WizardForm } from "./wizard-form"
import { useWizard, WizardStep } from "@/components/ui/wizard"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { use, useEffect, useState } from "react"
import { Check, CheckCircle, Loader2Icon, RefreshCw } from "lucide-react"
import { useMailStore } from "@/store/mails"
import { API } from "@/lib/api/handler"
import {  manualDelay } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useCacheStorage } from "@/hooks/useCacheStorage"
import { useIndexDb } from "@/hooks/useIndexDb"
import { Security } from "@/lib/security"
const s  = new Security()
const domainRegex =
  /^(?=.{1,255}$)(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/
// Define the form schema with Zod
const formSchema = z.object({
  imapConfig: z.object({
    host: z.string().min(1, { message: "IMAP host is required." }).refine((val) => domainRegex.test(val), {
      message: "Invalid domain or subdomain.",
    }),
    port: z.coerce.number().int().positive().default(993),
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string().min(1, { message: "Password is required." }),
    imap_secure: z.boolean().default(false),
  }),
  smtpConfig: z.object({
    host: z.string().min(1, { message: "SMTP host is required." }).refine((val) => domainRegex.test(val), {
      message: "Invalid domain or subdomain.",
    }),
    port: z.coerce.number().int().positive(),
    username: z.string().min(1, { message: "Username is required." }),
    password: z.string().min(1, { message: "Password is required." }),
    uses_same_credentials: z.boolean().default(false),
    smtp_secure: z.boolean().default(true),
  }),
})

// Define the default values
const defaultValues = {
  imapConfig: {
    host: "",
    port: 993,
    username: "",
    password: "",
    imap_secure: true,
  },
  smtpConfig: {
    host: "",
    port: 587,
    username: "",
    password: "",
    smtp_secure: false,
    uses_same_credentials: false,
  },
}

// Define the fields for each step
const stepFields = {
  0: ["imapConfig.host", "imapConfig.port", "imapConfig.username", "imapConfig.password"],
  1: [
    "smtpConfig.host",
    "smtpConfig.port",
    "smtpConfig.username",
    "smtpConfig.password",
    "smtpConfig.useSameCredentials",
  ],
}

export function ConfigForm() {
  const { setConfig } = useMailStore()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  })

  const useSameCredentials = useWatch({
    control: form.control,
    name: "smtpConfig.uses_same_credentials",
    defaultValue: false,
  })

  const imapUsername = form.getValues("imapConfig.username")
  const imapPassword = form.getValues("imapConfig.password")

  // Update SMTP credentials when checkbox is checked
  useEffect(() => {

    if (useSameCredentials) {
      form.setValue("smtpConfig.username", imapUsername)
      form.setValue("smtpConfig.password", imapPassword)
      form.setValue("smtpConfig.host", form.getValues("imapConfig.host"))

    }
  }, [useSameCredentials, imapUsername, imapPassword, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Make Api call
      setConfig({
        "imap_host": values.imapConfig.host,
        "imap_port": values.imapConfig.port,
        "imap_secure": values.imapConfig.imap_secure,
        "imap_username": values.imapConfig.username,
        "imap_password": s.encryptAES(values.imapConfig.password),
        "smtp_host": values.smtpConfig.host,
        "smtp_port": values.smtpConfig.port,
        "smtp_secure": values.smtpConfig.smtp_secure,
        "smtp_username": values.smtpConfig.username,
        "smtp_password": s.encryptAES(values.smtpConfig.password),
        "uses_same_credentials": values.smtpConfig.uses_same_credentials
      })
    } catch (e: any) {
      toast({
        title: "Something went wrong",
        description: e.message,
        variant: "destructive",
      })
    } finally {

    }

  }

  const validateStep = async (stepFields: string[]) => {
    const result = await form.trigger(stepFields as any)
    if (!result) {
      toast({
        title: "Validation Error",
        description: "Please check your inputs and try again.",
        variant: "destructive",
      })
    }
    return result
  }

  return (
    <WizardForm
      onCompleteView={<WizardThankYou />}
      title="Email Configuration"
      description="Set up your email server configuration."
      schema={formSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      className="w-full border-none"
      form={form}
      stepFields={stepFields}
      persistenceKey="email-config-wizard"
      persistForm={true}
    >

      <WizardStep step={0} validator={() => validateStep(stepFields[0])} fieldNames={stepFields[0]}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">IMAP Configuration</h2>
          <FormField
            control={form.control}
            name="imapConfig.host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IMAP Host</FormLabel>
                <FormControl>
                  <Input placeholder="imap.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4 sm:flex-col md:flex-row">
            <FormField
              control={form.control}
              name="imapConfig.port"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>IMAP Port</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="993" {...field} />
                  </FormControl>
                  <FormDescription>Default port for IMAP is 993 (with SSL/TLS)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imapConfig.imap_secure"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center gap-2 flex-1">
                  <FormLabel>IMAP Secure</FormLabel>
                  <FormControl>
                    <Checkbox
                      className="mt-1"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Default Port is 993 (STARTTLS)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="imapConfig.username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imapConfig.password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </WizardStep>

      <WizardStep step={1} validator={() => validateStep(stepFields[1])} fieldNames={stepFields[1]}>
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">SMTP Configuration</h2>

          <FormField
            control={form.control}
            name="smtpConfig.uses_same_credentials"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-6 border-b pb-6">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Use same credentials as IMAP</FormLabel>
                  <FormDescription>Use the same username and password from IMAP configuration</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="smtpConfig.host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SMTP Host</FormLabel>
                <FormControl>
                  <Input placeholder="smtp.example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2 sm:flex-col md:flex-row">
            <FormField
              control={form.control}
              name="smtpConfig.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="587" {...field} />
                  </FormControl>
                  <FormDescription>Common ports: 587 (TLS) or 465 (SSL)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtpConfig.smtp_secure"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center gap-2 flex-1">
                  <FormLabel>SMTP Secure</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Port is 465 (SSL), mark it</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="smtpConfig.username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} disabled={useSameCredentials} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="smtpConfig.password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={useSameCredentials} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </WizardStep>
    </WizardForm>
  )
}
function WizardThankYou() {
  const { reset, submittedData } = useWizard()
  const router = useRouter()
  const cacheStorage = useCacheStorage()
  const { airsendDB } = useIndexDb()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const { setOpenConfigDialog, config, error, setError } = useMailStore()
  const handleUserConfiguration = async () => {

    try {
      setError(null)
      if (isLoading) return
      setIsLoading(true)
      
      setIsSuccess(true)
    } catch (error: any) {  
         if (error.message.includes("SMTMP")) {         
      
          return setError("SMTP connection failed")
         }
      setError("Failed to save email configuration. Please try again.")
      
    } finally {
      setIsLoading(false)
    }
  }
  const handleClose = () => {
    try {
      router.push("/v2/mail")
      setOpenConfigDialog(false)
      reset()
      setIsSuccess(false)
    } catch (error) {

    }
  }
  useEffect(() => {
    if (isSuccess) {
      manualDelay(2000).then(() => {
        handleClose()
      })

    }
  }, [isSuccess])
  return (
    <div className="text-center py-8 space-y-6">
      {
        isSuccess && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Configuration Complete!</h2>
            <p className="text-muted-foreground">Your email configuration has been successfully saved.</p>
            <p className="text-muted-foreground">Please wait, you will be redirected in a few seconds</p>
          </>
        )
      }
      {
        error && (
          <>
            <h2 className="text-2xl font-bold">Configuration Error!</h2>
            <p className="text-muted-foreground text-red-500">{error}</p>
          </>
        )
      }
      {isLoading ? (
        <div className="mx-auto rounded-full flex items-center flex-col justify-center">
          <div className="flex items-center justify-center h-10 space-x-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-dotFlow"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <p className="text-muted-foreground">Please Wait, While we sync your account</p>
        </div>
      ) : !isSuccess && submittedData && (
        <div className=" text-left bg-muted/50 p-4 rounded-md max-w-md mx-auto">
          <h3 className="font-medium mb-2">Configuration Summary:</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm uppercase text-muted-foreground">IMAP Settings</h4>
              <p>
                <span className="font-medium">Host:</span> {submittedData.imapConfig?.host}
              </p>
              <p>
                <span className="font-medium">Port:</span> {submittedData.imapConfig?.port}
              </p>
              <p>
                <span className="font-medium">Username:</span> {submittedData.imapConfig?.username}
              </p>
              <p>
                <span className="font-medium">Password:</span> ••••••••
              </p>
            </div>

            <div>
              <h4 className="font-medium text-sm uppercase text-muted-foreground">SMTP Settings</h4>
              <p>
                <span className="font-medium">Host:</span> {submittedData.smtpConfig?.host}
              </p>
              <p>
                <span className="font-medium">Port:</span> {submittedData.smtpConfig?.port}
              </p>
              <p>
                <span className="font-medium">Username:</span> {submittedData.smtpConfig?.username}
              </p>
              <p>
                <span className="font-medium">Password:</span> ••••••••
              </p>
              <p>
                <span className="font-medium">Using IMAP credentials:</span>{" "}
                {submittedData.smtpConfig?.uses_same_credentials ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex md:flex-row sm:flex-col justify-center items-center gap-4" >
        {!isSuccess && !isLoading && (
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Configure Again
          </button>
        )}
        <button
          disabled={isLoading}
          onClick={isSuccess ? handleClose : handleUserConfiguration}
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <CheckCircle className="h-4 w-4 text-green-600" />
          {isSuccess ? "Close" : "Save Configuration"}
        </button>
      </div>
    </div>
  )
}