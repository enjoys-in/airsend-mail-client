import React from 'react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
const InfoCard = ({ title, icon, value }: { title: string; icon: React.ReactNode; value: string }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {/* <p className="text-xs text-muted-foreground">+12% from last month</p> */}
            </CardContent>
        </Card>
    )
}

export default InfoCard