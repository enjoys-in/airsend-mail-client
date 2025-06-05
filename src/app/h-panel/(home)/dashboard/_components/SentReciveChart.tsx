"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
const chartData = [
  { date: "2024-04-01", sent: 222, received: 150 },
  { date: "2024-04-02", sent: 97, received: 180 },
  { date: "2024-04-03", sent: 167, received: 120 },
  { date: "2024-04-04", sent: 242, received: 260 },
  { date: "2024-04-05", sent: 373, received: 290 },
  { date: "2024-04-06", sent: 301, received: 340 },
  { date: "2024-04-07", sent: 245, received: 180 },
  { date: "2024-04-08", sent: 409, received: 320 },
  { date: "2024-04-09", sent: 59, received: 110 },
  { date: "2024-04-10", sent: 261, received: 190 },
  { date: "2024-04-11", sent: 327, received: 350 },
  { date: "2024-04-12", sent: 292, received: 210 },
  { date: "2024-04-13", sent: 342, received: 380 },
  { date: "2024-04-14", sent: 137, received: 220 },
  { date: "2024-04-15", sent: 120, received: 170 },
  { date: "2024-04-16", sent: 138, received: 190 },
  { date: "2024-04-17", sent: 446, received: 360 },
  { date: "2024-04-18", sent: 364, received: 410 },
  { date: "2024-04-19", sent: 243, received: 180 },
  { date: "2024-04-20", sent: 89, received: 150 },
  { date: "2024-04-21", sent: 137, received: 200 },
  { date: "2024-04-22", sent: 224, received: 170 },
  { date: "2024-04-23", sent: 138, received: 230 },
  { date: "2024-04-24", sent: 387, received: 290 },
  { date: "2024-04-25", sent: 215, received: 250 },
  { date: "2024-04-26", sent: 75, received: 130 },
  { date: "2024-04-27", sent: 383, received: 420 },
  { date: "2024-04-28", sent: 122, received: 180 },
  { date: "2024-04-29", sent: 315, received: 240 },
  { date: "2024-04-30", sent: 454, received: 380 },
  { date: "2024-05-01", sent: 165, received: 220 },
  { date: "2024-05-02", sent: 293, received: 310 },
  { date: "2024-05-03", sent: 247, received: 190 },
  { date: "2024-05-04", sent: 385, received: 420 },
  { date: "2024-05-05", sent: 481, received: 390 },
  { date: "2024-05-06", sent: 498, received: 520 },
  { date: "2024-05-07", sent: 388, received: 300 },
  { date: "2024-05-08", sent: 149, received: 210 },
  { date: "2024-05-09", sent: 227, received: 180 },
  { date: "2024-05-10", sent: 293, received: 330 },
  { date: "2024-05-11", sent: 335, received: 270 },
  { date: "2024-05-12", sent: 197, received: 240 },
  { date: "2024-05-13", sent: 197, received: 160 },
  { date: "2024-05-14", sent: 448, received: 490 },
  { date: "2024-05-15", sent: 473, received: 380 },
  { date: "2024-05-16", sent: 338, received: 400 },
  { date: "2024-05-17", sent: 499, received: 420 },
  { date: "2024-05-18", sent: 315, received: 350 },
  { date: "2024-05-19", sent: 235, received: 180 },
  { date: "2024-05-20", sent: 177, received: 230 },
  { date: "2024-05-21", sent: 82, received: 140 },
  { date: "2024-05-22", sent: 81, received: 120 },
  { date: "2024-05-23", sent: 252, received: 290 },
  { date: "2024-05-24", sent: 294, received: 220 },
  { date: "2024-05-25", sent: 201, received: 250 },
  { date: "2024-05-26", sent: 213, received: 170 },
  { date: "2024-05-27", sent: 420, received: 460 },
  { date: "2024-05-28", sent: 233, received: 190 },
  { date: "2024-05-29", sent: 78, received: 130 },
  { date: "2024-05-30", sent: 340, received: 280 },
  { date: "2024-05-31", sent: 178, received: 230 },
  { date: "2024-06-01", sent: 178, received: 200 },
  { date: "2024-06-02", sent: 470, received: 410 },
  { date: "2024-06-03", sent: 103, received: 160 },
  { date: "2024-06-04", sent: 439, received: 380 },
  { date: "2024-06-05", sent: 88, received: 140 },
  { date: "2024-06-06", sent: 294, received: 250 },
  { date: "2024-06-07", sent: 323, received: 370 },
  { date: "2024-06-08", sent: 385, received: 320 },
  { date: "2024-06-09", sent: 438, received: 480 },
  { date: "2024-06-10", sent: 155, received: 200 },
  { date: "2024-06-11", sent: 92, received: 150 },
  { date: "2024-06-12", sent: 492, received: 420 },
  { date: "2024-06-13", sent: 81, received: 130 },
  { date: "2024-06-14", sent: 426, received: 380 },
  { date: "2024-06-15", sent: 307, received: 350 },
  { date: "2024-06-16", sent: 371, received: 310 },
  { date: "2024-06-17", sent: 475, received: 520 },
  { date: "2024-06-18", sent: 107, received: 170 },
  { date: "2024-06-19", sent: 341, received: 290 },
  { date: "2024-06-20", sent: 408, received: 450 },
  { date: "2024-06-21", sent: 169, received: 210 },
  { date: "2024-06-22", sent: 317, received: 270 },
  { date: "2024-06-23", sent: 480, received: 530 },
  { date: "2024-06-24", sent: 132, received: 180 },
  { date: "2024-06-25", sent: 141, received: 190 },
  { date: "2024-06-26", sent: 434, received: 380 },
  { date: "2024-06-27", sent: 448, received: 490 },
  { date: "2024-06-28", sent: 149, received: 200 },
  { date: "2024-06-29", sent: 103, received: 160 },
  { date: "2024-06-30", sent: 446, received: 400 },
]

const chartConfig = {
  views: {
    label: "Mails",
  },
  sent: {
    label: "Sent Mail",
    color: "hsl(var(--chart-1))",
  },
  received: {
    label: "Received Mail",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function SentReciveChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("sent")

  const total = React.useMemo(
    () => ({
      sent: chartData.reduce((acc, curr) => acc + curr.sent, 0),
      received: chartData.reduce((acc, curr) => acc + curr.received, 0),
    }),
    []
  )

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Line Chart - Interactive</CardTitle>
          <CardDescription>
            Showing Total Mail Sent/Received for the last 3 months
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
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
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
