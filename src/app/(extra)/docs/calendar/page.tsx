import type { Metadata } from "next"
import {
  ArrowRight,
  Bell,
  CalendarPlus,
  Check,
  Clock,
  HelpCircle,
  Mail,
  Radio,
  Repeat,
  Smartphone,
  Workflow,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { CodeTabs, BaseUrl } from "./_components/code-tabs"
import { Callout, Code, DocSection, KeyValueRows, MethodPill, Panel, PartHeader, Prose, Step, SubHeading, row } from "./_components/doc-ui"
import { PageNav, PageRail } from "./_components/page-nav"
import { CALDEV_PUBLIC_URL, PAGE_SECTIONS, REQUEST_EMAIL, REQUEST_MAILTO } from "./_data/config"
import { endpointGroups, eventFilters, jmapMethods, statusCodes, subscriptionFields } from "./_data/reference"
import {
  availabilitySamples,
  caldavSamples,
  changesSamples,
  createCalendarSamples,
  createEventSamples,
  errorSamples,
  healthSamples,
  listCalendarsSamples,
  queryEventsSamples,
  rsvpSamples,
  sessionSamples,
  subscriptionSamples,
  updateDeleteSamples,
} from "./_data/samples"

// Static page (SSG): no runtime data, the service URL is a build-time constant.
export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "Calendar — Airsend Docs",
  description:
    "Use the Airsend calendar, and integrate with the Airsend calendar service: JMAP for events and calendars, REST for RSVP, subscriptions and availability, CalDAV and ICS for native clients.",
}

const GRID_BG =
  "[background-image:linear-gradient(to_right,rgba(127,127,127,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(127,127,127,0.10)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"

export default function CalendarDocs() {
  return (
    // [data-docs-wide] tells the docs layout to widen its container for the right-hand rail.
    <div data-docs-wide className="xl:grid xl:grid-cols-[minmax(0,1fr)_12.5rem] xl:gap-10">
    <div className="min-w-0 space-y-10">
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-500/[0.12] via-transparent to-blue-500/[0.10]" />
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${GRID_BG}`} />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {["REST", "JMAP", "CalDAV", "ICS"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-pink-500/25 bg-pink-500/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-pink-700 dark:text-pink-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">Calendar</h1>
            <p className="max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
              Events, meetings and schedules inside Airsend — and a standalone calendar service you can build on.
              Invitations and RSVPs flow through your email automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="bg-pink-600 text-white hover:bg-pink-700">
              <a href="#request-access">
                Get API access <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" className="bg-transparent">
              <a href="#quick-start">Quick start</a>
            </Button>
            <BaseUrl />
          </div>

          <dl className="grid gap-3 sm:grid-cols-3">
            {[
              ["Protocols", "JMAP · REST · CalDAV"],
              ["Format", "JSON, RFC 3339 times"],
              ["Auth", "Session cookie · app password"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">{k}</dt>
                <dd className="mt-1 text-sm font-medium text-neutral-900 dark:text-neutral-100">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <PageNav sections={PAGE_SECTIONS} />

      <div className="space-y-16">
        {/* ─────────────────────── Using the calendar ─────────────────────── */}
        <DocSection id="using-the-calendar" eyebrow="Product" title="Using the calendar">
          <Prose>
            Manage events, meetings and schedules directly within Airsend. The calendar integrates with your email to handle invitations and RSVPs.
          </Prose>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: CalendarPlus, title: "Event creation", desc: "Create events with title, description, location, date, time and attendees. Invitations go out by email automatically." },
              { icon: Mail, title: "Email invitations", desc: "Events generate iCalendar (.ics) invitations. Recipients can accept, decline or propose a new time." },
              { icon: Repeat, title: "Recurring events", desc: "Daily, weekly, monthly or yearly. Change a single occurrence or the whole series." },
              { icon: Bell, title: "Reminders", desc: "Email reminders before events, at several intervals (for example 15 min, 1 hour, 1 day)." },
            ].map((f) => (
              <Panel key={f.title} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-pink-500/20 bg-pink-500/10">
                    <f.icon className="h-4 w-4 text-pink-500" aria-hidden />
                  </span>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{f.title}</h3>
                </div>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{f.desc}</p>
              </Panel>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="space-y-4">
              <SubHeading>Creating an event</SubHeading>
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-neutral-600 dark:text-neutral-400 marker:text-pink-500">
                <li>Open <strong className="text-neutral-900 dark:text-neutral-100">Calendar</strong> from your dashboard</li>
                <li>Click a date, or use <strong className="text-neutral-900 dark:text-neutral-100">New Event</strong></li>
                <li>Fill in title, date, time and description</li>
                <li>Add attendees by email address</li>
                <li>Set reminder preferences</li>
                <li>Click <strong className="text-neutral-900 dark:text-neutral-100">Save</strong> — invitations are sent automatically</li>
              </ol>
            </Panel>

            <Panel className="space-y-4">
              <SubHeading>Responding to an invitation</SubHeading>
              <ul className="space-y-3">
                {[
                  { icon: Check, c: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", t: "Accept", d: "The event is added to your calendar" },
                  { icon: X, c: "text-red-500 bg-red-500/10 border-red-500/20", t: "Decline", d: "The organizer is notified" },
                  { icon: HelpCircle, c: "text-amber-500 bg-amber-500/10 border-amber-500/20", t: "Tentative", d: "Shown on your calendar as a maybe" },
                  { icon: Clock, c: "text-blue-500 bg-blue-500/10 border-blue-500/20", t: "Propose new time", d: "Suggest an alternative to the organizer" },
                ].map((a) => (
                  <li key={a.t} className="flex items-start gap-3">
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${a.c}`}>
                      <a.icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                      <strong className="text-neutral-900 dark:text-neutral-100">{a.t}</strong> — {a.d}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Callout type="info" title="iCalendar standard">
            Invitations use the iCalendar (.ics) standard, compatible with Google Calendar, Outlook, Apple Calendar and other major calendar apps.
          </Callout>
        </DocSection>

        {/* ─────────────────────── Calendar service ─────────────────────── */}
        <section id="calendar-service" className="scroll-mt-32 space-y-8">
          <PartHeader label="Developers" title="Calendar service API">
            <Prose>
              The calendar runs as its own service, <Code>CalDev</Code>. Point your app, script or calendar client at its URL to read and
              write calendars, events, invitations and availability — the same way the Airsend web app does.
            </Prose>
          </PartHeader>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: Workflow, title: "JMAP", tag: "Web & apps", desc: "One endpoint for every calendar and event operation. Batch calls, sync incrementally." },
              { icon: Radio, title: "REST", tag: "Helpers", desc: "Simple JSON endpoints for RSVP, ICS subscriptions, availability and app passwords." },
              { icon: Smartphone, title: "CalDAV & ICS", tag: "Native clients", desc: "Connect Apple Calendar, Thunderbird or Outlook, or subscribe to a read-only feed." },
            ].map((p) => (
              <Panel key={p.title} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-pink-500/20 bg-pink-500/10">
                    <p.icon className="h-4 w-4 text-pink-500" aria-hidden />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">{p.tag}</span>
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{p.title}</h3>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{p.desc}</p>
              </Panel>
            ))}
          </div>
        </section>

        {/* ───────────────────────────── Base URL ───────────────────────────── */}
        <DocSection id="base-url" title="Base URL">
          <Prose>Every path on this page is relative to the Airsend calendar service URL. All examples already use it — HTTPS only.</Prose>
          <BaseUrl />
          <Prose>Check that the service is reachable — no authentication needed:</Prose>
          <CodeTabs samples={healthSamples} />
        </DocSection>

        {/* ───────────────────────── Authentication ───────────────────────── */}
        <DocSection id="authentication" title="Authentication">
          <Prose>
            CalDev authenticates with the <Code>access_token</Code> cookie issued when you sign in to Airsend. It is a JWT carrying your
            mailbox ID, email, name and role; the server derives the tenant and user from it, so you never pass them yourself.
          </Prose>

          <KeyValueRows
            rows={[
              [
                <span key="b" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Browser</span>,
                <>Add <Code>credentials: &quot;include&quot;</Code> to <Code>fetch</Code> (or <Code>withCredentials: true</Code> in axios). Your origin must be allowed by the service&apos;s CORS settings.</>,
              ],
              [
                <span key="s" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Server / script</span>,
                <>Send the cookie yourself: <Code>Cookie: access_token=&lt;JWT&gt;</Code>.</>,
              ],
              [
                <span key="n" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Native calendar apps</span>,
                <>Sign in with your email and an <a href="#caldav" className="text-blue-600 dark:text-blue-400 hover:underline">app password</a> — not the cookie.</>,
              ],
            ]}
          />

          <Callout type="info" title="What the Airsend web client sends">
            Besides the cookie, the web app adds <Code>X-Tenant-ID</Code> (your mailbox ID) and <Code>x-api-key</Code> (the Airsend API key)
            to every request. They are not part of the documented service contract, so ask your administrator whether your deployment requires them.
          </Callout>
          <Callout type="danger" title="Keep the token private">
            The access token grants full access to the account&apos;s calendars. Never ship it in client-side code or commit it to a repository.
          </Callout>
        </DocSection>

        {/* ──────────────────────── Request access ──────────────────────── */}
        <DocSection id="request-access" title="Request API access">
          <Prose>
            Access to the calendar service is granted per account. If you cannot sign in to the API, get a <Code>401</Code>, or need access
            for your app, raise a request and we will set you up.
          </Prose>

          <div className="relative overflow-hidden rounded-2xl border border-pink-500/25 bg-gradient-to-br from-pink-500/[0.08] to-transparent p-6">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Send us a request</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Email <Code>{REQUEST_EMAIL}</Code> from your Airsend address and include:
                </p>
                <ul className="space-y-1.5 text-sm text-neutral-600 dark:text-neutral-400">
                  {[
                    "Your Airsend email address (the account that needs access)",
                    "What you are building, and which calendars or events it will touch",
                    "Which interface you need: JMAP / REST, CalDAV or ICS feeds",
                    "Your app's origin (for CORS), if it is a browser app",
                  ].map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-pink-500" aria-hidden />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2 md:text-center">
                <Button asChild size="lg" className="bg-pink-600 text-white hover:bg-pink-700">
                  <a href={REQUEST_MAILTO}>
                    <Mail className="mr-2 h-4 w-4" /> Request API access
                  </a>
                </Button>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Opens your email app, pre-filled.</p>
              </div>
            </div>
          </div>
        </DocSection>

        {/* ───────────────────────────── Quick start ───────────────────────────── */}
        <DocSection id="quick-start" title="Quick start">
          <Prose>Four steps from a signed-in session to your first event. The <Code>jmap()</Code> helper from step 2 is reused everywhere below.</Prose>

          <ol className="space-y-0">
            <Step n={1} title="Get your account ID">
              <Prose>
                JMAP calls need an <Code>accountId</Code> (formatted <Code>tenantId:userId</Code>). Read it from the session once after sign-in.
              </Prose>
              <CodeTabs samples={sessionSamples} />
            </Step>
            <Step n={2} title="Call the API and list calendars">
              <Prose>
                Add the <Code>jmap()</Code> helper once, then list your calendars. Calls can be batched in a single request.
              </Prose>
              <CodeTabs samples={listCalendarsSamples} />
            </Step>
            <Step n={3} title="Create a calendar">
              <CodeTabs samples={createCalendarSamples} />
            </Step>
            <Step n={4} title="Create an event" last>
              <Prose>
                Adding <Code>participants</Code> makes CalDev email an iCalendar invitation to each guest. Do not send <Code>organizer</Code> —
                the server sets it from your account.
              </Prose>
              <CodeTabs samples={createEventSamples} />
            </Step>
          </ol>
        </DocSection>

        {/* ───────────────────────────── Events ───────────────────────────── */}
        <DocSection id="events" title="Reading and changing events">
          <div className="space-y-3">
            <SubHeading>Query a date range</SubHeading>
            <Prose>
              <Code>CalendarEvent/query</Code> returns IDs only; fetch the objects with <Code>CalendarEvent/get</Code>. All filter fields are optional.
            </Prose>
            <KeyValueRows rows={eventFilters.map(([k, v]) => row(<Code key={k}>{k}</Code>, v))} />
            <CodeTabs samples={queryEventsSamples} />
          </div>

          <div className="space-y-3">
            <SubHeading>Update or delete</SubHeading>
            <Prose>
              Updatable fields: <Code>title</Code>, <Code>description</Code>, <Code>location</Code>, <Code>start</Code>, <Code>end</Code>,{" "}
              <Code>isAllDay</Code>, <Code>status</Code>, <Code>recurrenceRules</Code>, <Code>participants</Code>.
            </Prose>
            <CodeTabs samples={updateDeleteSamples} />
          </div>

          <Callout type="warn" title="Times">
            Send RFC 3339 timestamps <strong>without milliseconds</strong> (<Code>2026-12-03T10:00:00Z</Code>). For timed events also send an
            IANA <Code>timeZone</Code>; never send one for all-day events.
          </Callout>
        </DocSection>

        {/* ───────────────────────────── Sync ───────────────────────────── */}
        <DocSection id="sync" title="Keeping data in sync">
          <Prose>
            Do not re-download the whole calendar on every visit. Store the <Code>state</Code> token from your last response and ask only for
            what changed. To react instantly, open the live stream and run a delta sync when it fires.
          </Prose>
          <CodeTabs samples={changesSamples} />
          <Callout type="tip" title="Fallback">
            If the stream cannot connect, run a delta sync on page focus instead — the calendar keeps working.
          </Callout>
        </DocSection>

        {/* ───────────────────────────── RSVP ───────────────────────────── */}
        <DocSection id="rsvp" title="RSVP to an invitation">
          <Prose>
            Records your response and sends a reply to the organizer. Valid values are <Code>ACCEPTED</Code>, <Code>DECLINED</Code> and{" "}
            <Code>TENTATIVE</Code> (shortcuts: <Code>accept</Code>/<Code>yes</Code>, <Code>decline</Code>/<Code>no</Code>, <Code>maybe</Code>).
          </Prose>
          <CodeTabs samples={rsvpSamples} />
        </DocSection>

        {/* ─────────────────────────── Subscriptions ─────────────────────────── */}
        <DocSection id="subscriptions" title="Import external calendars">
          <Prose>
            Subscribe to any ICS feed (Google, Outlook or a plain <Code>.ics</Code> URL). CalDev creates a read-only calendar and re-syncs it
            on the interval you choose.
          </Prose>
          <CodeTabs samples={subscriptionSamples} />
          <KeyValueRows rows={subscriptionFields.map(([k, v]) => row(<Code key={k}>{k}</Code>, v))} />
        </DocSection>

        {/* ─────────────────────────── Availability ─────────────────────────── */}
        <DocSection id="availability" title="People & availability">
          <Prose>
            Suggest guests and show who is free before you schedule. Results only include teammates from your own organisation, and a
            person&apos;s busy blocks are returned only if they chose to share them with you.
          </Prose>
          <CodeTabs samples={availabilitySamples} />
        </DocSection>

        {/* ───────────────────────────── CalDAV ───────────────────────────── */}
        <DocSection id="caldav" title="CalDAV & ICS feeds">
          <Prose>
            Native clients such as Apple Calendar, Thunderbird and Outlook speak CalDAV. They sign in with your email address and an{" "}
            <strong className="text-neutral-900 dark:text-neutral-100">app password</strong> — a separate secret you can revoke without touching
            your mailbox password. Create one in Airsend under <strong className="text-neutral-900 dark:text-neutral-100">Settings → Calendar</strong>, or through the API.
          </Prose>
          <CodeTabs samples={caldavSamples} />
          <Callout type="warn" title="Web apps: use JMAP, not /dav">
            The <Code>/dav/*</Code> routes exist for native clients only. Browser and backend integrations should use <Code>/jmap/api</Code>.
          </Callout>
        </DocSection>

        {/* ───────────────────────────── Reference ───────────────────────────── */}
        <DocSection id="reference" title="API reference">
          <div className="space-y-8">
            {endpointGroups.map((g) => (
              <div key={g.title} className="space-y-3">
                <SubHeading>{g.title}</SubHeading>
                <ul className="divide-y divide-neutral-200/80 dark:divide-white/10 overflow-hidden rounded-xl border border-neutral-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03]">
                  {g.endpoints.map((e) => (
                    <li key={e.method + e.path} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="flex min-w-0 items-center gap-3 sm:w-[22rem] sm:shrink-0">
                        <MethodPill method={e.method} />
                        <code className="truncate [font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-[13px] text-neutral-900 dark:text-neutral-100">{e.path}</code>
                      </div>
                      <p className="min-w-0 flex-1 text-sm text-neutral-600 dark:text-neutral-400">{e.desc}</p>
                      <span
                        className={`w-fit shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                          e.auth
                            ? "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400"
                            : "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        }`}
                      >
                        {e.auth ? "Auth required" : "Public"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="space-y-3">
              <SubHeading>JMAP methods</SubHeading>
              <KeyValueRows rows={jmapMethods.map(([m, d]) => row(<Code key={m}>{m}</Code>, d))} />
            </div>
          </div>
        </DocSection>

        {/* ───────────────────────────── Errors ───────────────────────────── */}
        <DocSection id="errors" title="Responses & errors">
          <Prose>
            REST endpoints return <Code>{"{ success, message, result }"}</Code>. JMAP returns <Code>methodResponses</Code>, where each entry is{" "}
            <Code>[name, result, callId]</Code>.
          </Prose>
          <CodeTabs samples={errorSamples} />
          <KeyValueRows
            rows={statusCodes.map(([c, m]) =>
              row(<code key={c} className="[font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace] text-sm font-semibold text-neutral-900 dark:text-neutral-100">{c}</code>, m)
            )}
          />
          <Callout type="info" title="401 in the Airsend app">
            The Airsend web client sends users back to sign-in on any 401. If you build your own client, refresh the session and retry once
            instead of looping.
          </Callout>
        </DocSection>

        {/* ───────────────────────────── Footer CTA ───────────────────────────── */}
        <aside className="rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Stuck, or need access?</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Raise a request and include your Airsend email — we will get you set up on <Code>{CALDEV_PUBLIC_URL.replace("https://", "")}</Code>.
              </p>
            </div>
            <Button asChild className="shrink-0 bg-pink-600 text-white hover:bg-pink-700">
              <a href={REQUEST_MAILTO}>
                <Mail className="mr-2 h-4 w-4" /> Request API access
              </a>
            </Button>
          </div>
        </aside>
      </div>
    </div>

    <aside className="hidden xl:block">
      <PageRail sections={PAGE_SECTIONS} />
    </aside>
    </div>
  )
}
