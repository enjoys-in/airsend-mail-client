"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Forward as MailForward, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettingsStore } from "@/store/settings";
import { airsendDB } from "@/db";

const emailOrDomainRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const formSchema = z.object({
  forwarding_rules: z.array(
    z.object({
      from: z
        .string()
        .regex(emailOrDomainRegex, "Please enter a valid email or domain"),
      to: z.string().regex(emailRegex, "Please enter a valid email").refine(
        (value) => !value.endsWith("outlook.com") && !value.endsWith("icloud.com"),
        "Currently outlook.com and icloud.com are not supported"
      ),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

const EmailForwardingSection = ({ email }: { email: string }) => {
  const { settings, setSettings } = useSettingsStore()

  const [enabled, setEnabled] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      forwarding_rules: [],
    },
  });
  const {
    fields: forwardingRulesFields,
    append: appendForwardingRule,
    remove: removeForwardingRule,
  } = useFieldArray({
    control: form.control,
    name: "forwarding_rules",
  });
  const onSubmit = async (data: FormValues) => {

    await airsendDB.updateNestedItem("settings", email, "settings.forwarding_rules", data.forwarding_rules)
    setSettings(data)
  }
  React.useEffect(() => {
    if (settings) {
      form.reset({
        forwarding_rules: settings.forwarding_rules,
      });
      setEnabled((settings.forwarding_rules as any || [])?.length > 0);
    }
  }, [settings]);
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-2">Forward emails</h2>
      <p className="text-gray-400 mb-1">
        Automatically forward emails to another email address.
      </p>
      <a
        href="#"
        className="text-blue-500 hover:text-blue-400 transition-colors text-sm inline-block mb-6"
      >
        Learn more
      </a>
      {!enabled &&
        <Button onClick={() => setEnabled(true)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4 py-2 flex items-center gap-2 text-sm font-normal">
          <MailForward size={18} className="text-white" />
          Set up email forwarding
        </Button>
      }

      {enabled && (
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Email Forwarding Rules</CardTitle>
              <CardDescription>
                Set up rules to automatically forward emails from specific
                senders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forwardingRulesFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                  >
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`from-${index}`}>From</Label>
                      <Input
                        id={`from-${index}`}
                        placeholder="Email or domain"
                        {...form.register(`forwarding_rules.${index}.from`)}
                      />
                      {form.formState.errors.forwarding_rules?.[index]?.from && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.forwarding_rules[index]?.from
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`to-${index}`}>Forward to</Label>
                      <Input
                        id={`to-${index}`}
                        placeholder="Email address"
                        {...form.register(`forwarding_rules.${index}.to`)}
                      />
                      {form.formState.errors.forwarding_rules?.[index]?.to && (
                        <p className="text-sm text-red-500">
                          {
                            form.formState.errors.forwarding_rules[index]?.to
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-8"
                      onClick={() => removeForwardingRule(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => appendForwardingRule({ from: "", to: "" })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Forwarding Rule
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Save Settings
            </Button>
          </div>
        </form>)}

    </div>
  );
};

export default EmailForwardingSection;
