"use client"

import { useState, useCallback } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { X, ChevronDown, ChevronUp, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type FormData = {
  filterName: string
  conditionType: "ALL" | "ANY"
  conditions: {
    field: string
    operator: string
    value: string
  }[]
  actions: {
    label?: string
    moveToFolder?: string
    markAsRead?: boolean
    markAsStarred?: boolean
    sendAutoReply?: boolean
  }
  applyToExisting: boolean
}

const STEPS = ["Name", "Conditions", "Actions", "Preview"] as const

export function AddFilterDialog({ onClose }: { onClose?: () => void }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState({
    conditions: true,
    labelAs: false,
    moveTo: false,
    markAs: false,
  })

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      filterName: "",
      conditionType: "ALL",
      conditions: [{ field: "The subject", operator: "contains", value: "" }],
      actions: {
        moveToFolder: "Inbox",
        markAsRead: false,
        markAsStarred: false,
        sendAutoReply: false,
      },
      applyToExisting: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions",
  })

  const watchedValues = watch()

  const onSubmit = useCallback(async (data: FormData) => {
    toast.success("Filter rule configured")
    console.log("[AddFilterDialog] payload:", data)
    onClose?.()
  }, [onClose])

  const nextStep = useCallback(async () => {
    // Validate current step before advancing
    if (currentStep === 0) {
      const valid = await trigger("filterName")
      if (!valid) return
    }
    if (currentStep === 1) {
      const valid = await trigger("conditions")
      if (!valid) return
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
    }
  }, [currentStep, trigger])

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  const toggleSection = (section: keyof typeof isOpen) => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="p-2 sm:p-4 space-y-6">
      {/* Modern Step Indicator */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "size-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors",
                currentStep === index
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : currentStep > index
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > index ? <Check className="size-3.5 stroke-[3]" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden sm:inline text-xs font-medium",
                currentStep === index
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {step}
            </span>
            {index < STEPS.length - 1 && (
              <span className="hidden sm:inline text-muted-foreground/40 mx-1">›</span>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Name */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="filterName" className="text-xs sm:text-sm font-medium">
                Filter Name
              </Label>
              <Controller
                name="filterName"
                control={control}
                rules={{
                  required: "Filter name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                }}
                render={({ field }) => (
                  <Input
                    id="filterName"
                    placeholder="e.g. VIP Clients or Receipts"
                    className={errors.filterName ? "border-destructive focus-visible:ring-destructive" : ""}
                    {...field}
                  />
                )}
              />
              {errors.filterName && (
                <p className="text-destructive text-xs">{errors.filterName.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Conditions */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Matching Rule</Label>
              <Controller
                name="conditionType"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ALL" id="all" />
                      <Label htmlFor="all" className="font-normal text-xs sm:text-sm cursor-pointer">
                        Match <strong className="font-semibold text-foreground">ALL</strong> conditions (Logical AND)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ANY" id="any" />
                      <Label htmlFor="any" className="font-normal text-xs sm:text-sm cursor-pointer">
                        Match <strong className="font-semibold text-foreground">ANY</strong> condition (Logical OR)
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            <Collapsible
              open={isOpen.conditions}
              onOpenChange={() => toggleSection("conditions")}
              className="border rounded-xl p-4 border-border/70 bg-card/50"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <span className="font-medium text-xs sm:text-sm">IF Conditions ({fields.length})</span>
                {isOpen.conditions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-3 rounded-lg border border-border/50 bg-background/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Controller
                        name={`conditions.${index}.field`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <SelectTrigger className="h-9 text-xs flex items-center justify-between">
                              <SelectValue placeholder="Select field" />
                              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1.5" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="The subject">Subject</SelectItem>
                              <SelectItem value="From">Sender (From)</SelectItem>
                              <SelectItem value="To">Recipient (To)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Controller
                        name={`conditions.${index}.operator`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || undefined}>
                            <SelectTrigger className="h-9 text-xs flex items-center justify-between">
                              <SelectValue placeholder="Select operator" />
                              <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1.5" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">contains</SelectItem>
                              <SelectItem value="does not contain">does not contain</SelectItem>
                              <SelectItem value="is">exact match (is)</SelectItem>
                              <SelectItem value="is not">is not</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Controller
                        name={`conditions.${index}.value`}
                        control={control}
                        rules={{ required: "Condition value is required" }}
                        render={({ field }) => (
                          <div className="flex-1 space-y-1">
                            <Input
                              placeholder="Type keyword or phrase"
                              className={cn(
                                "h-9 text-xs bg-background",
                                errors.conditions?.[index]?.value && "border-destructive"
                              )}
                              {...field}
                            />
                            {errors.conditions?.[index]?.value && (
                              <p className="text-destructive text-[11px]">
                                {errors.conditions[index].value?.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-lg text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => remove(index)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-lg text-xs gap-1"
                    onClick={() => append({ field: "The subject", operator: "contains", value: "" })}
                  >
                    <Plus className="size-3.5" />
                    Add condition
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Step 3: Actions */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border/70 bg-card/50 space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Move to Folder</Label>
              <Controller
                name="actions.moveToFolder"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger className="h-9 text-xs sm:text-sm bg-background flex items-center justify-between">
                      <SelectValue placeholder="Select folder" />
                      <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0 ml-1.5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inbox">Inbox (Default)</SelectItem>
                      <SelectItem value="Spam">Spam</SelectItem>
                      <SelectItem value="Trash">Trash</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-card/50 space-y-3">
              <Label className="text-xs sm:text-sm font-medium">Automatic Flags</Label>
              <div className="flex flex-wrap gap-6 pt-1">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="actions.markAsRead"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="markAsRead"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="markAsRead" className="text-xs sm:text-sm font-normal cursor-pointer">
                    Mark as Read
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="actions.markAsStarred"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="markAsStarred"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="markAsStarred" className="text-xs sm:text-sm font-normal cursor-pointer">
                    Star message
                  </Label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border/70 bg-card/50 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Filter Name</span>
                <span className="font-semibold text-foreground">{watchedValues.filterName}</span>
              </div>
              <div className="space-y-1 border-b border-border/40 pb-2">
                <span className="text-muted-foreground block font-medium">Conditions:</span>
                {watchedValues.conditions.map((c, i) => (
                  <p key={i} className="text-foreground pl-2">
                    • If {c.field.toLowerCase()} {c.operator} &quot;<strong>{c.value}</strong>&quot;
                  </p>
                ))}
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block font-medium">Actions:</span>
                <p className="text-foreground pl-2">
                  • Move to {watchedValues.actions.moveToFolder || "Inbox"}
                  {watchedValues.actions.markAsRead && ", Mark as read"}
                  {watchedValues.actions.markAsStarred && ", Star"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 pl-1">
              <Controller
                name="applyToExisting"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="applyToExisting"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="applyToExisting" className="text-xs sm:text-sm font-normal cursor-pointer">
                Apply filter retroactively to existing inbox messages
              </Label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prevStep}
              className="rounded-xl h-9 px-4 text-xs sm:text-sm"
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              size="sm"
              onClick={nextStep}
              className="rounded-xl h-9 px-5 text-xs sm:text-sm"
            >
              {currentStep === 2 ? "Review Filter" : "Continue"}
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl h-9 px-6 text-xs sm:text-sm"
            >
              {isSubmitting ? "Saving…" : "Save Filter"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
