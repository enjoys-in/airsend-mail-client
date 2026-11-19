"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { EmptyState, Panel } from "@/components/h-panel/kit"
import { cn } from "@/lib/utils"


const chartConfig = {
  views: {
    label: "Mails",
  },
  sent: {
    label: "Sent mail",
    color: "#6366f1",
  },
  received: {
    label: "Received mail",
    color: "#14b8a6",
  },

} satisfies ChartConfig

export function SentReciveChart({ chartData: rawChartData }: { chartData: { month: string, sent: string, received: string }[] }) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("sent")

  const chartData = React.useMemo(
    () => rawChartData.map(item => ({
      ...item,
      sent: Number(item.sent),
      received: Number(item.received),
    })),
    [rawChartData]
  )

  const total = React.useMemo(
    () => ({
      sent: chartData.reduce((acc, curr) => acc + curr.sent, 0),
      received: chartData.reduce((acc, curr) => acc + curr.received, 0),
    }),
    [chartData]
  )

  return (
    <Panel>
      <div className="flex flex-col items-stretch border-b border-border/70 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-0.5 px-5 py-4">
          <h2 className="text-sm font-medium">Mail traffic</h2>
          <p className="text-xs text-muted-foreground">Sent and received mail for the current month. Pick a series to chart it.</p>
        </div>
        <div className="flex">
          {["sent", "received"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                type="button"
                data-active={activeChart === chart}
                className={cn(
                  "flex flex-1 flex-col justify-center gap-1 border-t border-border/70 px-5 py-3 text-left transition-colors hover:bg-muted/40 sm:min-w-[140px] sm:flex-none sm:border-l sm:border-t-0",
                  "data-[active=true]:bg-muted/50"
                )}
                onClick={() => setActiveChart(chart)}
              >
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: chartConfig[chart].color }} />
                  {chartConfig[chart].label}
                </span>
                <span className="text-xl font-medium leading-none tabular-nums">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="px-2 py-4 sm:p-5">
        {chartData.length === 0 ? (
          <EmptyState title="No traffic this month" description="The chart appears once mail has been sent or received." />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[280px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 16,
                left: 4,
                right: 12,
                bottom: 4,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={40}
                domain={[0, (dataMax: number) => {
                  const nice = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000]
                  return nice.find(n => n >= dataMax * 1.2) ?? Math.ceil(dataMax * 1.2)
                }]}
                allowDecimals={false}
              />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="views"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={`var(--color-${activeChart})`}
                strokeWidth={1.75}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </Panel>
  )
}
