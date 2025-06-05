"use client"

import type React from "react"
import { useState } from "react"
import { cn, encryptData } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

import { API } from "@/lib/api/handler"
import { LogoImage } from "@/components/logo-image"

import { useRouter } from "next/navigation"
import { useIndexDb } from "@/hooks/useIndexDb"
import { useCacheStorage } from "@/hooks/useCacheStorage"
import Link from "next/link"
import { useAppDispatch } from "@/store/hooks"
import { setCurrAccount } from "@/store/slices/account"


export function UserAuthForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
    const router = useRouter()
    const { toast } = useToast()
    const { airsendDB } = useIndexDb()
    const dispatch = useAppDispatch()

    const [email, setEmail] = useState("")
    const cacheStorage = useCacheStorage()
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
                email: email,
                password: encryptData(password)
            })
            if (!data.success) {
                throw new Error(data.message)
            }

            toast({
                title: "Login Successfull",
                description: "Please Wait,Redirecting...", duration: 1500
            })
            const Data = JSON.stringify(data.result)
            dispatch(setCurrAccount(data.result))
            return router.push("/u/inbox")
        } catch (error) {

            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-xl font-bold dark:text-gray-50">Welcome to</h1>
                        <div className="flex  items-center justify-center rounded-md">
                            <LogoImage />
                        </div>
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
                By clicking continue, you agree to our <Link href="/terms" target="_blank" className="text-blue-500">Terms of Service</Link> and <Link href="/privacy-policy" target="_blank" className="text-blue-500">Privacy Policy</Link>.
            </div>

            <div className="flex items-center dark:text-neutral-200 text-neutral-900">
                New Here?<Link href="/h-panel" className="text-blue-500">&nbsp; Create an Account</Link>
            </div>
        </div>
    )
}

