import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/v2/(version-2)/(home)/files/_components/ui/select";
import { AWS_REGIONS, createS3AccountSchema, type CreateS3AccountSchema } from "@/app/v2/(version-2)/(home)/files/_packages/shared";
import { FieldError } from "@/app/v2/(version-2)/(home)/files/_components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/app/v2/(version-2)/(home)/files/_components/ui/button";
import { Label } from "@/app/v2/(version-2)/(home)/files/_components/ui/label";
import { Input } from "@/app/v2/(version-2)/(home)/files/_components/ui/input";
import { Loader2 } from "lucide-react";
import { useCreateS3Account } from "@/app/v2/(version-2)/(home)/files/_hooks/useCreateAccount";
import { useState } from "react";
import { getS3Service, type S3Service } from "@/app/v2/(version-2)/(home)/files/_lib/s3-services";

type S3AccountFormProps = {
	/** The S3-compatible service being connected: sets the endpoint hints and whether the endpoint is required. */
	service?: S3Service;
	onSuccess: () => void;
	onCancel: () => void;
};

export function S3AccountForm({ service = getS3Service("aws"), onSuccess, onCancel }: S3AccountFormProps) {
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
		if (service.endpointRequired && !formData.endpoint) {
			setError(`${service.label} needs the endpoint of the service.`);
			return;
		}
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
				<Label htmlFor="endpoint">{service.endpointRequired ? "Endpoint" : "Custom Endpoint (Optional)"}</Label>
				<Input
					id="endpoint"
					type="url"
					placeholder={service.endpointPlaceholder}
					disabled={isLoading}
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
				/>
				<p className="text-muted-foreground text-xs">{service.endpointHint}</p>
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
