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
import { Info } from "lucide-react"
import Link from "next/link"

export default function ErrorMessagesDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Error Messages
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Understand common error messages from email servers and learn how to resolve them.
          These errors appear in your email logs and bounce notifications.
        </p>
      </div>

      {/* Common Errors */}
      <section id="common-errors" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Common Email Server Errors</h2>

        <div className="space-y-4">
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">550 5.1.1</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">User Unknown / Mailbox Not Found</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The recipient email address does not exist on the destination mail server.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Verify the recipient address is correct. Remove invalid addresses from your mailing list.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">550 5.7.1</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Message Rejected / Relay Denied</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The receiving server refused to accept the message. This can be due to authentication failure, blacklisting, or policy restrictions.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Check that your SPF, DKIM, and DMARC records are correctly configured. Verify your IP is not blacklisted.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">550 5.7.25</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">PTR Record Not Found</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The sending IP address does not have a valid PTR (reverse DNS) record.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Contact your hosting provider and request a PTR record for your server IP pointing to your mail hostname. See the <Link href="/docs/dns-records#ptr" className="text-blue-600 dark:text-blue-400 underline">PTR Record</Link> documentation.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">550 5.7.26</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">SPF / DMARC Authentication Failed</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The email failed SPF or DMARC validation. The sending server is not authorized to send email for the domain.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Ensure your SPF record includes Airsend and all other sending services. Check your DMARC policy. See <Link href="/docs/dns-records#spf" className="text-blue-600 dark:text-blue-400 underline">SPF</Link> and <Link href="/docs/dns-records#dmarc" className="text-blue-600 dark:text-blue-400 underline">DMARC</Link> docs.</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">452 4.2.2</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Mailbox Full</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The recipient&apos;s mailbox has reached its storage quota and cannot accept new messages.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> This is a temporary issue. The system will retry delivery. If the bounce persists over several days, the recipient needs to clear their mailbox.</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">421 4.7.0</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Too Many Connections / Rate Limited</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The receiving server is temporarily refusing connections due to too many simultaneous connections or excessive sending rate from your IP.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Reduce sending rate. Spread email sends over time. Airsend handles rate management automatically, but very large lists may trigger this.</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 dark:border-yellow-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">450 4.1.8</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Sender Rejected — Bad Reputation</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The receiving server rejected the email because of poor sender reputation for your IP or domain.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Check your domain and IP reputation using Google Postmaster Tools or the Airsend dashboard. Warm up slowly and fix any authentication issues.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">553 5.1.3</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Invalid Address Format</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The recipient email address has an invalid format (e.g., missing @ symbol, invalid characters).
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Verify the email address format. Ensure there are no extra spaces or special characters.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">554 5.7.9</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">DKIM Signature Verification Failed</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The DKIM signature on the email could not be verified by the receiving server. The message may have been altered in transit, or the DKIM record is incorrect.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Verify your DKIM DNS record matches the public key shown in your Airsend dashboard. Check for extra spaces or missing characters. See <Link href="/docs/dns-records#dkim" className="text-blue-600 dark:text-blue-400 underline">DKIM docs</Link>.</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="pt-6 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="destructive">550 5.4.1</Badge>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Recipient Domain Not Found</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                The domain in the recipient&apos;s email address does not exist or does not have valid MX records.
              </p>
              <p className="text-sm text-neutral-500"><strong>Fix:</strong> Verify the recipient&apos;s domain is correct and has active MX records.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bounce Types */}
      <section id="bounce-types" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Bounce Classification</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Email bounces are classified by severity and cause. Understanding the classification helps determine the appropriate action.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Code Range</TableHead>
                  <TableHead>Examples</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Hard Bounce</TableCell>
                  <TableCell>5.1.x</TableCell>
                  <TableCell>Invalid address, domain not found</TableCell>
                  <TableCell>Remove address immediately</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Soft Bounce</TableCell>
                  <TableCell>4.2.x</TableCell>
                  <TableCell>Mailbox full, server unavailable</TableCell>
                  <TableCell>Retry; remove after 3–5 failures</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Policy Bounce</TableCell>
                  <TableCell>5.7.x</TableCell>
                  <TableCell>Auth failure, blacklisted, content rejected</TableCell>
                  <TableCell>Fix authentication or content issues</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Technical Bounce</TableCell>
                  <TableCell>4.4.x, 5.4.x</TableCell>
                  <TableCell>DNS failure, routing error, no MX record</TableCell>
                  <TableCell>Check recipient domain; may be temporary</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Automatic Bounce Handling</AlertTitle>
          <AlertDescription>
            Airsend automatically processes bounces and adds hard-bounced addresses to a suppression list.
            These addresses will not receive future emails to protect your sender reputation.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  )
}
