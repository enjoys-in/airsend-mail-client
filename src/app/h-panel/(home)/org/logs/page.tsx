import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const logs = [
  {
    id: 1,
    timestamp: "2024-01-15 10:30:25",
    level: "INFO",
    message: "User admin@acme.com logged in successfully",
    source: "AUTH",
  },
  {
    id: 2,
    timestamp: "2024-01-15 10:28:15",
    level: "WARN",
    message: "Failed login attempt for user@acme.com",
    source: "AUTH",
  },
  {
    id: 3,
    timestamp: "2024-01-15 10:25:10",
    level: "ERROR",
    message: "Database connection timeout",
    source: "DATABASE",
  },
  {
    id: 4,
    timestamp: "2024-01-15 10:20:05",
    level: "INFO",
    message: "Organization ORG001 settings updated",
    source: "SYSTEM",
  },
]

export default function LogsPage() {
  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
       
        <h1 className="text-lg font-semibold">System Logs</h1>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Badge
                      variant={log.level === "ERROR" ? "destructive" : log.level === "WARN" ? "secondary" : "default"}
                    >
                      {log.level}
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{log.message}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{log.timestamp}</span>
                        <span>Source: {log.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
