import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, MessageCircle } from "lucide-react"

export default function ProfileCardComponent({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
      <Popover>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" side="top" align="center">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-0">
              {/* Header with background */}
              <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg">
                <div className="absolute -bottom-8 left-6">
                  <Avatar className="h-16 w-16 ring-4 ring-white">
                    <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Sarah Chen" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                      SC
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Pro
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-10 px-6 pb-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Sarah Chen</h3>
                    <p className="text-sm text-gray-500">@sarahchen</p>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed">
                    Senior Product Designer at TechCorp. Passionate about creating beautiful and functional user
                    experiences. ✨
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">2.4k</span>
                      <span>followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">180</span>
                      <span>following</span>
                    </div>
                  </div>

                  {/* Location and Join Date */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Joined March 2021</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>

      {/* Additional avatars for demo */}
      <div className="ml-8 space-y-4">
        <p className="text-sm text-gray-600 font-medium">Hover over the avatar to see the profile card</p>
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 hover:ring-blue-200 transition-all cursor-pointer">
            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="User 2" />
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-teal-600 text-white">JD</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 hover:ring-blue-200 transition-all cursor-pointer">
            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="User 3" />
            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-rose-600 text-white">MK</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12 ring-2 ring-gray-200 hover:ring-blue-200 transition-all cursor-pointer">
            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="User 4" />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white">AL</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}
