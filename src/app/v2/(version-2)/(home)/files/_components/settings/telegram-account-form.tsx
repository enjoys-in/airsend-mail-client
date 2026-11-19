import { createTelegramAccountSchema, type CreateTelegramAccountSchema } from "@nimbus/_packages/shared";
import { useCreateTelegramAccount } from "@nimbus/_hooks/useCreateAccount";
import { FieldError } from "@nimbus/_components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@nimbus/_components/ui/button";
import { Label } from "@nimbus/_components/ui/label";
import { Input } from "@nimbus/_components/ui/input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type TelegramAccountFormProps = {
	onSuccess: () => void;
	onCancel: () => void;
};

export function TelegramAccountForm({ onSuccess, onCancel }: TelegramAccountFormProps) {
	const { mutateAsync: createAccount, isPending: isLoading } = useCreateTelegramAccount();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateTelegramAccountSchema>({
		resolver: zodResolver(createTelegramAccountSchema),
		defaultValues: { botToken: "", chatId: "", nickname: "" },
	});

	const onSubmit = async (formData: CreateTelegramAccountSchema) => {
		setError(null);
		try {
			await createAccount(formData);
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="botToken">Bot Token</Label>
				<Input
					id="botToken"
					type="password"
					autoComplete="off"
					placeholder="123456789:AAH..."
					{...register("botToken")}
					disabled={isLoading}
				/>
				<p className="text-muted-foreground text-xs">
					Create a bot with @BotFather and paste the token it gives you. It is stored encrypted.
				</p>
				<FieldError error={errors.botToken?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="chatId">Chat or Channel ID</Label>
				<Input id="chatId" type="text" placeholder="-1001234567890" {...register("chatId")} disabled={isLoading} />
				<p className="text-muted-foreground text-xs">
					Add the bot as an admin of the chat or channel where files should live. Group and channel IDs look like
					-100123..., private chats are a positive number.
				</p>
				<FieldError error={errors.chatId?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="telegram-nickname">Account Nickname (Optional)</Label>
				<Input
					id="telegram-nickname"
					type="text"
					placeholder="Team files on Telegram"
					{...register("nickname")}
					disabled={isLoading}
				/>
				<FieldError error={errors.nickname?.message} />
			</div>

			{error && (
				<div className="bg-destructive/15 rounded-md p-3">
					<p className="text-destructive text-sm">{error}</p>
				</div>
			)}

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Add Telegram Account
				</Button>
			</div>
		</form>
	);
}
