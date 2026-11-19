"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { API } from "@/lib/api/handler"
import { isValidDomain } from "@/lib/helper"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { FormActions, NextSteps, PageHeader, PageShell, Section, SplitForm } from "@/components/h-panel/kit"

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
        <PageShell>
            <PageHeader
                back={{ href: "/h-panel/domains", label: "Domains" }}
                title="Add a domain"
                description="Add a domain you own. You will verify it with a DNS record before you can send mail."
            />

            <SplitForm
                aside={
                    <>
                        <NextSteps
                            steps={[
                                "Add the domain here.",
                                "Verify ownership with the TXT record we show you.",
                                "Publish the DKIM, SPF and DMARC records, then verify them to start sending.",
                            ]}
                        />
                        <FormActions>
                            <Button variant="outline" onClick={() => router.back()} disabled={loading}>
                                Cancel
                            </Button>
                            <Button className="flex-1" onClick={handleAddNewDomain} disabled={loading || !input.trim()}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Add domain
                            </Button>
                        </FormActions>
                    </>
                }
            >
                <Section title="Domain" description="Enter the domain name you want to add.">
                    <div className="max-w-md space-y-1.5">
                        <Label htmlFor="domain-name" className="text-sm">
                            Domain name
                        </Label>
                        <Input
                            id="domain-name"
                            type="text"
                            placeholder="example.com"
                            className="h-9 font-mono text-sm"
                            value={input}
                            autoFocus
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !loading && handleAddNewDomain()}
                        />
                        <p className="text-xs text-muted-foreground">Without http:// or www, for example example.com.</p>
                    </div>
                </Section>
            </SplitForm>
        </PageShell>
    )
}
