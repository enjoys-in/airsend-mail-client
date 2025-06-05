"use client"
import React from 'react'
import Link from 'next/link';
import { API } from '@/lib/api/handler';
import { Card, } from "@/components/ui/card"
import { useRouter } from 'next/navigation';
import { isValidDomain } from "@/lib/helper";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";

const Page = () => {
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(false);
    const router = useRouter()
    const [input, setInput] = React.useState("");

    const handleAddNewDomain = async () => {
        try {
            setLoading(true)
            if (input.trim() === "") {
                throw new Error("Domain name is required");
            }
            if (!isValidDomain(input)) {
                throw new Error("Invalid domain name");
            }
            const { data } = await API.addNewDomain({ domain_name: input });
            if (!data.success) {
                throw new Error(data.message);
            }
            toast({
                title: data.message,
            });
            setInput("");
            router.back()
            setLoading(false)

        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Please try again later.",
            });
            setLoading(false)
        }
    };
    return (
        <div className="bg-background">
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/h-panel/domains/" className="btn btn-primary"> <Button className="rounded-none">Go Back</Button></Link>
                    <h1 className="text-2xl font-semibold text-gray-300">Add New Domain</h1>

                </div>
                <Card className="flex  mx-auto justify-center p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium w-full text-gray-900 dark:text-white">
                                Domain Name
                            </label>
                            <div className="mt-1">
                                <Input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="block w-full  rounded-none border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        <Button onClick={handleAddNewDomain} disabled={loading} className="w-full rounded-none">
                            Add
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Page