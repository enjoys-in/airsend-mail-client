"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    CheckCircle2,
    AlertCircle,
    Building2,
    Lock,
    User,
    Mail,
    ArrowRight,
    Loader2,
    Shield,
    Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"

interface VerifyResult {
    token: string
    email: string
    name: string | null
    org_name: string
    org_slug: string
    domain_name: string
    role: string
    scopes: string[]
    expires_at: string
}

export default function AcceptInvitationPage() {
    return (
        <React.Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-muted/20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }
        >
            <AcceptInvitationContent />
        </React.Suspense>
    )
}

function AcceptInvitationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { toast } = useToast()

    const token = searchParams.get("token") || ""

    const [loading, setLoading] = React.useState(true)
    const [verifying, setVerifying] = React.useState(true)
    const [invitation, setInvitation] = React.useState<VerifyResult | null>(null)
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

    // Form fields
    const [name, setName] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const [submitting, setSubmitting] = React.useState(false)

    // Success state
    const [acceptedAccount, setAcceptedAccount] = React.useState<any | null>(null)

    React.useEffect(() => {
        if (!token) {
            setErrorMessage("No invitation token found in link.")
            setVerifying(false)
            setLoading(false)
            return
        }

        API.verifyInvitation(token)
            .then((res) => {
                if (res.data?.success && res.data?.result) {
                    const inv = res.data.result
                    setInvitation(inv)
                    setName(inv.name || "")
                } else {
                    setErrorMessage(res.data?.message || "Invalid or expired invitation token.")
                }
            })
            .catch((err) => {
                setErrorMessage(err?.response?.data?.message || err?.message || "Could not verify invitation.")
            })
            .finally(() => {
                setVerifying(false)
                setLoading(false)
            })
    }, [token])

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!password || password.length < 8) {
            toast({
                title: "Password too short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            })
            return
        }

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please make sure your passwords match.",
                variant: "destructive",
            })
            return
        }

        setSubmitting(true)
        try {
            const { data: res } = await API.acceptInvitation({
                token,
                password,
                name: name.trim() || undefined,
            })

            if (res?.success) {
                setAcceptedAccount(res.result?.account)
                toast({
                    title: "Welcome aboard!",
                    description: "Your organization account has been created successfully.",
                })
            } else {
                throw new Error(res?.message || "Failed to accept invitation")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to complete setup",
                variant: "destructive",
            })
        } finally {
            setSubmitting(false)
        }
    }

    if (verifying || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Verifying invitation link...</p>
                </div>
            </div>
        )
    }

    if (errorMessage || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <Card className="max-w-md w-full text-center shadow-lg border">
                    <CardHeader className="space-y-2">
                        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">Invitation Unavailable</CardTitle>
                        <CardDescription>
                            {errorMessage || "This invitation link is invalid, expired, or has already been accepted."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full" asChild>
                            <Link href="/">Back to Airsend Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (acceptedAccount) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
                <Card className="max-w-lg w-full shadow-lg border text-center">
                    <CardHeader className="space-y-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">You're All Set!</CardTitle>
                        <CardDescription>
                            You have successfully joined <strong>{invitation.org_name}</strong>.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border text-left space-y-2">
                            <div className="text-xs text-muted-foreground">Your Provisioned Mailbox:</div>
                            <div className="font-mono text-sm font-semibold text-primary break-all">
                                {acceptedAccount.email}
                            </div>
                            <div className="text-xs text-muted-foreground pt-1 border-t">
                                Connected to external email: <strong>{invitation.email}</strong>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            You can now log in using either your original email (
                            <strong>{invitation.email}</strong>) or your provisioned organization
                            email.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button className="flex-1 gap-2" asChild>
                                <Link href="/v2/u/mail">
                                    Open Webmail & Workspace <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
            <Card className="max-w-lg w-full shadow-xl border">
                <CardHeader className="space-y-2 text-center pb-4 border-b">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto flex items-center justify-center mb-1">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold">
                        Join {invitation.org_name}
                    </CardTitle>
                    <CardDescription>
                        You were invited as an external collaborator under{" "}
                        <span className="font-semibold text-foreground">@{invitation.domain_name}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                    {/* Invitation Summary Card */}
                    <div className="p-4 rounded-lg bg-muted/50 border space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Invited Email:</span>
                            <span className="font-semibold text-foreground">{invitation.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Assigned Role:</span>
                            <Badge variant="secondary" className="capitalize text-[11px]">
                                {invitation.role}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Domain:</span>
                            <span className="font-mono">{invitation.domain_name}</span>
                        </div>
                        <div className="pt-2 border-t flex flex-wrap items-center gap-1">
                            <span className="text-muted-foreground mr-1">Feature Scopes:</span>
                            {(invitation.scopes || []).map((s) => (
                                <span
                                    key={s}
                                    className="px-1.5 py-0.5 rounded text-[10px] bg-background border font-mono font-medium"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Setup Form */}
                    <form onSubmit={handleAccept} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs">Your Display Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs">Set Your Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground pt-1">
                            By accepting, an external mailbox will be provisioned in the format{" "}
                            <code className="font-mono text-foreground font-semibold">
                                ext.{invitation.org_slug}.[id].{invitation.email.split("@")[0]}@{invitation.domain_name}
                            </code>
                            .
                        </p>

                        <Button type="submit" disabled={submitting} className="w-full gap-2">
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Setting Up Your Account...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" /> Accept Invitation & Join
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
