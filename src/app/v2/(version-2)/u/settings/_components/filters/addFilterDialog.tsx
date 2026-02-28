"use client"

import { useState, useCallback } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"

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
    // TODO: Wire to a real persistence layer (IDB / backend API) once
    // the filters endpoint or settings field is implemented.
    toast.info("Filter saved locally (backend integration pending)")
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
    <div className="p-4">
      <div className="p-4">
        {/* Step indicator */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center">
              <span
                className={
                  currentStep === index
                    ? "text-foreground font-medium"
                    : currentStep > index
                      ? "text-primary"
                      : ""
                }
              >
                {step}
              </span>
              {index < STEPS.length - 1 && <span className="mx-2">›</span>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Name */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="filterName">Filter Name</Label>
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
                      placeholder="e.g. Newsletters, Promotions"
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
              <div className="space-y-4">
                <Label>Statement</Label>
                <Controller
                  name="conditionType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ALL" id="all" />
                        <Label htmlFor="all" className="font-normal">
                          ALL{" "}
                          <span className="text-muted-foreground italic">
                            (Filter if ALL of the following conditions are met)
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ANY" id="any" />
                        <Label htmlFor="any" className="font-normal">
                          ANY{" "}
                          <span className="text-muted-foreground italic">
                            (Filter if ANY of the following conditions are met)
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />
              </div>

              <Collapsible
                open={isOpen.conditions}
                onOpenChange={() => toggleSection("conditions")}
                className="border-t border-b border-border py-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isOpen.conditions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-2 font-medium">IF</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Controller
                          name={`conditions.${index}.field`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="The subject">The subject</SelectItem>
                                <SelectItem value="From">From</SelectItem>
                                <SelectItem value="To">To</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Controller
                          name={`conditions.${index}.operator`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="contains">contains</SelectItem>
                                <SelectItem value="does not contain">does not contain</SelectItem>
                                <SelectItem value="is">is</SelectItem>
                                <SelectItem value="is not">is not</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Controller
                          name={`conditions.${index}.value`}
                          control={control}
                          rules={{ required: "Condition value is required" }}
                          render={({ field }) => (
                            <div className="flex-1 space-y-1">
                              <Input
                                placeholder="Type text or keyword"
                                className={
                                  errors.conditions?.[index]?.value
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                {...field}
                              />
                              {errors.conditions?.[index]?.value && (
                                <p className="text-destructive text-xs">
                                  {errors.conditions[index].value?.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => remove(index)}
                        >
                          <X size={16} className="mr-1" /> Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="link"
                      className="text-primary p-0 h-auto"
                      onClick={() => append({ field: "The subject", operator: "contains", value: "" })}
                    >
                      Add condition
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 3: Actions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Collapsible
                open={isOpen.labelAs}
                onOpenChange={() => toggleSection("labelAs")}
                className="border-t border-b border-border py-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isOpen.labelAs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-2 font-medium">Label as</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="text-center py-2">
                    <p className="text-muted-foreground">No label found</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                    >
                      Create label
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isOpen.moveTo}
                onOpenChange={() => toggleSection("moveTo")}
                className="border-b border-border py-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isOpen.moveTo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-2 font-medium">Move to</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <Controller
                    name="actions.moveToFolder"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inbox">Inbox - Default</SelectItem>
                          <SelectItem value="Spam">Spam</SelectItem>
                          <SelectItem value="Trash">Trash</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline">
                    Create folder
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isOpen.markAs}
                onOpenChange={() => toggleSection("markAs")}
                className="border-b border-border py-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isOpen.markAs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-2 font-medium">Mark as</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="flex space-x-8">
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
                      <Label htmlFor="markAsRead" className="font-normal">
                        Read
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
                      <Label htmlFor="markAsStarred" className="font-normal">
                        Starred
                      </Label>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="py-4 flex items-center space-x-2">
                <span className="font-medium">Send auto-reply</span>
                <Controller
                  name="actions.sendAutoReply"
                  control={control}
                  render={({ field }) => (
                    <div className="relative inline-flex h-4 w-8 items-center rounded-full bg-muted transition-colors">
                      <div
                        className={`${field.value ? "translate-x-4 bg-primary" : "translate-x-1 bg-muted-foreground"
                          } h-3 w-3 rounded-full transition-transform cursor-pointer`}
                        onClick={() => field.onChange(!field.value)}
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Preview */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Filter Name</span>
                  <span>{watchedValues.filterName}</span>
                </div>

                <div className="border-t border-border pt-4">
                  <Collapsible open={true} className="border-b border-border pb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <ChevronUp size={16} />
                        <span className="ml-2 font-medium">Conditions</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="text-muted-foreground">
                        {watchedValues.conditions.map((c, i) => (
                          <p key={i}>
                            If {c.field.toLowerCase()} {c.operator} &quot;{c.value}&quot;
                          </p>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="border-b border-border pb-4">
                  <Collapsible open={true}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <ChevronUp size={16} />
                        <span className="ml-2 font-medium">Actions</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="text-muted-foreground">
                        Then move emails to {watchedValues.actions.moveToFolder || "Inbox"}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
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
                <Label htmlFor="applyToExisting" className="font-normal">
                  Apply filter to existing emails
                </Label>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {currentStep > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                {currentStep === 2 ? "Preview" : "Next"}
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}
