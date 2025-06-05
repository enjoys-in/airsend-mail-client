"use client"

import { useState } from "react"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

const steps = ["Name", "Conditions", "Actions", "Preview"]

export function AddFilterDialog() {
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
    formState: { errors },
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

  const onSubmit = async (data: FormData) => {
    try {
      // This would be replaced with your actual API endpoint
      const response = await fetch("/api/filters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to save filter")
      }

      // Handle success (e.g., show notification, close modal)
      console.log("Filter saved successfully")
    } catch (error) {
      console.error("Error saving filter:", error)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleSection = (section: keyof typeof isOpen) => {
    setIsOpen((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <div className="text-white p-4">
      <div className="p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <span className={currentStep === index ? "text-white" : ""}>{step}</span>
              {index < steps.length - 1 && <span className="mx-2">›</span>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Name */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="filterName" className="block text-sm font-medium">
                  Filter Name
                </label>
                <Controller
                  name="filterName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Input id="filterName" className="bg-black border-gray-700 text-white" {...field} />
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Conditions */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium">Statement</label>
                <Controller
                  name="conditionType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ALL" id="all" className="border-gray-600" />
                        <Label htmlFor="all" className="font-normal">
                          ALL{" "}
                          <span className="text-gray-400 italic">
                            (Filter if ALL of the following conditions are met)
                          </span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ANY" id="any" className="border-gray-600" />
                        <Label htmlFor="any" className="font-normal">
                          ANY{" "}
                          <span className="text-gray-400 italic">
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
                className="border-t border-b border-gray-800 py-4"
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
                              <SelectTrigger className="bg-black border-gray-700 text-white">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-gray-700 text-white">
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
                              <SelectTrigger className="bg-black border-gray-700 text-white">
                                <SelectValue placeholder="Select operator" />
                              </SelectTrigger>
                              <SelectContent className="bg-black border-gray-700 text-white">
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
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Input
                              className="flex-1 bg-black border-gray-700 text-white"
                              placeholder="Type text or keyword"
                              {...field}
                            />
                          )}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-gray-800 hover:bg-gray-700 text-white"
                        >
                          Insert
                        </Button>
                      </div>
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
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
                      className="text-blue-500 p-0 h-auto"
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
                className="border-t border-b border-gray-800 py-4"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isOpen.labelAs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-2 font-medium">Label as</span>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="text-center py-2">
                    <p className="text-gray-400">No label found</p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 border-gray-700 text-white hover:bg-gray-800"
                    >
                      Create label
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isOpen.moveTo}
                onOpenChange={() => toggleSection("moveTo")}
                className="border-b border-gray-800 py-4"
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
                        <SelectTrigger className="bg-black border-gray-700 text-white">
                          <SelectValue placeholder="Select folder" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-gray-700 text-white">
                          <SelectItem value="Inbox">Inbox - Default</SelectItem>
                          <SelectItem value="Spam">Spam</SelectItem>
                          <SelectItem value="Trash">Trash</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline" className="border-gray-700 text-white hover:bg-gray-800">
                    Create folder
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible
                open={isOpen.markAs}
                onOpenChange={() => toggleSection("markAs")}
                className="border-b border-gray-800 py-4"
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
                            className="border-gray-600"
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
                            className="border-gray-600"
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
                    <div className="relative inline-flex h-4 w-8 items-center rounded-full bg-gray-700 transition-colors">
                      <div
                        className={`${field.value ? "translate-x-4 bg-blue-500" : "translate-x-1 bg-gray-400"
                          } h-3 w-3 rounded-full transition-transform`}
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

                <div className="border-t border-gray-800 pt-4">
                  <Collapsible open={true} className="border-b border-gray-800 pb-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <ChevronUp size={16} />
                        <span className="ml-2 font-medium">Conditions</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="text-gray-300">
                        If the subject contains {watchedValues.conditions[0]?.value || ""}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="border-b border-gray-800 pb-4">
                  <Collapsible open={true}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <ChevronUp size={16} />
                        <span className="ml-2 font-medium">Actions</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <div className="text-gray-300">
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
                      className="border-gray-600"
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
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={nextStep}
                className={currentStep === 1 ? "bg-gray-800 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}
              >
                {currentStep === 1 ? "Next" : "Preview"}
              </Button>
            ) : (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save
              </Button>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}
