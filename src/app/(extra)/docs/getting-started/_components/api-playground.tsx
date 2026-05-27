"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { __config } from "@/constants/config"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { toast as sonner } from "sonner"
import axios from "axios"
import { Badge } from "@/components/ui/badge"

export default function ApiPlayground() {
  const [selectedValue, setSelectedValue] = useState({
    api_key: "",
    api_secret: "",
    api_url: __config.APP.API_URL,
  })
  const [body, setBody] = useState({
    from: "",
    to: "",
    subject: "",
    html: "",
  })
  const [response, setResponse] = useState({
    "/client/get": {},
    "/client/send": {},
  })
  const handleBodyInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setBody((prevBody) => ({
      ...prevBody,
      [name]: value,
    }));
  }
  const handleSendButton = (type: "get_mail" | "send_mail") => {
    switch (type) {
      case "get_mail":
        fetchMails()
        break;
      case "send_mail":
        sendMails()
        break;
      default:
        break;
    }
  }
  const fetchMails = async () => {
    try {
      const { data } = await axios.get(`${__config.APP.API_URL}/client/get`, {
        headers: {
          client_key: selectedValue.api_key,
          client_secret: selectedValue.api_secret,
          "Content-Type": "application/json",
        },
        withCredentials: true
      })
      if (!data.success) {
        throw new Error(data.message)
      }
      setResponse((prev) => ({ ...prev, ["/client/get"]: data }))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }
  const sendMails = async () => {
    try {
      const { data } = await axios.post(`${__config.APP.API_URL}/client/send`, body, {
        headers: {
          client_key: selectedValue.api_key,
          client_secret: selectedValue.api_secret,
          "Content-Type": "application/json",
        },
        withCredentials: true
      })
      if (!data.success) {
        throw new Error(data.message)
      }
      setResponse((prev) => ({ ...prev, ["/client/send"]: data }))
    } catch (error: any) {
      if (error.message.includes("422")) {
        error.response.data.result.forEach((item: any) => {
          sonner.error(item, {
            className: "bg-red-500 text-white",
          })
        })
        return
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Credentials */}
      <div className="space-y-2">
        <p className="text-muted-foreground">
          Please enter your API credentials to get started.
        </p>
        <Input
          type="text"
          placeholder="API Key"
          className="w-full rounded-none outline-none focus:outline-none"
          onChange={(e) =>
            setSelectedValue({ ...selectedValue, api_key: e.target.value })
          }
        />
        <Input
          type="password"
          placeholder="API Secret"
          className="w-full rounded-none outline-none focus:outline-none"
          onChange={(e) =>
            setSelectedValue({ ...selectedValue, api_secret: e.target.value })
          }
        />
      </div>

      {/* Get Mails */}
      <div className="space-y-1">
        <h2 className="text-2xl text-neutral-800 dark:text-gray-200 md:text-2xl">Get Mails <Badge>Upcoming</Badge></h2>
        <p className="text-muted-foreground">Get all users connected to your application</p>
      </div>

      <Card className="rounded-none">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md text-sm font-medium">GET</span>
              <code className="text-sm">{selectedValue.api_url}/client/get</code>
            </div>
          </div>
          <Button variant="default" className="rounded-none" disabled>Send</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Query</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select query parameters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="offset">Offset</SelectItem>
                <SelectItem value="sort">Sort</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Query Parameters</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">order_by</TableCell>
                  <TableCell className="text-sm text-muted-foreground">string</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    The field to order the results by. Use either <code>ASC</code> or <code>DEC</code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">limit</TableCell>
                  <TableCell className="text-sm text-muted-foreground">number</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Limit the number of items to return.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">offset</TableCell>
                  <TableCell className="text-sm text-muted-foreground">number</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Number of items to skip before starting to collect the result set.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">sort</TableCell>
                  <TableCell className="text-sm text-muted-foreground">string</TableCell>
                  <TableCell className="text-sm text-muted-foreground">Comma-separated list of attributes to sort by.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">start</TableCell>
                  <TableCell className="text-sm text-muted-foreground">string</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    A cursor for use in pagination. <code>starting_after</code> is an object ID that
                    defines your place in the list.
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">end</TableCell>
                  <TableCell className="text-sm text-muted-foreground">string</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    A cursor for use in pagination. <code>ending_before</code> is an object ID that
                    defines your place in the list.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              Real-Time Mail Receiving Via Sockets
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">URL: https://api.AirSend.com/mail</Button>
                <Button variant="outline" size="sm">Event: @@NEW_MAIL_RECEIVED</Button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-xl font-semibold">Response</h3>
            </div>
            <Card className="bg-zinc-950">
              <CardContent className="pt-6 overflow-x-auto">
                <pre className="text-sm text-green-400 whitespace-pre">
                  {JSON.stringify(response["/client/get"], null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Send Mail */}
      <div className="space-y-1">
        <h2 className="text-2xl text-neutral-800 dark:text-gray-200 md:text-2xl">Send Mail</h2>
        <p className="text-muted-foreground">Send an email</p>
      </div>

      <Card className="rounded-none">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md text-sm font-medium">POST</span>
              <code className="text-sm">{selectedValue.api_url}/client/send</code>
            </div>
          </div>
          <Button variant="default" className="rounded-none" onClick={() => handleSendButton("send_mail")}>Send</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Body</label>
            <div className="space-y-2">
              <Input type="text" placeholder="Mail From" name="from" className="w-full rounded-none" onChange={handleBodyInputChange} />
              <Input type="text" placeholder="Subject" name="subject" className="w-full rounded-none" onChange={handleBodyInputChange} />
              <Input type="text" placeholder="Recipients (comma separated)" name="to" className="w-full rounded-none" onChange={handleBodyInputChange} />
              <Textarea rows={4} name="html" placeholder="Message..." className="w-full rounded-none" onChange={handleBodyInputChange} />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Response</h3>
            <Card className="bg-zinc-950">
              <CardContent className="pt-6 overflow-x-auto">
                <pre className="text-sm text-green-400 whitespace-pre">
                  {JSON.stringify(response["/client/send"], null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
