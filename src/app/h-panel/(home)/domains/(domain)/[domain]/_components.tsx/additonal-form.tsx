"use client"

import React from "react"
import { useForm, Controller } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { API } from "@/lib/api/handler"
import { useToast } from "@/components/ui/use-toast"

type FormData = {
    listAsPublic: boolean
    pricingOption: "free" | "premium"
    premiumAmount: number
}

export function AdditonalForm({ domainId, data }: { domainId: string, data: any }) {
    const { toast } = useToast()
    const { control, watch, handleSubmit } = useForm<FormData>({
        defaultValues: {
            listAsPublic: false,
            pricingOption: "free",
            premiumAmount: 10,
        },
    })

    const listAsPublic = watch("listAsPublic")
    const pricingOption = watch("pricingOption")
    const saveChanges = async (input: FormData) => {
        try {
            const { data } = await API.updateDomain(domainId, {
                is_public: input.listAsPublic,
                metadata: {
                    is_public: input.listAsPublic,
                    is_free: input.pricingOption === "free" ? true : {
                        amount: input.premiumAmount,
                        currency: "INR"
                    }
                }
            })
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({
                title: data.message
            })
        } catch (error: any) {
            toast({

                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        }
    }
    React.useEffect(() => {
        if (data) {
            control._formValues.listAsPublic = data.is_public
            control._formValues.pricingOption = data?.metadata?.is_free ? "free" : "premium"
            control._formValues.premiumAmount = data?.metadata?.is_free ? null : data?.metadata?.amount
        }
    }, [])
    return (
        <form className="space-y-6" onSubmit={handleSubmit(saveChanges)}>
            <div className="flex items-center space-x-2">
                <Controller
                    name="listAsPublic"
                    control={control}
                    render={({ field }) => (
                        <Checkbox
                            id="listAsPublic"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
                <Label htmlFor="listAsPublic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    List As Public
                </Label>
            </div>

            {listAsPublic && (
                <div className="space-y-4">
                    <Controller
                        name="pricingOption"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-wrap items-center gap-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="free" id="free" />
                                    <Label htmlFor="free" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Is Free
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="premium" id="premium" />
                                    <Label htmlFor="premium" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Is Premium
                                    </Label>
                                </div>
                                {pricingOption === "premium" && (
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="premiumAmount" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Premium Amount:
                                        </Label>
                                        <Controller
                                            name="premiumAmount"
                                            control={control}
                                            rules={{ min: 10, max: 45 }}
                                            render={({ field }) => (
                                                <Input
                                                    id="premiumAmount"
                                                    type="number"
                                                    {...field}
                                                    min={10}
                                                    max={45}
                                                    className="w-24"
                                                />
                                            )}
                                        />
                                    </div>
                                )}
                            </RadioGroup>
                        )}
                    />
                </div>
            )}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                {
                    listAsPublic && <Button
                        className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"

                    >

                        <span>Save Changes</span>
                    </Button>
                }
            </div>
        </form>
    )
}

