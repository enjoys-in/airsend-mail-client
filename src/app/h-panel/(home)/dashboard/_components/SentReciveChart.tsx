"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


const chartConfig = {
  views: {
    label: "Mails",
  },
  sent: {
    label: "Sent Mail",
    color: "#4CAF50", // green
  },
  received: {
    label: "Received Mail",
    color: "#2196F3", // blue
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
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Line Chart - Interactive</CardTitle>
          <CardDescription>
            Showing Total Mail Sent/Received for the Current Month
          </CardDescription>
        </div>
        <div className="flex">
          {["sent", "received"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 5,
            }}
          >
            <CartesianGrid vertical={false} />
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
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
