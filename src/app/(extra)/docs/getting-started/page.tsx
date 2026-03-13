"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { BookOpen, Code, FileJson, Terminal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { __config } from "@/constants/config"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { toast as sonner } from "sonner"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import StickyNote from "@/app/h-panel/(home)/api/_components/StickyNote"

export default function ApiDocs() {
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
      const newt = {
        ...response,
        ["/client/send"]: data
      }
      setResponse(newt)

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
    <div className="flex">
      <div className="flex-1 md:p-6 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl text-netural-800 dark:text-gray-200 md:text-3xl font-bold">Authorization</h1>
              <Badge variant="secondary" className="bg-orange-500 text-netural-500 dark:text-gray-200">Beta</Badge>
            </div>

            <Alert variant={"destructive"}>
              <AlertTitle className="text-orange-500 text-2xl"><strong>Warning</strong></AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                <ul className="list-disc px-4">
                  <li>At Somepoint api may fails.</li>
                  <li>Rate Limit may apply (for <code> Get Mails</code>, its 10/minute, for<code> Sending Mails</code>, its 3/minute )</li>
                  <li>Use Socket for Realtime Updates/Receiving Mails</li>
                  <li>This feature is in beta and may not be stable. Use at your own risk.</li>
                  <li> To prevent further damage, do not share your API credentials with anyone.</li>
                </ul>
              </AlertDescription>
            </Alert>
            <p className="text-muted-foreground">
              Please enter your API credentials to get started.
            </p>
            <div className="space-y-2">
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
                  setSelectedValue({
                    ...selectedValue,
                    api_secret: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl text-netural-800 dark:text-gray-200  md:text-2xl">Get Mails <Badge>Upcoming</Badge></h1>
            <p className="text-muted-foreground">
              Get all users connected to your application
            </p>
          </div>

          <Card className="rounded-none">
            <CardHeader className="flex flex-col  sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md text-sm font-medium">
                    GET
                  </span>
                  <code className="text-sm">{selectedValue.api_url}/client/get</code>
                </div>
              </div>
              <Button variant="default" className="rounded-none"
                // onClick={() => handleSendButton("get_mail")}
                disabled>Send</Button>
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
                <h2 className="text-xl font-semibold">Query Parameters</h2>
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
                        defines your place in the list. For instance, if you make a list request
                        and receive 100 objects, ending with <code>aaa</code>, your subsequent call
                        can include <code>starting_after = aaa</code> in order to fetch the next
                        page of the list.
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium text-muted-foreground">end</TableCell>
                      <TableCell>string</TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">
                          A cursor for use in pagination. <code>ending_before</code> is an object ID that
                          defines your place in the list. For instance, if you make a list request
                          and receive 100 objects, starting with <code>aaa</code>, your subsequent call
                          can include <code>ending_before = aaa</code> in order to fetch the previous
                          page of the list.
                        </p>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  Real-Time Mail Recieving  Via Sockets
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">URL: https://api.AirSend.com/mail</Button>
                    <Button variant="outline" size="sm">Event: @@NEW_MAIL_RECEIVED</Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">Response</h2>

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
          <div className="space-y-1">
            <h1 className="text-2xl text-netural-800 dark:text-gray-200  md:text-2xl">Send Mail</h1>
            <p className="text-muted-foreground">
              Send an email
            </p>
          </div>

          <Card className="rounded-none">
            <CardHeader className="flex flex-col  sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-0.5 rounded-md text-sm font-medium">
                    POST
                  </span>
                  <code className="text-sm">{selectedValue.api_url}/client/send</code>
                </div>
              </div>
              <Button variant="default" className="rounded-none" onClick={() => handleSendButton("send_mail")}>Send</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Body</label>
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Mail From"
                    name="from"
                    className="w-full rounded-none outline-none focus:outline-none"
                    onChange={handleBodyInputChange}
                  />
                  <Input
                    type="text"
                    placeholder="Subject"
                    name="subject"

                    className="w-full rounded-none outline-none focus:outline-none"
                    onChange={handleBodyInputChange}
                  />
                  <Input
                    type="to"
                    placeholder="Recipients (multiple recipients should be comma separated)"
                    name="to"

                    className="w-full rounded-none outline-none focus:outline-none"
                    onChange={handleBodyInputChange}
                  />
                  <Textarea
                    rows={4}
                    name="html"
                    placeholder="Message..."
                    className="w-full rounded-none outline-none focus:outline-none"
                    onChange={handleBodyInputChange}

                  />

                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold">Response</h2>
                </div>
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
      </div>
      <StickyNote />
    </div>
  )
}
const Sidebar = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 px-2">
      <FileJson className="h-6 w-6" />
      <h2 className="text-lg font-semibold">AirSend</h2>
    </div>

    <div className="space-y-1">
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-md cursor-pointer">
        <Terminal className="h-4 w-4" />
        <span>Quickstart</span>
      </div>
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-md cursor-pointer">
        <Code className="h-4 w-4" />
        <span>Development</span>
      </div>
      <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent rounded-md cursor-pointer">
        <BookOpen className="h-4 w-4" />
        <span>Global Settings</span>
      </div>
    </div>

    <div className="space-y-2">
      <h3 className="px-2 text-sm font-medium">API Reference</h3>
      <div className="space-y-1">
        <Button variant="ghost" className="w-full justify-start text-primary">
          User Routes
        </Button>
      </div>
    </div>
  </div>
)