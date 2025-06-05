import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"

type MyDrawerProps = {
    triggerButton: React.ReactNode, children: React.ReactNode
    title: string
    description?: string
    width?: "default" | "max" | "large" | "medium" | "small" | "xtra"
    open?: boolean
}
export function MyDrawer({ triggerButton, children, title, description, width, open }: MyDrawerProps) {

    return (
        <Drawer   >
            <DrawerTrigger asChild>
                {triggerButton}
            </DrawerTrigger>
            <DrawerContent>
                <div className="mx-auto w-[580px]">
                    <DrawerHeader className="text-center">
                        <DrawerTitle>{title}</DrawerTitle>
                        {description && <DrawerDescription>description</DrawerDescription>}
                    </DrawerHeader>
                    <div className="p-4 pb-0">
                        <div className="items-center justify-center space-x-2">
                            {children}
                        </div>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    )
}