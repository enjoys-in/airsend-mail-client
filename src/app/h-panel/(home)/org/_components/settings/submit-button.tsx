"use client"

import { useFormStatus } from "react-dom"
import { useFormContext } from "react-hook-form"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SubmitButtonProps extends Omit<ButtonProps, "type"> {
    children?: React.ReactNode
}

export function SubmitButton({ children = "Save Settings", ...props }: SubmitButtonProps) {
    const { pending } = useFormStatus()
    const { formState: { isDirty } } = useFormContext()

    return (
        <Button type="submit" size="sm" disabled={pending || !isDirty} {...props}>
            {pending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {children}
        </Button>
    )
}
