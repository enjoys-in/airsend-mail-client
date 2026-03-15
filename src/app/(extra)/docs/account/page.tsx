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

export default function AccountDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Account & Workspace
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Learn how to create your account, manage workspaces, and generate API keys for integrations.
        </p>
      </div>

      {/* Create Account */}
      <section id="create-account" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Create Account</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          To start using Airsend, you need to create an account. You can sign up using your email address or authenticate with a third-party provider.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Steps to Create an Account</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Navigate to the Airsend sign-up page</li>
              <li>Enter your full name, email address, and a strong password</li>
              <li>Verify your email address by clicking the link sent to your inbox</li>
              <li>Complete your profile setup by selecting your timezone and preferences</li>
              <li>You will be taken to your dashboard where you can start adding domains</li>
            </ol>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            You must verify your email address before you can send emails or add domains. Check your spam folder if you do not see the verification email.
          </AlertDescription>
        </Alert>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Account Requirements</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Requirement</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Email</TableCell>
                  <TableCell>Must be a valid, accessible email address</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Password</TableCell>
                  <TableCell>Minimum 8 characters, must include uppercase, lowercase, and a number</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Name</TableCell>
                  <TableCell>Your display name (can be changed later)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      {/* Workspace */}
      <section id="workspace" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Workspace</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          A workspace is your organizational container in Airsend. Each workspace can have its own domains, team members, and settings.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Workspace Features</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><strong>Multiple domains</strong> — Add and manage several domains under one workspace</li>
              <li><strong>Team collaboration</strong> — Invite team members with different roles and permissions</li>
              <li><strong>Shared inbox</strong> — Access shared email inboxes across your team</li>
              <li><strong>Separate billing</strong> — Each workspace has its own subscription and usage tracking</li>
              <li><strong>Custom settings</strong> — Configure workspace-specific preferences, signatures, and templates</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Creating a Workspace</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Go to your dashboard and click <Badge variant="outline">New Workspace</Badge></li>
              <li>Enter a name for your workspace</li>
              <li>Select a plan (Free, Pro, or Enterprise)</li>
              <li>Invite team members (optional)</li>
              <li>Start adding domains and configuring your email setup</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* API Keys */}
      <section id="api-keys" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">API Keys</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          API keys allow you to programmatically send and receive emails through the Airsend API. Each workspace generates its own unique API credentials.
        </p>

        <Alert variant="destructive">
          <AlertTitle>Security Warning</AlertTitle>
          <AlertDescription>
            Never expose your API keys in frontend code or public repositories. Always use them on the server side through a backend proxy.
          </AlertDescription>
        </Alert>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Generating API Keys</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Navigate to <strong>Settings → API Keys</strong> in your workspace dashboard</li>
              <li>Click <Badge variant="outline">Generate New Key</Badge></li>
              <li>Copy both the <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">client_key</code> and <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">client_secret</code></li>
              <li>Store them securely — the secret will not be shown again</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-3">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Rate Limits</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Rate Limit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">GET /client/get</code></TableCell>
                  <TableCell>10 requests per minute</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium"><code className="text-sm">POST /client/send</code></TableCell>
                  <TableCell>3 requests per minute</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="pt-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            For interactive API testing, visit the{" "}
            <Link href="/docs/getting-started" className="text-blue-600 dark:text-blue-400 underline">
              Getting Started API Reference
            </Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
