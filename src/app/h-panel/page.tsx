'use client'

import { Button } from "@/components/ui/button"
import React, { Suspense, useState } from "react"
import { API } from "@/lib/api/handler"
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/common/spinner"
import { useAppDispatch } from "@/store/hooks"
import { setLogin } from "@/store/slices/account/admin"
import Cookies from "js-cookie"

import Link from "next/link"
import { FavIcon } from "@/components/logo-image"
import { __config } from "@/constants/config"

export default function LoginPage() {
    return (
        <Suspense fallback={<Spinner />}>
            <LoginContent />
        </Suspense>
    )
}

function LoginContent() {
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()

    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [loadingText, setLoadingText] = useState("Authenticating")
    const { toast } = useToast()
    const handleGoogleLogin = async () => {
        try {
            const { data } = await API.handleGoogleLogin()
            if (!data.success) {
                throw new Error(data.message)
            }
            window.location.href = data.result
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong. Please try again later.",
            })
        }
    }
    React.useEffect(() => {
        const texts = [
            "Authenticating",
            "Verifying credentials",
            "Connecting to Google",
            "Almost there"
        ];

        if (isLoading) {
            let index = 0;
            setLoadingText(texts[index]); // show first immediately

            const interval = setInterval(() => {
                index += 1;
                if (index < texts.length) {
                    setLoadingText(texts[index]);
                } else {
                    clearInterval(interval); // stop when done
                }
            }, 1500);

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    React.useEffect(() => {
        if (searchParams.has("code") && searchParams.get("code")?.trim() !== "") {
            setIsLoading(true)
            API.handleGoogleCallback(searchParams.get("code")!).then(({ data }) => {
                if (!data.success) {
                    throw new Error(data.message)
                }

                if (data.result?.admin_access_token) {
                    Cookies.set("admin_access_token", data.result.admin_access_token, { expires: 90, path: "/" });
                    if (typeof window !== "undefined") {
                        localStorage.setItem("admin_access_token", data.result.admin_access_token);
                    }
                }

                dispatch(setLogin({ user: data.result.user, token: data.result.admin_access_token }))

                router.push("/h-panel/dashboard")
            }).catch((error) => {
                console.log(error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Something went wrong. Please try again later.",
                })
                setIsLoading(false)
            })
        }
    }, [])
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm rounded-xl border border-border/70 bg-card p-8 text-card-foreground">
                <div className="flex flex-col items-center text-center">
                    <FavIcon w={48} />
                    {isLoading ? (
                        <div className="mt-6 flex flex-col items-center gap-3" role="status" aria-live="polite">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <h1 className="text-lg font-medium">{loadingText}</h1>
                            <p className="text-sm text-muted-foreground">Please wait while we verify your credentials</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="mt-6 text-xl font-medium tracking-tight">Welcome back</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Sign in to the AirSend admin panel</p>

                            <Button
                                variant="outline"
                                className="mt-6 h-10 w-full gap-2"
                                disabled={isLoading}
                                onClick={handleGoogleLogin}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                    <path
                                        fill="currentColor"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="currentColor"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </Button>

                            <p className="mt-6 text-xs text-muted-foreground">
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</Link>.
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
