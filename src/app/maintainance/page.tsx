import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Cog } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="w-20 h-20 mb-4">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Site Logo" />
            <AvatarFallback>
              <Cog className="w-10 h-10" />
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl font-bold text-center">We're Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600 mb-4">
            We're currently performing some scheduled maintenance. We'll be back up and running as soon as possible.
            Thank you for your patience!
          </p>
          <div className="text-sm text-gray-500 text-center">
            Estimated completion time: <span className="font-semibold">Monday 24th, 2025</span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button>Check Status</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

