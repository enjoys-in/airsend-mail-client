"use client"

import React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { API } from "@/lib/api/handler"
import { isValidDomain } from "@/lib/helper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function CreateDomainPage() {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [input, setInput] = React.useState("")

    const handleAddNewDomain = async () => {
        try {
            setLoading(true)
            const trimmed = input.trim()
            if (!trimmed) {
                throw new Error("Domain name is required")
            }
            if (!isValidDomain(trimmed)) {
                throw new Error("Invalid domain name")
            }
            const { data } = await API.addNewDomain({ domain_name: trimmed })
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({ title: data.message })
            setInput("")
            router.back()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error?.message || "Something went wrong. Please try again later.",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/h-panel/domains">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Link>
                </Button>
                <h1 className="text-lg font-semibold">Add New Domain</h1>
            </header>

            <div className="flex-1 p-4">
                <div className="max-w-lg mx-auto">
                    <Card className="rounded-none">
                        <CardHeader>
                            <CardTitle className="text-base">Domain Information</CardTitle>
                            <CardDescription>Enter the domain name you want to add</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="domain-name">Domain Name</Label>
                                <Input
                                    id="domain-name"
                                    type="text"
                                    placeholder="example.com"
                                    className="rounded-none"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !loading && handleAddNewDomain()}
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" className="rounded-none" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button size="sm" className="rounded-none" onClick={handleAddNewDomain} disabled={loading || !input.trim()}>
                                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Add Domain
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}