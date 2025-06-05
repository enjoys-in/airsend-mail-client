"use client"

import * as React from "react"
import type { Field, FieldValue, UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { Wizard, WizardProgress, WizardButtons, useWizard } from "@/components/ui/wizard"
import { toast } from "@/components/ui/use-toast"
 
import { Loader2, Check, RefreshCw } from "lucide-react"
import { useFormPersistence } from "@/hooks/use-form-persistence"

interface WizardFormProps<T extends z.ZodType> {
  title: string
  description?: string
  schema: T
  defaultValues: z.infer<T>
  onSubmit: (values: z.infer<T>) => void
  children: React.ReactNode
  className?: string
  form: UseFormReturn<z.infer<T>>
  stepFields?: { [key: number]: string[] }
  persistenceKey?: string
  persistForm?: boolean,
  onCompleteView?:React.JSX.Element
}

export function WizardForm<T extends z.ZodType>({
  title,
  description,
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  form,
  stepFields = {},
  persistenceKey = "wizard-form-data",
  persistForm = true,
  onCompleteView
}: WizardFormProps<T>) {
  const { isLoading, hasPersistedData, saveFormData, clearPersistedData } = useFormPersistence(
    form,
    persistenceKey,
    persistForm,
  )

  const handleClearData = () => {
    clearPersistedData()
    form.reset(defaultValues)
    toast({
      title: "Form reset",
      description: "Your saved progress has been cleared.",
      variant: "default",
    })
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your saved progress...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        {hasPersistedData && (
          <div className="mt-2 flex items-center justify-between">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
              Restored from saved progress
            </span>
            <button onClick={handleClearData} className="text-xs text-muted-foreground hover:text-destructive">
              Clear saved data
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
    
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <Wizard totalSteps={React.Children.count(children)} onCompleteView={onCompleteView}>
              <WizardFormContent
                onSubmit={onSubmit}
                form={form}
                stepFields={stepFields}
                onStepChange={saveFormData}
                clearPersistedData={clearPersistedData}
              >
                <WizardProgress className="mb-8" />                
                {children}
              </WizardFormContent>
            </Wizard>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

interface WizardFormContentProps<T =any> {
  onSubmit: (values: T) => void
  form: UseFormReturn<any>
  stepFields: { [key: number]: string[] }
  children: React.ReactNode
  onStepChange?: () => void
  clearPersistedData?: () => void
}

function WizardFormContent<T>({
  onSubmit,
  form,
  stepFields,
  children,
  onStepChange,
  clearPersistedData,
}: WizardFormContentProps<T>) {
  const { setSubmittedData, currentStep, reset } = useWizard()

  // Save form data when step changes
  React.useEffect(() => {
    if (onStepChange) {
      onStepChange()
    }
  }, [onStepChange])

  // Handle form completion with visible steps
  const handleComplete = (visibleSteps: number[]) => {
    // Only validate fields from visible steps
    const fieldsToValidate = visibleSteps.flatMap((step) => stepFields[step] || [])

        const customSubmit = async () => {
      try { 

        // If there are fields to validate, trigger validation
        if (fieldsToValidate.length > 0) {
          const isValid = await form.trigger(fieldsToValidate as any)
      

          if (!isValid) {
            toast({
              title: "Validation Error",
              description: "Please check your inputs and try again.",
              variant: "destructive",
            })
            return
          }
        }

        // Get the form values and submit
        const values = form.getValues()
     

        // Store the submitted data in the wizard context
        setSubmittedData(values)

        // Call the onSubmit function directly
        onSubmit(values)

        // Clear persisted data after successful submission
        if (clearPersistedData) {
          clearPersistedData()
        }
  
      } catch (error) {
        console.error("Form submission error:", error)
        toast({
          title: "Error",
          description: "There was a problem submitting the form.",
          variant: "destructive",
        })
      }
    }

 
    customSubmit()
  }

  return (
    <>
      {children}
      <WizardButtons onComplete={handleComplete} />
    </>
  )
}
 