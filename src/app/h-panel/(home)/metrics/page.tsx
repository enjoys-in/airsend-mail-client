import { SomethingWentWrong } from "@/components/common/SomethingWentWrong"
import serverAxios from "@/lib/api/serverAxios"
import moment from "moment"
import React from "react"
import { EmptyState, PageHeader, PageShell, Pill, Section } from "@/components/h-panel/kit"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const page = async () => {
  try {
    const { data } = await serverAxios.get("/api/v1/admin/track-records", {
      withCredentials: true
    })

    if (!data.success) {
      throw new Error(data.message)
    }

    return (
      <PageShell>
        <PageHeader
          title="Metrics"
          description="Who opened the mail you sent, how often, and where each message got to."
        />
        <ResponsiveTable data={data.result} />
      </PageShell>
    )
  } catch (error) {
    return (
      <SomethingWentWrong />
    )
  }

}

const formatTime = (time: unknown) => moment(time as string).format("YYYY-MM-DD hh:mm A")

const ResponsiveTable = ({ data }: { data: any[] }) => {
  const records = data.flatMap((domain: any, d: number) =>
    (domain?.track_records ?? [])
      .filter((record: any) => record !== null)
      .map((record: any, i: number) => ({ ...record, _key: `${domain?.id ?? d}-${record?.id ?? i}` }))
  )

  return (
    <Section title="Tracked messages" description={`${records.length} record${records.length === 1 ? "" : "s"}`} flush>
      {records.length === 0 ? (
        <EmptyState title="No records found" description="Opens are tracked for mail you send with tracking turned on." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Opened</TableHead>
              <TableHead className="text-right">Times</TableHead>
              <TableHead>Last opened</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record: any) => (
              <TableRow key={record._key}>
                <TableCell className="max-w-[220px] truncate">{record?.from}</TableCell>
                <TableCell className="max-w-[220px] truncate">{record?.to}</TableCell>
                <TableCell>
                  <Pill tone={record?.opened ? "green" : "neutral"}>{record?.opened ? "Opened" : "Not opened"}</Pill>
                </TableCell>
                <TableCell className="text-right tabular-nums">{record?.opened_times}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {record?.last_opened ? formatTime(record?.last_opened) : "Not opened yet"}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5 text-xs text-muted-foreground">
                    {Object.entries(record?.all_status ?? {}).map(([status, time]) => (
                      <p key={status} className="whitespace-nowrap">
                        <span className="text-foreground">{status}</span> {formatTime(time)}
                      </p>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Section>
  )
}
export default page
