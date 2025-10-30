"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { API } from "@/lib/api/handler"

import { Security } from "@/lib/security"
const s = new Security()
export function ResetPasswordForm({ email }: { email: string }) {
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isRandom, setIsRandom] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)



    const handleSubmit = async () => {
        try {
            setError(null)
            setSuccess(null)
            setLoading(true)
            const { data } = await API.handleResetPassword(email, {
                isRandom,
                user_password: isRandom ? "" : s.encryptAES(newPassword)
            })

            if (!data.success) {
                Array.isArray(data.result) ? setError(data.result.map((item: any) => item.message).join("\n")) : setError(data.message)
                return
            }

            setSuccess("Password updated successfully")
            toast({
                title: "Success",
                description: isRandom
                    ? `Random password sent for ${email}`
                    : "Password updated successfully",
            })

            if (!isRandom) {
                setNewPassword("")
                setConfirmPassword("")
            }
        } catch (err: any) {
            setError(err.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    const handleRandomToggle = async (checked: boolean) => {
        setIsRandom(checked)
        if (checked) {
            await handleSubmit() // auto-submit when random mode enabled
        }
    }

    return (
        <div className="max-w-md space-y-6  ">
            <h2 className="text-xl font-semibold">Reset Password</h2>
            <p className="text-sm text-muted-foreground">
                {isRandom
                    ? "A strong random password will be generated automatically."
                    : "Enter a new password or choose to generate one automatically."}
            </p>

            <div className="flex items-center justify-between">
                <Label htmlFor="random">Generate Random Password</Label>
                <Switch id="random" checked={isRandom} onCheckedChange={handleRandomToggle} />
            </div>

            {!isRandom && (
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                        />
                    </div>
                </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            {!isRandom && (
                <Button
                    onClick={handleSubmit}
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full"
                >
                    {loading ? "Updating..." : "Update Password"}
                </Button>
            )}
        </div>
    )
}
