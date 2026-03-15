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

export default function SmtpCodesDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          SMTP Response Codes
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Complete reference of SMTP status codes returned by mail servers. These codes appear in
          your email logs and help diagnose delivery issues.
        </p>
      </div>

      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            SMTP response codes follow a three-digit format. The first digit indicates the class:
            <strong> 2xx</strong> = success, <strong> 3xx</strong> = intermediate, <strong> 4xx</strong> = temporary failure,
            <strong> 5xx</strong> = permanent failure. Enhanced status codes (e.g., 5.1.1) provide more specific details.
          </p>
        </CardContent>
      </Card>

      {/* 2xx Success */}
      <section id="2xx" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 mr-2">2xx</Badge>
          Success Codes
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          These codes indicate the mail server accepted the command or message.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">211</TableCell>
                  <TableCell>System status</TableCell>
                  <TableCell>System status or help reply</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">214</TableCell>
                  <TableCell>Help message</TableCell>
                  <TableCell>Help message from the server</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">220</TableCell>
                  <TableCell>Service ready</TableCell>
                  <TableCell>The mail server is ready to accept connections</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">221</TableCell>
                  <TableCell>Closing connection</TableCell>
                  <TableCell>The server is closing the SMTP session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">235</TableCell>
                  <TableCell>Authentication successful</TableCell>
                  <TableCell>SMTP authentication was accepted</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">250</TableCell>
                  <TableCell>OK</TableCell>
                  <TableCell>The requested action was completed successfully. Message accepted for delivery.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">251</TableCell>
                  <TableCell>User not local</TableCell>
                  <TableCell>The recipient is not local but the server will forward the message</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">252</TableCell>
                  <TableCell>Cannot verify user</TableCell>
                  <TableCell>The server cannot verify the user but will accept and attempt delivery</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 4xx Temporary */}
      <section id="4xx" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 mr-2">4xx</Badge>
          Temporary Failure Codes
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          These codes indicate a temporary problem. The sending server should retry the message later.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">421</TableCell>
                  <TableCell>Service not available</TableCell>
                  <TableCell>The server is temporarily unavailable or closing the connection. Often due to too many connections.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">450</TableCell>
                  <TableCell>Mailbox unavailable</TableCell>
                  <TableCell>The recipient&apos;s mailbox is temporarily unavailable (busy or locked by another process).</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">451</TableCell>
                  <TableCell>Local error</TableCell>
                  <TableCell>The server encountered a local processing error. The message should be retried.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">452</TableCell>
                  <TableCell>Insufficient storage</TableCell>
                  <TableCell>The server has run out of storage space or the recipient&apos;s mailbox is full.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">455</TableCell>
                  <TableCell>Server unable to accommodate</TableCell>
                  <TableCell>The server cannot process the parameters at this time. Retry later.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Enhanced 4xx Codes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">421 4.3.0</TableCell>
                  <TableCell>Mail server temporarily rejected message — too many messages or connections</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">421 4.7.0</TableCell>
                  <TableCell>Connection rate limited — too many connections from your IP</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">450 4.1.8</TableCell>
                  <TableCell>Sender rejected — bad reputation for your IP or domain</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">450 4.2.1</TableCell>
                  <TableCell>Recipient has disabled their mailbox</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">452 4.2.2</TableCell>
                  <TableCell>Recipient mailbox is over quota (full)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">451 4.7.1</TableCell>
                  <TableCell>Greylisting — try again in a few minutes</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* 5xx Permanent */}
      <section id="5xx" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          <Badge variant="destructive" className="mr-2">5xx</Badge>
          Permanent Failure Codes
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          These codes indicate a permanent error. The message should not be retried to the same recipient without changes.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">500</TableCell>
                  <TableCell>Syntax error</TableCell>
                  <TableCell>The command was not recognized or has a syntax error</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">501</TableCell>
                  <TableCell>Parameter error</TableCell>
                  <TableCell>Syntax error in the command parameters or arguments</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">502</TableCell>
                  <TableCell>Command not implemented</TableCell>
                  <TableCell>The server does not support this command</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">503</TableCell>
                  <TableCell>Bad sequence</TableCell>
                  <TableCell>Commands were sent in the wrong order</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">504</TableCell>
                  <TableCell>Parameter not implemented</TableCell>
                  <TableCell>A command parameter is not implemented on this server</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550</TableCell>
                  <TableCell>Mailbox unavailable</TableCell>
                  <TableCell>The recipient&apos;s mailbox does not exist or email was rejected by policy</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">551</TableCell>
                  <TableCell>User not local</TableCell>
                  <TableCell>The recipient is not local to this server and forwarding is not allowed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">552</TableCell>
                  <TableCell>Storage exceeded</TableCell>
                  <TableCell>The message exceeds the allocaed storage for the mailbox</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">553</TableCell>
                  <TableCell>Mailbox name invalid</TableCell>
                  <TableCell>The recipient address format is invalid</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">554</TableCell>
                  <TableCell>Transaction failed</TableCell>
                  <TableCell>General rejection — can be content, authentication, or policy related</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">Enhanced 5xx Codes</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Code</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.1.1</TableCell>
                  <TableCell>Recipient address does not exist</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.1.2</TableCell>
                  <TableCell>Recipient domain does not exist</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.4.1</TableCell>
                  <TableCell>Recipient address rejected — no relay allowed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.7.1</TableCell>
                  <TableCell>Message rejected due to policy (SPF/DKIM/DMARC failure or blocked)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.7.25</TableCell>
                  <TableCell>PTR record for sending IP not found</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">550 5.7.26</TableCell>
                  <TableCell>Email failed SPF or DMARC authentication</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">553 5.1.3</TableCell>
                  <TableCell>Invalid email address format</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">554 5.7.5</TableCell>
                  <TableCell>Cryptographic failure (DKIM verification error)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">554 5.7.9</TableCell>
                  <TableCell>DKIM signature verification failed</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">556 5.1.10</TableCell>
                  <TableCell>Recipient address has null MX — domain does not accept email</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
