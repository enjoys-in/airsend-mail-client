"use client"

import { useEffect, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Construction } from 'lucide-react'

interface ConfirmationModalProps {
    title: string
    message: string
    onConfirm: () => void
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm }) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasConfirmed = localStorage.getItem('modalConfirmed')
        if (!hasConfirmed) {
            setIsOpen(true)
        }
    }, [])

    const handleConfirm = () => {
        localStorage.setItem('modalConfirmed', 'true')
        setIsOpen(false)
        onConfirm()
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                            <Construction className="h-5 w-5 text-amber-500" />
                        </div>
                        <AlertDialogTitle className="text-xl">
                            Airsend Mail is Under Development
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="pt-3 text-sm leading-relaxed">
                        Airsend Mail is currently in active development. While you can continue to send emails without interruption, some features may not work as expected. If you encounter any issues, feel free to click on the <strong className="text-foreground">Help</strong> button to raise a request &mdash; we&apos;ll aim to fix it promptly!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
