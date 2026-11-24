import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/app/v2/(version-2)/(home)/files/_components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/v2/(version-2)/(home)/files/_components/ui/tabs";
import { useShareLinks, useSharePeople } from "@/app/v2/(version-2)/(home)/files/_hooks/useShares";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Input } from "@/app/v2/(version-2)/(home)/files/_components/ui/input";
import { Copy, Link2, Trash2, UserPlus, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

interface ShareFileDialogProps {
	isOpen: boolean;
	onClose: () => void;
	fileId: string;
	fileName: string;
}

const EXPIRY = [
	{ label: "Never expires", days: null },
	{ label: "1 day", days: 1 },
	{ label: "7 days", days: 7 },
	{ label: "30 days", days: 30 },
] as const;

const copy = (text: string) =>
	navigator.clipboard.writeText(text).then(
		() => toast.success("Link copied"),
		() => toast.error("Could not copy the link")
	);

export function ShareFileDialog({ isOpen, onClose, fileId, fileName }: ShareFileDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Share “{fileName}”</DialogTitle>
					<DialogDescription>Create a public link, or share it with people in your organization.</DialogDescription>
				</DialogHeader>
				<Tabs defaultValue="link">
					<TabsList className="w-full">
						<TabsTrigger value="link">Link</TabsTrigger>
						<TabsTrigger value="people">People</TabsTrigger>
					</TabsList>
					<TabsContent value="link">
						<LinkTab fileId={fileId} enabled={isOpen} />
					</TabsContent>
					<TabsContent value="people">
						<PeopleTab fileId={fileId} enabled={isOpen} />
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}

function LinkTab({ fileId, enabled }: { fileId: string; enabled: boolean }) {
	const { list, create, revoke } = useShareLinks(fileId, enabled);
	const [days, setDays] = useState<number | null>(null);
	const links = list.data ?? [];

	return (
		<div className="space-y-3 pt-2">
			<div className="flex gap-2">
				<select
					className="border-input bg-background h-9 flex-1 rounded-md border px-2 text-sm"
					value={days ?? ""}
					onChange={e => setDays(e.target.value ? Number(e.target.value) : null)}
				>
					{EXPIRY.map(o => (
						<option key={o.label} value={o.days ?? ""}>
							{o.label}
						</option>
					))}
				</select>
				<Button
					onClick={() => create.mutate(days, { onSuccess: link => void copy(link.url) })}
					disabled={create.isPending}
				>
					<Link2 /> Create link
				</Button>
			</div>
			{list.isLoading && <p className="text-muted-foreground text-sm">Loading links…</p>}
			{!list.isLoading && !links.length && <p className="text-muted-foreground text-sm">No active links.</p>}
			{links.map(link => (
				<div key={link.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm">{link.url}</p>
						<p className="text-muted-foreground text-xs">
							{link.expiresAt ? `Expires ${format(new Date(link.expiresAt), "MMM d, yyyy")}` : "Never expires"} ·{" "}
							{link.downloadCount} downloads
						</p>
					</div>
					<Button variant="ghost" size="icon" onClick={() => void copy(link.url)} title="Copy link">
						<Copy />
					</Button>
					<Button variant="ghost" size="icon" onClick={() => revoke.mutate(link.id)} title="Revoke link">
						<Trash2 />
					</Button>
				</div>
			))}
		</div>
	);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PeopleTab({ fileId, enabled }: { fileId: string; enabled: boolean }) {
	const { list, share, remove } = useSharePeople(fileId, enabled);
	const [text, setText] = useState("");
	const people = list.data ?? [];

	const submit = () => {
		const emails = text
			.split(/[\s,;]+/)
			.map(e => e.trim().toLowerCase())
			.filter(Boolean);
		const bad = emails.filter(e => !EMAIL.test(e));
		if (!emails.length) return;
		if (bad.length) return void toast.error(`Not an email: ${bad.join(", ")}`);
		share.mutate(emails, { onSuccess: () => (setText(""), toast.success("Shared")) });
	};

	return (
		<div className="space-y-3 pt-2">
			<div className="flex gap-2">
				<Input
					placeholder="name@company.com, …"
					value={text}
					onChange={e => setText(e.target.value)}
					onKeyDown={e => e.key === "Enter" && submit()}
				/>
				<Button onClick={submit} disabled={share.isPending || !text.trim()}>
					<UserPlus /> Share
				</Button>
			</div>
			{list.isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
			{!list.isLoading && !people.length && <p className="text-muted-foreground text-sm">Not shared with anyone yet.</p>}
			{people.map(p => (
				<div key={p.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5">
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm">{p.sharedWith}</p>
						<p className="text-muted-foreground text-xs">Shared by {p.sharedBy}</p>
					</div>
					<Button variant="ghost" size="icon" onClick={() => remove.mutate(p.id)} title="Stop sharing">
						<X />
					</Button>
				</div>
			))}
		</div>
	);
}
