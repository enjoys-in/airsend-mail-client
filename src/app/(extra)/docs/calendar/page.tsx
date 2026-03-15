import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function CalendarDocs() {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          Calendar
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Manage events, meetings, and schedules directly within Airsend. The calendar integrates with your email to handle invitations and RSVPs.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Features</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Event Creation",
              desc: "Create events with title, description, location, date, time, and attendees. Events automatically send email invitations to participants.",
            },
            {
              title: "Email Invitations",
              desc: "Calendar events generate iCalendar (.ics) invitations sent via email. Recipients can accept, decline, or propose a new time.",
            },
            {
              title: "Recurring Events",
              desc: "Set up daily, weekly, monthly, or yearly recurring events. Modify individual occurrences or the entire series.",
            },
            {
              title: "Reminders",
              desc: "Configure email reminders before events. Set multiple reminders at different intervals (e.g., 15 min, 1 hour, 1 day before).",
            },
          ].map((feature) => (
            <Card key={feature.title} className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Using the Calendar</h2>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Creating an Event</h3>
            <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Navigate to the <strong>Calendar</strong> section from your dashboard</li>
              <li>Click on a date or use the <strong>New Event</strong> button</li>
              <li>Fill in the event details: title, date, time, description</li>
              <li>Add attendees by entering their email addresses</li>
              <li>Set reminder preferences</li>
              <li>Click <strong>Save</strong> — invitations will be sent automatically</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">Managing Invitations</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              When you receive a calendar invitation via email, you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li><strong>Accept</strong> — The event is added to your calendar</li>
              <li><strong>Decline</strong> — The organizer is notified of your decline</li>
              <li><strong>Tentative</strong> — Mark as maybe; the event appears on your calendar as tentative</li>
              <li><strong>Propose New Time</strong> — Suggest an alternative time to the organizer</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>iCalendar Standard</AlertTitle>
        <AlertDescription>
          Airsend uses the iCalendar (.ics) standard for event invitations, which is compatible with
          Google Calendar, Outlook, Apple Calendar, and other major calendar applications.
        </AlertDescription>
      </Alert>
    </div>
  )
}
