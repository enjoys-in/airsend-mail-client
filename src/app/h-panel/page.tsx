'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { Suspense, useState } from "react"
import { API } from "@/lib/api/handler"
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Spinner } from "@/components/common/spinner"
import { useAppDispatch } from "@/store/hooks"
import { setLogin } from "@/store/slices/account/admin"

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
            <div className="min-h-screen dark bg-gradient-to-br from-teal-900 via-slate-900 to-orange-900 flex items-center justify-center p-4">
                {isLoading ? (
                    <Spinner >
                        <div className="flex flex-col items-center mb-4">
                            <div className="mb-4 rounded-full">
                                <FavIcon w={128} />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">{loadingText}</h1>
                            <p className="text-sm text-muted-foreground">Please wait while we verify your credentials</p>

                        </div>
                    </Spinner>
                ) :

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-sm"
                    >

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="mb-8 text-center"
                        >
                            <div className="flex flex-col items-center mb-4">
                                <div className="mb-4 rounded-full">
                                    <FavIcon w={128} />
                                </div>
                                <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                                <p className="text-gray-400">Sign in to continue your journey</p>
                            </div>

                        </motion.div>

                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-6"
                        >
                            {/* <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <motion.div
                            whileTap={{ scale: 0.995 }}
                        >
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                        </motion.div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <motion.div
                            whileTap={{ scale: 0.995 }}
                        >
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            />
                        </motion.div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button className="w-full bg-gradient-to-r from-teal-500 to-orange-500 text-white hover:opacity-90 transition-opacity">
                            Sign In
                        </Button>
                    </motion.div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#000B1D] px-2 text-gray-400">Or continue with</span>
                        </div>
                    </div> */}

                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white rounded-none hover:bg-white/20" disabled={isLoading} onClick={handleGoogleLogin}>
                                    {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                                    </svg>}

                                    Continue with Google
                                </Button>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center text-sm text-gray-400"
                            >
                                By signing in, you agree to our{" "}
                                <Link href="/terms" className="underline hover:text-white">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy-policy" className="underline hover:text-white">Privacy Policy</Link>
                            </motion.p>
                        </motion.div>
                    </motion.div>}

            </div>
    )
}

