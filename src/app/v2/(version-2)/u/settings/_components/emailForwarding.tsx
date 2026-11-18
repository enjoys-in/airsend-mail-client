"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Forward as MailForward, Plus, Trash2, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSettingsStore } from "@/store/settings";
import { airsendDB } from "@/db";
import { SettingsPageHeader, SettingsSection } from "./shared";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

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
    setIsSubmitting(true)
    try {
      await airsendDB.updateNestedItem("settings", email, "settings.forwarding_rules", data.forwarding_rules)
      setSettings(data)
      toast.success("Forwarding rules saved successfully")
    } catch (err) {
      toast.error("Failed to save forwarding rules")
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    if (settings) {
      form.reset({
        forwarding_rules: (settings.forwarding_rules as any) || [],
      });
      setEnabled(((settings.forwarding_rules as any) || []).length > 0);
    }
  }, [settings, form]);

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-150">
      <SettingsPageHeader
        title="Email Forwarding"
        description="Automatically route incoming messages from specific senders or domains to another address."
        icon={<MailForward className="size-5" />}
        badge={<Badge variant="outline" className="text-xs font-normal">Routing</Badge>}
      />

      {!enabled && (
        <div className="rounded-2xl border border-border/70 bg-card/60 p-6 sm:p-8 text-center space-y-4">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <MailForward className="size-6" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-foreground">
              Automated Email Forwarding
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Forward incoming mail automatically to a backup or external mailbox without exposing your credentials.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              setEnabled(true);
              if (forwardingRulesFields.length === 0) {
                appendForwardingRule({ from: "", to: "" });
              }
            }}
            className="rounded-xl px-5 gap-2"
          >
            <Plus className="size-4" />
            Set up email forwarding
          </Button>
        </div>
      )}

      {enabled && (
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <SettingsSection
            title="Forwarding Rules"
            description="Incoming emails matching the sender pattern will be forwarded to the destination address"
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendForwardingRule({ from: "", to: "" })}
                className="h-8 rounded-xl text-xs sm:text-sm gap-1.5"
              >
                <Plus className="size-3.5" />
                Add Rule
              </Button>
            }
          >
            <div className="space-y-3 pt-2">
              {forwardingRulesFields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-3 sm:p-4 rounded-xl border border-border/60 bg-background/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition-colors hover:border-border"
                >
                  {/* From Field */}
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`from-${index}`} className="text-xs text-muted-foreground font-medium">
                      From (Sender or domain)
                    </Label>
                    <Input
                      id={`from-${index}`}
                      placeholder="e.g. boss@work.com or @domain.com"
                      className="h-9 text-xs sm:text-sm bg-background/80"
                      {...form.register(`forwarding_rules.${index}.from`)}
                    />
                    {form.formState.errors.forwarding_rules?.[index]?.from && (
                      <p className="text-[11px] text-destructive font-medium">
                        {form.formState.errors.forwarding_rules[index]?.from?.message}
                      </p>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  <div className="hidden sm:flex items-center justify-center pt-5 text-muted-foreground shrink-0">
                    <ArrowRight className="size-4" />
                  </div>

                  {/* To Field */}
                  <div className="flex-1 space-y-1">
                    <Label htmlFor={`to-${index}`} className="text-xs text-muted-foreground font-medium">
                      Forward destination
                    </Label>
                    <Input
                      id={`to-${index}`}
                      placeholder="e.g. personal@airsend.com"
                      className="h-9 text-xs sm:text-sm bg-background/80"
                      {...form.register(`forwarding_rules.${index}.to`)}
                    />
                    {form.formState.errors.forwarding_rules?.[index]?.to && (
                      <p className="text-[11px] text-destructive font-medium">
                        {form.formState.errors.forwarding_rules[index]?.to?.message}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="self-end sm:self-center pt-0 sm:pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeForwardingRule(index)}
                      title="Remove rule"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {forwardingRulesFields.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  No forwarding rules active. Click &quot;Add Rule&quot; to begin.
                </div>
              )}
            </div>
          </SettingsSection>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5"
            >
              {isSubmitting ? "Saving..." : "Save Forwarding Rules"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EmailForwardingSection;
