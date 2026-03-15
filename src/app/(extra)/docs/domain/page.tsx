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

export default function DomainDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Domain Setup
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Add your custom domain to Airsend and configure it for reliable email sending and receiving.
        </p>
      </div>

      {/* Add Domain */}
      <section id="add-domain" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Add a Domain</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Before you can send or receive emails with your custom domain, you need to add it to your Airsend workspace.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Prerequisites</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>You must own the domain or have administrative access to its DNS settings</li>
              <li>The domain must not already be registered with another Airsend workspace</li>
              <li>You need access to your domain registrar or DNS provider (e.g., Cloudflare, GoDaddy, Namecheap)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Steps to Add a Domain</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Go to <strong>Settings → Domains</strong> in your workspace dashboard</li>
              <li>Click <Badge variant="outline">Add Domain</Badge></li>
              <li>Enter your domain name (e.g., <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">yourdomain.com</code>)</li>
              <li>Airsend will generate the required DNS records for you</li>
              <li>Add these DNS records to your domain registrar (see DNS Records section)</li>
              <li>Click <Badge variant="outline">Verify Domain</Badge> once records are set up</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* Verify Domain */}
      <section id="verify-domain" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Verify Domain</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Domain verification confirms that you own the domain and have properly configured all required DNS records.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Required DNS Records</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              You must configure the following records for full domain verification:
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">MX</TableCell>
                  <TableCell>MX</TableCell>
                  <TableCell>Routes incoming email to Airsend servers</TableCell>
                  <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Required</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">SPF</TableCell>
                  <TableCell>TXT</TableCell>
                  <TableCell>Authorizes Airsend to send email on your behalf</TableCell>
                  <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Required</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DKIM</TableCell>
                  <TableCell>TXT</TableCell>
                  <TableCell>Cryptographically signs outgoing emails</TableCell>
                  <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Required</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">DMARC</TableCell>
                  <TableCell>TXT</TableCell>
                  <TableCell>Sets policy for failed authentication</TableCell>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Recommended</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">PTR</TableCell>
                  <TableCell>PTR</TableCell>
                  <TableCell>Reverse DNS for IP verification</TableCell>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Recommended</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>DNS Propagation</AlertTitle>
          <AlertDescription>
            DNS changes can take up to 48 hours to propagate worldwide. If verification fails, wait a few hours and try again. You can use online DNS lookup tools to check if your records have propagated.
          </AlertDescription>
        </Alert>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Verification Status</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Meaning</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Verified</Badge></TableCell>
                  <TableCell>All required DNS records are correctly configured</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">Pending</Badge></TableCell>
                  <TableCell>DNS records found but still propagating or partially configured</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">Failed</Badge></TableCell>
                  <TableCell>One or more required DNS records are missing or incorrect</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Domain Settings */}
      <section id="domain-settings" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Domain Settings</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Once your domain is verified, you can configure additional settings to customize your email experience.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Available Settings</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><strong>Catch-all address</strong> — Route emails sent to non-existent addresses to a specific mailbox</li>
              <li><strong>Default signature</strong> — Set a default email signature for all users on this domain</li>
              <li><strong>Sending limits</strong> — Configure daily and hourly sending limits</li>
              <li><strong>Email aliases</strong> — Create aliases that forward to other addresses</li>
              <li><strong>Auto-reply</strong> — Set up automatic responses for incoming emails</li>
              <li><strong>Mail forwarding</strong> — Forward all incoming mail to an external address</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
