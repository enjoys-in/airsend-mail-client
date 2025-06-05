import { Button } from "@/components/ui/button"
 
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function PopoverMe({ children, content }: { children: React.ReactNode, content: React.ReactNode }) {
    return (
        <Popover >
            <PopoverTrigger asChild >
                <Button variant="ghost">{children}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 float-right absolute " draggable >
                {content}
            </PopoverContent>
        </Popover>
    )
}