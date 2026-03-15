import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"

export default function DnsRecordsDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          DNS Records
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Configure your DNS records properly to authenticate your emails and ensure reliable delivery.
          All records are essential for email authentication and deliverability.
        </p>
      </div>

      {/* MX Record */}
      <section id="mx" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">MX Record (Mail Exchange)</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          An MX record specifies which mail servers are responsible for receiving email on behalf of your domain.
          When someone sends an email to <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">user@yourdomain.com</code>,
          the sender&apos;s mail server queries DNS for the MX records to determine where to deliver the message.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Configuration</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">MX</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Host</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">@</code> (or yourdomain.com)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Value</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mx.airsend.one</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Priority</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">10</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            MX records must point to a hostname, not an IP address. Ensure the hostname has a valid A record.
            Without MX records, your domain cannot receive email.
          </AlertDescription>
        </Alert>
      </section>

      {/* SPF Record */}
      <section id="spf" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">SPF Record (Sender Policy Framework)</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          SPF allows domain owners to specify which mail servers are authorized to send email on behalf of their domain.
          Without SPF, anyone can forge emails that appear to come from your domain.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Configuration</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">TXT</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Host</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">@</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Value</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">v=spf1 include:spf.airsend.one ~all</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">SPF Policy Qualifiers</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Qualifier</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead>Recommended</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">~all</code></TableCell>
                  <TableCell>Soft fail — accept but mark as suspicious</TableCell>
                  <TableCell>Start with this</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">-all</code></TableCell>
                  <TableCell>Hard fail — reject unauthorized senders</TableCell>
                  <TableCell>After confirming all sources</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">?all</code></TableCell>
                  <TableCell>Neutral — no policy enforced</TableCell>
                  <TableCell>Not recommended</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>One SPF Record Only</AlertTitle>
          <AlertDescription>
            You can only have one SPF record per domain. If you use multiple email providers, combine all includes into a single record.
            SPF also has a 10 DNS lookup limit — exceeding this causes a permanent error.
          </AlertDescription>
        </Alert>

        <Card className="border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Example with Multiple Providers</h3>
            <pre className="text-sm bg-neutral-100 dark:bg-neutral-800 p-4 rounded-md overflow-x-auto">
              <code>v=spf1 include:spf.airsend.one include:_spf.google.com include:servers.mcsv.net ~all</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* DKIM Record */}
      <section id="dkim" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">DKIM Record (DomainKeys Identified Mail)</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          DKIM allows the sender to digitally sign outgoing emails using a private cryptographic key.
          The receiving server retrieves the public key from your DNS and uses it to verify the signature,
          confirming the message was not altered in transit.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Configuration</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">TXT</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Host</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">airsend._domainkey</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Value</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              The public key is auto-generated when you add your domain. Copy it exactly from your Airsend dashboard.
            </p>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Headers Signed by DKIM</h3>
            <div className="flex flex-wrap gap-2">
              {["From", "To", "Subject", "Date", "Message-ID", "In-Reply-To", "References", "MIME-Version"].map((h) => (
                <span key={h} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md">{h}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Long TXT Records</AlertTitle>
          <AlertDescription>
            If your DKIM public key is longer than 255 characters, some DNS providers require you to split it into
            multiple quoted strings. Ensure there are no extra spaces or line breaks in the key value.
          </AlertDescription>
        </Alert>
      </section>

      {/* DMARC Record */}
      <section id="dmarc" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">DMARC Record</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          DMARC builds on SPF and DKIM, allowing domain owners to publish a policy for how receiving servers should
          handle emails that fail authentication checks. It also provides reporting to monitor unauthorized use.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Configuration</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Type</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">TXT</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Host</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">_dmarc</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Value</TableCell>
                  <TableCell className="break-all"><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com; adkim=r; aspf=r; pct=100</code></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">DMARC Tags Explained</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">v=DMARC1</code></TableCell>
                  <TableCell>Version identifier (required)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">p=none</code></TableCell>
                  <TableCell>Policy: <strong>none</strong> (monitor), <strong>quarantine</strong> (spam), or <strong>reject</strong> (block)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">rua</code></TableCell>
                  <TableCell>Aggregate report email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">ruf</code></TableCell>
                  <TableCell>Forensic report email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">adkim</code></TableCell>
                  <TableCell>DKIM alignment: <strong>r</strong> (relaxed) or <strong>s</strong> (strict)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">aspf</code></TableCell>
                  <TableCell>SPF alignment: <strong>r</strong> (relaxed) or <strong>s</strong> (strict)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">pct</code></TableCell>
                  <TableCell>Percentage of messages the policy applies to (1-100)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300">Recommended Rollout</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-400 text-sm">
              <li><strong>Phase 1:</strong> Start with <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">p=none</code> — monitor and collect reports without affecting delivery</li>
              <li><strong>Phase 2:</strong> Move to <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">p=quarantine</code> — send failing emails to spam</li>
              <li><strong>Phase 3:</strong> Set <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">p=reject</code> — block all unauthenticated emails</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* PTR Record */}
      <section id="ptr" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">PTR Record (Reverse DNS)</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          A PTR record maps an IP address back to a hostname. When your mail server sends an email,
          the receiving server performs a reverse DNS lookup to verify that the IP resolves to a valid hostname
          associated with your domain.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">How to Set Up PTR</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Contact your VPS or dedicated server provider (not your DNS registrar)</li>
              <li>Request a PTR record for your server IP pointing to your mail server hostname (e.g., <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.yourdomain.com</code>)</li>
              <li>Ensure the PTR hostname has a matching A record that resolves back to the same IP</li>
              <li>This creates forward-confirmed reverse DNS (FCrDNS)</li>
            </ol>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Shared Hosting</AlertTitle>
          <AlertDescription>
            If you are on shared hosting, you may not be able to set a PTR record for your IP.
            Consider upgrading to a dedicated IP for sending email. Also ensure the PTR hostname
            matches your HELO/EHLO hostname used during SMTP connections.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  )
}
