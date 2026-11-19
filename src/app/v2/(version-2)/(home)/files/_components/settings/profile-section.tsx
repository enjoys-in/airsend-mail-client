import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/v2/(version-2)/(home)/files/_components/ui/card";
import Profile from "@/app/v2/(version-2)/(home)/files/_components/user-profile";
import { Label } from "@/app/v2/(version-2)/(home)/files/_components/ui/label";
import { Input } from "@/app/v2/(version-2)/(home)/files/_components/ui/input";

interface ProfileSectionProps {
	name: string;
	email: string;
	previewUrl: string | null;
}

// The name, email and avatar belong to the AirSend account, so they are shown here but edited in AirSend.
export function ProfileSection({ name, email, previewUrl }: ProfileSectionProps) {
	return (
		<Card id="profile" className="py-6">
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
				<CardDescription>Your profile is managed by AirSend</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="flex items-center gap-6">
					<Profile url={previewUrl} name={name} size="xxxxxxl" />

					<div className="flex-1 space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Full Name</Label>
							<Input id="name" value={name} readOnly disabled />
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" type="email" value={email} readOnly disabled />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
