"use client"

import type React from "react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"
import { LogoImage } from "@/components/logo-image"
import { useRouter } from "next/navigation"

import { setCurrAccount } from "@/store/slices/account"
import { useAppDispatch } from "@/store/hooks"
import Link from "next/link"
import { Security } from "@/lib/security"
const s = new Security()
export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const { toast } = useToast()
    const dispatch = useAppDispatch()
    const [email, setEmail] = useState("")

    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isLoading) return
        if (!email || !password) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)

        try {
            // Make API call
            const { data } = await API.handleLogin({
                email,
                password: s.encryptAES(password)
            })
            if (!data.success) {
                setIsLoading(false);
                toast({
                    title: "Authentication Failed",
                    description: data.message,
                    variant: "destructive",
                })
                return;
            }

            dispatch(setCurrAccount(data.result))

            toast({
                title: "Success",
                description: "You have been logged in successfully", duration: 2000
            })
            
            router.push("/v2/u/mail/inbox")
        } catch (error) {
            setIsLoading(false);
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {

        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex  items-center justify-center rounded-md">
                            <LogoImage />
                        </div>
                        <h1 className="text-xl font-bold dark:text-gray-50">Welcome</h1>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                className="rounded-none"

                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                className="rounded-none"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full rounded-none" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                </div>
            </form>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
                By clicking continue, you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.
            </div>


        </div>
    )
}
