"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"

/** Clears the logs of this one domain (not of the admin's other domains). */
export function ClearDomainLogsButton({ domainId, disabled }: { domainId: string; disabled?: boolean }) {
    const router = useRouter()
    const [open, setOpen] = React.useState(false)
    const [isClearing, setIsClearing] = React.useState(false)

    const clearLogs = async () => {
        setIsClearing(true)
        try {
            const { data } = await API.handleClearDomainLogs(domainId)
            if (!data.success) throw new Error(data.message)
            toast({
                title: "Domain logs cleared",
                description: `${data.result?.deleted ?? 0} log(s) removed.`,
            })
            setOpen(false)
            router.refresh()
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Could not clear the domain logs",
                description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
            })
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-none" disabled={disabled}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear domain logs
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Clear the logs of this domain?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This permanently deletes all logs of this domain only. Other domains are not affected. This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isClearing}
                        onClick={(e) => {
                            e.preventDefault() // keep the dialog open until the request finishes
                            clearLogs()
                        }}
                    >
                        {isClearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Clear domain logs
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
