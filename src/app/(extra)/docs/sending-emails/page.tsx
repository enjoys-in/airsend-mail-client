import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SendingEmailsDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Sending Emails
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Learn how to compose, send, and manage emails using Airsend — both through the web interface and via the API.
        </p>
      </div>

      {/* Requirements */}
      <section id="requirements" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Requirements</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Before you can send emails, ensure the following are in place:
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <ul className="space-y-3">
              {[
                { label: "Verified account", desc: "Your email address must be verified" },
                { label: "Added domain", desc: "At least one custom domain added to your workspace" },
                { label: "Verified domain", desc: "All required DNS records (MX, SPF, DKIM) must be configured and verified" },
                { label: "Active subscription", desc: "An active plan on your workspace (free tier has limited sending)" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Compose & Send */}
      <section id="compose" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Compose & Send</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          You can compose and send emails through the Airsend web interface or programmatically via the API.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Using the Web Interface</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Click the <Badge variant="outline">Compose</Badge> button in your inbox</li>
              <li>Select the <strong>From</strong> address (choose which domain/alias to send from)</li>
              <li>Enter the recipient&apos;s email address in the <strong>To</strong> field</li>
              <li>Add <strong>CC</strong> or <strong>BCC</strong> recipients if needed</li>
              <li>Enter a subject line</li>
              <li>Compose your email using the rich text editor or switch to HTML mode</li>
              <li>Attach files if needed (see Attachments section)</li>
              <li>Click <Badge variant="outline">Send</Badge></li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Using the API</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
              Send emails programmatically using the <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">POST /client/send</code> endpoint.
            </p>
            <pre className="text-sm bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md overflow-x-auto">
              <code>{`POST /client/send
Headers:
  client_key: YOUR_API_KEY
  client_secret: YOUR_API_SECRET
  Content-Type: application/json

Body:
{
  "from": "you@yourdomain.com",
  "to": "recipient@example.com",
  "subject": "Hello from Airsend",
  "html": "<p>This is a test email sent via the Airsend API.</p>"
}`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Required Fields</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">from</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Sender email address (must be a verified domain)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">to</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Recipient email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">subject</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>Email subject line</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">html</code></TableCell>
                  <TableCell>string</TableCell>
                  <TableCell>HTML body of the email</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Attachments */}
      <section id="attachments" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Attachments</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          You can attach files to your emails through both the web interface and the API.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Attachment Limits</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Limit</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Maximum file size</TableCell>
                  <TableCell>25 MB per attachment</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Maximum total size</TableCell>
                  <TableCell>25 MB per email (all attachments combined)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Maximum attachments</TableCell>
                  <TableCell>10 files per email</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Large Files</AlertTitle>
          <AlertDescription>
            For files larger than 25 MB, consider using a file sharing service and including a download link in your email instead.
          </AlertDescription>
        </Alert>
      </section>

      {/* Templates */}
      <section id="templates" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Email Templates</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Save time with reusable email templates. Create templates for common emails like welcome messages,
          notifications, or newsletters.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Creating a Template</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Go to <strong>Settings → Email Templates</strong></li>
              <li>Click <Badge variant="outline">New Template</Badge></li>
              <li>Enter a template name and subject line</li>
              <li>Design your email using the visual editor or HTML</li>
              <li>Use variables like <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{"{{name}}"}</code> for personalization</li>
              <li>Save the template</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Available Variables</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variable</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">{"{{name}}"}</code></TableCell>
                  <TableCell>Recipient&apos;s name</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">{"{{email}}"}</code></TableCell>
                  <TableCell>Recipient&apos;s email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">{"{{date}}"}</code></TableCell>
                  <TableCell>Current date</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">{"{{unsubscribe_url}}"}</code></TableCell>
                  <TableCell>One-click unsubscribe link</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
