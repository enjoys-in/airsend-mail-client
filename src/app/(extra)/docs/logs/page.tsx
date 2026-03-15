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

export default function LogsDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Logs
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Monitor all activity in your workspace including email delivery, bounces, and account events.
          Logs help you troubleshoot issues and understand your email performance.
        </p>
      </div>

      {/* Activity Logs */}
      <section id="activity-logs" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Activity Logs</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Activity logs track all account-level actions such as logins, domain changes, and settings modifications.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Tracked Events</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Login</TableCell>
                  <TableCell>User sign-in with IP address and device info</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Domain Added</TableCell>
                  <TableCell>New domain added to the workspace</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Domain Verified</TableCell>
                  <TableCell>Domain DNS verification completed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Settings Changed</TableCell>
                  <TableCell>Workspace or account settings modified</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">API Key Generated</TableCell>
                  <TableCell>New API credentials created</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Member Invited</TableCell>
                  <TableCell>Team member invited to the workspace</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Email Logs */}
      <section id="email-logs" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Email Logs</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Email logs provide detailed information about every email sent and received through your workspace.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Email Status Types</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Delivered</Badge></TableCell>
                  <TableCell>Email was successfully delivered to the recipient&apos;s mail server</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Queued</Badge></TableCell>
                  <TableCell>Email is in the sending queue waiting to be processed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Deferred</Badge></TableCell>
                  <TableCell>Delivery temporarily delayed; the system will retry</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Bounced</Badge></TableCell>
                  <TableCell>Email could not be delivered (see Bounce Logs)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">Spam</Badge></TableCell>
                  <TableCell>Recipient marked the email as spam</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">Dropped</Badge></TableCell>
                  <TableCell>Email was not sent due to policy violation or suppression list</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Log Details</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Each email log entry includes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><strong>Message ID</strong> — Unique identifier for the email</li>
              <li><strong>From / To</strong> — Sender and recipient addresses</li>
              <li><strong>Subject</strong> — Email subject line</li>
              <li><strong>Timestamp</strong> — When the email was sent or received</li>
              <li><strong>Status</strong> — Current delivery status</li>
              <li><strong>SMTP response</strong> — The response code from the receiving server</li>
              <li><strong>Size</strong> — Total email size including attachments</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Bounce Logs */}
      <section id="bounce-logs" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Bounce Logs</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Bounce logs track emails that could not be delivered. Understanding bounce types helps you maintain list hygiene and troubleshoot delivery issues.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Bounce Types</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Hard Bounce</TableCell>
                  <TableCell>Permanent delivery failure (invalid address, domain doesn&apos;t exist)</TableCell>
                  <TableCell>Remove from mailing list immediately</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Soft Bounce</TableCell>
                  <TableCell>Temporary delivery failure (mailbox full, server down)</TableCell>
                  <TableCell>System will retry; remove after multiple failures</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Block Bounce</TableCell>
                  <TableCell>Rejected by receiving server (IP blocked, content filtered)</TableCell>
                  <TableCell>Check reputation and content; contact the ISP if needed</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
