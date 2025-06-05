import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"


type InputProps = {
    isFooter?: false
    onClick?: () => void
}
type InputPropsWithFooter = {
    isFooter: true
    onClick: () => void
}
export function CustomDialog({
    triggerComponent,
    header,
    description,
    children,
    isFooter = false,
    onClick,
}: {
    triggerComponent: React.JSX.Element
    children: React.JSX.Element
    header?: string,
    description?: string
} & (InputProps | InputPropsWithFooter)) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {triggerComponent}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                {header && (
                    <DialogHeader>
                        <DialogTitle>{header}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                )}
                {children}
                {isFooter && (<DialogFooter>
                    <Button onClick={onClick}>Save changes</Button>
                </DialogFooter>)}
            </DialogContent>
        </Dialog>
    )
}
