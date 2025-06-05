"use client"

import * as z from "zod"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { HelpCircle, Loader2, MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppSelector } from "@/store/hooks"
import axios from "axios"
import { toast } from "../ui/use-toast"

const formSchema = z.object({
    type: z.string().min(1, { message: "Please select a report type" }),
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
})

type FormData = z.infer<typeof formSchema>

interface ReportFormProps {
    onClose: () => void
}

export function ReportButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        isOpen ? (
            <Card className="fixed bottom-20 right-4 w-80 md:w-96 p-4 shadow-xl z-50 md:bottom-24 md:right-6 lg:bottom-28 lg:right-8">
                <Button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                        "absolute top-2 right-2 shadow-lg",
                        "hover:scale-110 transition-transform duration-200",
                        "bg-accent  text-white",
                        "h-8 w-8 rounded-full p-0"
                    )}

                    variant="ghost"
                    size="sm"
                >
                    <X className="h-4 w-4" />
                </Button>
                <ReportForm onClose={() => setIsOpen(false)} />
            </Card>
        ) : (
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-lg shadow-lg transition-all duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                    aria-label={isOpen ? "Close help" : "Open help"}
                >
                    {isOpen ? (
                        <X size={24} aria-hidden="true" />
                    ) : (
                        <HelpCircle size={24} aria-hidden="true" />
                    )}
                </Button>
            </div>
        )

    )
}

export default function ReportForm({ onClose }: ReportFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)


    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "",
            name: "",
            email: "",
            description: "",
        },
    })

    const onSubmit = async (input: FormData) => {
        try {
            setIsSubmitting(true)
            const formData = new FormData();
            formData.append("type", input.type);
            formData.append("name", input.name);
            formData.append("email", input.email);
            formData.append("description", input.description);

            const { data } = await axios.post("https://svc.enjoys.in/api/support", formData)
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({
                title: "Request submitted successfully",
                description: "We'll get back to you soon!",
            });
            setIsSubmitting(false);
            onClose()
            form.reset();
        } catch (error) {
            toast({
                title: "Something went wrong",
                variant: "destructive",

            });
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Report Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="rounded-none">
                                        <SelectValue placeholder="Select report type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-none">
                                    <SelectItem value="report">Report</SelectItem>
                                    <SelectItem value="bugs-issue">Bugs/Issue</SelectItem>
                                    <SelectItem value="feature">Request a Feature</SelectItem>
                                    <SelectItem value="suggestion">Suggestion</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your name" className="rounded-none" {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Your email" type="email" {...field} className="rounded-none" />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel >Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe your report or request" className="rounded-none" rows={5} {...field} />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full bg-white hover:bg-accent hover:text-white rounded-none"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Submit Request'
                    )}
                </Button>
            </form>
        </Form>
    )
}