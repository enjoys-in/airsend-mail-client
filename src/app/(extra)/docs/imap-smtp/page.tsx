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
import { Info, ShieldCheck } from "lucide-react"

export default function ImapSmtpDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          IMAP & SMTP Setup
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Connect your Airsend mailbox to any email client using IMAP for receiving and SMTP for sending.
          Use these settings to configure Thunderbird, Outlook, Apple Mail, or any standard email client.
        </p>
      </div>

      {/* IMAP */}
      <section id="imap" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">IMAP Configuration</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          IMAP (Internet Message Access Protocol) allows you to access and manage your emails from multiple devices.
          Emails stay on the server and are synced across all connected clients.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Incoming Mail Server (IMAP)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Setting</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Protocol</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">IMAP</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Server / Hostname</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">mail.enjoys.in</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Port</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">993</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Encryption</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">SSL/TLS</code>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Required</Badge>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Authentication</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">Normal password</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Username</TableCell>
                  <TableCell>Your full email address (e.g., <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">you@yourdomain.com</code>)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Password</TableCell>
                  <TableCell>Your Airsend account password or app-specific password</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>SSL/TLS Required</AlertTitle>
          <AlertDescription>
            Always use port <strong>993</strong> with SSL/TLS encryption. Do not use unencrypted IMAP on port 143 —
            your credentials and emails would be transmitted in plain text.
          </AlertDescription>
        </Alert>
      </section>

      {/* SMTP */}
      <section id="smtp" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">SMTP Configuration</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          SMTP (Simple Mail Transfer Protocol) is used to send outgoing emails from your email client through the Airsend mail server.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Outgoing Mail Server (SMTP)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Setting</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Protocol</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">SMTP</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Server / Hostname</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">mail.enjoys.in</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Port</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">587</code>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Recommended</Badge>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Encryption</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">STARTTLS</code>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Required</Badge>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Authentication</TableCell>
                  <TableCell><code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">Normal password</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Username</TableCell>
                  <TableCell>Your full email address (e.g., <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">you@yourdomain.com</code>)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Password</TableCell>
                  <TableCell>Your Airsend account password or app-specific password</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Port Comparison</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Port</TableHead>
                  <TableHead>Encryption</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono font-medium">587</TableCell>
                  <TableCell>STARTTLS</TableCell>
                  <TableCell>Recommended — connection upgrades to TLS encryption</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">465</TableCell>
                  <TableCell>SSL/TLS (implicit)</TableCell>
                  <TableCell>Legacy — some older clients may still use this</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono font-medium">25</TableCell>
                  <TableCell>None</TableCell>
                  <TableCell>Do not use — unencrypted, blocked by most ISPs for client submission</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Never Use Port 25</AlertTitle>
          <AlertDescription>
            Port 25 is intended for server-to-server relay, not client email submission. Most ISPs block outgoing
            connections on port 25. Always use port 587 with STARTTLS for sending from email clients.
          </AlertDescription>
        </Alert>
      </section>

      {/* Email Clients */}
      <section id="email-clients" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Email Client Setup</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Quick setup instructions for popular email clients. Use the IMAP and SMTP settings above when configuring each client.
        </p>

        <div className="space-y-4">
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Mozilla Thunderbird</h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                <li>Open Thunderbird and go to <strong>Account Settings → Account Actions → Add Mail Account</strong></li>
                <li>Enter your name, email address, and password</li>
                <li>Click <strong>Configure manually</strong></li>
                <li>Set incoming server: IMAP, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code>, port <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">993</code>, SSL/TLS</li>
                <li>Set outgoing server: SMTP, <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code>, port <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">587</code>, STARTTLS</li>
                <li>Set username to your full email address for both</li>
                <li>Click <strong>Done</strong></li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Microsoft Outlook</h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                <li>Go to <strong>File → Add Account</strong></li>
                <li>Enter your email address and click <strong>Advanced options → Let me set up my account manually</strong></li>
                <li>Select <strong>IMAP</strong></li>
                <li>Enter incoming server: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code>, port <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">993</code>, encryption SSL/TLS</li>
                <li>Enter outgoing server: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code>, port <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">587</code>, encryption STARTTLS</li>
                <li>Enter your password and click <strong>Connect</strong></li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Apple Mail (macOS / iOS)</h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                <li>Go to <strong>System Settings → Internet Accounts → Add Other Account → Mail Account</strong></li>
                <li>Enter your name, email address, and password</li>
                <li>When prompted, select <strong>IMAP</strong> as the account type</li>
                <li>Set incoming mail server to <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code></li>
                <li>Set outgoing mail server to <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code></li>
                <li>Apple Mail will auto-configure ports and SSL — verify port 993 (IMAP) and 587 (SMTP) with STARTTLS</li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Gmail (Android / Web — via &quot;Check mail from other accounts&quot;)</h3>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                <li>In Gmail, go to <strong>Settings → Accounts and Import → Check mail from other accounts → Add a mail account</strong></li>
                <li>Enter your Airsend email address</li>
                <li>Select <strong>Import emails from my other account (POP3)</strong> or use IMAP on mobile</li>
                <li>For sending: <strong>Send mail as → Add another email address</strong></li>
                <li>SMTP server: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.enjoys.in</code>, port <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">587</code>, STARTTLS</li>
                <li>Enter your full email as username and your password</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quick Reference */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Quick Reference</h2>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/50">
          <CardContent className="pt-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Incoming (IMAP)</h3>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <p><strong>Server:</strong> mail.enjoys.in</p>
                  <p><strong>Port:</strong> 993</p>
                  <p><strong>Encryption:</strong> SSL/TLS</p>
                  <p><strong>Username:</strong> your full email</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Outgoing (SMTP)</h3>
                <div className="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                  <p><strong>Server:</strong> mail.enjoys.in</p>
                  <p><strong>Port:</strong> 587</p>
                  <p><strong>Encryption:</strong> STARTTLS</p>
                  <p><strong>Username:</strong> your full email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Troubleshooting Connection Issues</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-1 text-sm">
            <li>Double-check that the username is your <strong>full email address</strong>, not just the part before @</li>
            <li>Ensure your firewall or network is not blocking ports 993 or 465</li>
            <li>If using an app-specific password, generate one from your Airsend account security settings</li>
            <li>Verify your domain is fully verified in your Airsend workspace before connecting</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
