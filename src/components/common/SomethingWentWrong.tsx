"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SomethingWentWrong() {
    const [isShaking, setIsShaking] = useState(false)

    const handleRetry = () => {
        setIsShaking(true)
        setTimeout(() => setIsShaking(false), 500)
        // Add your retry logic here
    }

    return (
        <div className="flex items-center justify-center p-4 ">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="border-red-200 bg-slate-300 shadow-lg">
                    <CardHeader className="pb-4">
                        <motion.div
                            animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.5 }}
                            className="flex justify-center"
                        >
                            <div className="rounded-full bg-red-100 p-3">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </motion.div>
                        <CardTitle className="text-center text-2xl font-bold text-gray-800 mt-4">
                            Something Went Wrong
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-gray-600">
                            We apologize for the inconvenience. An error occurred while processing your request.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center pb-6">
                        <Button
                            variant="outline"
                            onClick={handleRetry}
                            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
                        >
                            Try Again
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    )
}

