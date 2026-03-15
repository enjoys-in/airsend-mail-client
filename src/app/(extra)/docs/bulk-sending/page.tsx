import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"

export default function BulkSendingDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Bulk Sending
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Guidelines and best practices for sending email at scale while maintaining high deliverability and protecting your domain reputation.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Ensure SPF, DKIM, and DMARC are all properly configured and passing before sending any bulk email.
          Gmail and Yahoo require bulk senders (5,000+ emails/day) to have all three authentication methods in place.
        </AlertDescription>
      </Alert>

      {/* Warmup */}
      <section id="warmup" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">IP & Domain Warmup</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          New IPs and domains have no sending reputation. Sudden spikes in volume from a new IP trigger spam filters.
          You need to gradually build your sending reputation.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Warmup Schedule</h3>
            <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">Week 1</p>
                  <p>50–100 emails per day</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">Week 2</p>
                  <p>200–500 emails per day</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">Week 3</p>
                  <p>1,000–2,000 emails per day</p>
                </div>
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">Week 4+</p>
                  <p>Gradually increase to full volume</p>
                </div>
              </div>
              <p className="text-sm">
                Send to your most engaged recipients first during warmup. Positive engagement signals (opens, clicks, replies) build your reputation faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Best Practices</h2>

        <div className="space-y-4">
          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Use a Dedicated Sending Subdomain</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Instead of sending marketing emails from <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">yourdomain.com</code>,
                use a subdomain like <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">mail.yourdomain.com</code> or
                <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded"> news.yourdomain.com</code>.
                This isolates your bulk sending reputation from your primary domain.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">One-Click Unsubscribe</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                All bulk and marketing emails must include a visible unsubscribe link. Gmail and Yahoo require
                the <code className="text-sm bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">List-Unsubscribe-Post</code> header
                for one-click unsubscribe support. Airsend automatically adds these headers when you use the bulk sending feature.
              </p>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Monitor Rates</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Keep hard bounce rate <strong>below 2%</strong></li>
                <li>Keep spam complaint rate <strong>below 0.1%</strong> (1 per 1,000 emails)</li>
                <li>Exceeding these thresholds will cause providers to throttle or block your emails</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-6 space-y-3">
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Content Guidelines</h3>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Avoid spam trigger words in subject lines (e.g., &quot;FREE&quot;, &quot;ACT NOW&quot;, &quot;WINNER&quot;)</li>
                <li>Maintain a healthy text-to-image ratio — do not send image-only emails</li>
                <li>Include your physical mailing address (CAN-SPAM, GDPR requirement)</li>
                <li>Personalize messages when possible — generic blasts are more likely to be flagged</li>
                <li>Spread your sends over time — do not blast your entire list at once</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mailing Lists */}
      <section id="mailing-lists" className="space-y-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Mailing Lists</h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Maintaining clean mailing lists is critical for deliverability and sender reputation.
        </p>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">List Hygiene</h3>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Remove invalid email addresses and hard bounces regularly</li>
              <li>Use double opt-in for new subscriptions to ensure addresses are valid</li>
              <li>Remove inactive subscribers who haven&apos;t engaged in 6+ months</li>
              <li><strong>Never</strong> purchase email lists — they contain spam traps that will destroy your reputation</li>
            </ul>
          </CardContent>
        </Card>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Feedback Loops</AlertTitle>
          <AlertDescription>
            Register for feedback loop (FBL) programs with major ISPs. These notify you when recipients
            mark your email as spam, allowing you to remove them from your list promptly.
          </AlertDescription>
        </Alert>
      </section>
    </div>
  )
}
