import { Root, Trigger, Portal, Content, Item, Separator, Label } from "@radix-ui/react-context-menu";
import type { ComponentProps } from "react";

import { cn } from "@/app/v2/(version-2)/(home)/files/_lib/utils";
import { nimbusPortalContainer } from "../../_lib/portal-container";

// Right-click menu, styled like dropdown-menu.tsx and portaled into the scoped `.nimbus-root` host.

const ContextMenu = Root;
const ContextMenuTrigger = Trigger;

function ContextMenuContent({ className, ...props }: ComponentProps<typeof Content>) {
	return (
		<Portal container={nimbusPortalContainer.current}>
			<Content
				className={cn(
					"bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=open]:fade-in-0 z-50 min-w-[11rem] overflow-hidden rounded-md border p-1 shadow-md",
					className
				)}
				{...props}
			/>
		</Portal>
	);
}

function ContextMenuItem({
	className,
	variant = "default",
	...props
}: ComponentProps<typeof Item> & { variant?: "default" | "destructive" }) {
	return (
		<Item
			data-variant={variant}
			className={cn(
				"focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
				className
			)}
			{...props}
		/>
	);
}

function ContextMenuSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
	return <Separator className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

function ContextMenuLabel({ className, ...props }: ComponentProps<typeof Label>) {
	return <Label className={cn("text-muted-foreground px-2 py-1 text-xs", className)} {...props} />;
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuLabel,
};
