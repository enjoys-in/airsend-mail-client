import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@nimbus/_components/ui/select";
import { AWS_REGIONS, createS3AccountSchema, type CreateS3AccountSchema } from "@nimbus/_packages/shared";
import { FieldError } from "@nimbus/_components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@nimbus/_components/ui/button";
import { Label } from "@nimbus/_components/ui/label";
import { Input } from "@nimbus/_components/ui/input";
import { Loader2 } from "lucide-react";
import { useCreateS3Account } from "@nimbus/_hooks/useCreateAccount";
import { useState } from "react";

type S3AccountFormProps = {
	onSuccess: () => void;
	onCancel: () => void;
};

export function S3AccountForm({ onSuccess, onCancel }: S3AccountFormProps) {
	const { mutateAsync: createAccount, isPending: isLoading } = useCreateS3Account();
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
		control,
	} = useForm<CreateS3AccountSchema>({
		resolver: zodResolver(createS3AccountSchema),
		defaultValues: {
			endpoint: "",
			nickname: null,
		},
	});

	const onSubmit = async (formData: CreateS3AccountSchema) => {
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
				<Label htmlFor="accessKeyId">Access Key ID</Label>
				<Input id="accessKeyId" type="text" placeholder="AKIA..." {...register("accessKeyId")} disabled={isLoading} />
				<FieldError error={errors.accessKeyId?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="secretAccessKey">Secret Access Key</Label>
				<Input
					id="secretAccessKey"
					type="password"
					placeholder="Enter your secret access key"
					{...register("secretAccessKey")}
					disabled={isLoading}
				/>
				<FieldError error={errors.secretAccessKey?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">Region</Label>
				<Controller
					name="region"
					control={control}
					render={({ field }) => (
						<Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
							<SelectTrigger>
								<SelectValue placeholder="Select a region" />
							</SelectTrigger>
							<SelectContent>
								{AWS_REGIONS.map(region => (
									<SelectItem key={region.value} value={region.value}>
										{region.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
				<FieldError error={errors.region?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="bucketName">Bucket Name</Label>
				<Input
					id="bucketName"
					type="text"
					placeholder="my-s3-bucket"
					{...register("bucketName")}
					disabled={isLoading}
				/>
				<FieldError error={errors.bucketName?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
				<Input
					id="endpoint"
					type="url"
					placeholder="https://s3.amazonaws.com"
					{...register("endpoint", {
						setValueAs: value => (value === "" ? undefined : value),
						validate: value => {
							if (!value) return true; // Allow empty/undefined
							try {
								new URL(value);
								return true;
							} catch {
								return "Please enter a valid URL";
							}
						},
					})}
					onChange={e => {
						const value = e.target.value === "" ? undefined : e.target.value;
						setValue("endpoint", value, { shouldValidate: true });
					}}
					disabled={isLoading}
				/>
				<p className="text-muted-foreground text-xs">
					Leave empty for AWS S3. Use for S3-compatible services like MinIO, Cloudflare R2, DigitalOcean Spaces, etc.
				</p>
				<FieldError error={errors.endpoint?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="nickname">Account Nickname (Optional)</Label>
				<Input
					id="nickname"
					type="text"
					placeholder="My S3 Account"
					{...register("nickname", {
						setValueAs: value => (value === "" ? null : value),
					})}
					onChange={e => {
						const value = e.target.value === "" ? null : e.target.value;
						setValue("nickname", value, { shouldValidate: true });
					}}
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
					Add S3 Account
				</Button>
			</div>
		</form>
	);
}
