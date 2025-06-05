import * as React from "react"
import serverAxios from '@/lib/api/serverAxios'
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getColor } from "@/lib/utils"
import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import moment from "moment"
export interface Log {
  id: number
  timestamp: string
  type: string
  event: string
  message: string
}

const page = async ({ params }: { params: any }) => {
  const { domain } = await params

  try {
    const { data } = await serverAxios.get(`/api/v1/admin/domain/logs/${domain}`,{
      withCredentials: true
    });
    if (!data.success) {
      throw new Error(data.message)
    }
    return (
      <LogViewer logs={data.result} />
    )
  } catch (error) {
    return (
      <SomethingWentWrong />
    )
  }


}
function LogViewer({ logs }: { logs: Log[] }) {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl text-foreground">All Logs will be displayed here and will be updated in every 1 Minute</h1>
      <ScrollArea className="h-[600px] rounded-md border">
        <Table>
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead className="w-[200px] whitespace-nowrap">Timestamp</TableHead>
              <TableHead className="w-[100px]">Type</TableHead>
              <TableHead className="w-[150px]">Event</TableHead>
              <TableHead>Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-400 ">
            {logs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center">No logs found</TableCell></TableRow>} {logs.map((log) => (
              <TableRow
                key={log.id}
                className="hover:bg-gray-50/50  hover:text-gray-100 transition-colors"
              >
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {moment(log.timestamp).format("YYYY-MM-DD hh:mm:ss A")}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={`${getColor(log.type)} font-medium`}
                  >
                    {log.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium whitespace-nowrap">
                  {log.event}
                </TableCell>
                <TableCell className="font-mono text-sm break-all">
                  {log.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}


export default page