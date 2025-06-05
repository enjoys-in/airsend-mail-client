import React from 'react'
import InfoCard from './_components/InfoCard'
import { Users, Globe, CheckCircle, UserCheck, Mail, MailCheck, AlertCircle, XCircle } from 'lucide-react';
import { MailChart } from './_components/MailCharts';
import { SentReciveChart } from './_components/SentReciveChart';
const page = () => {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-1 space-y-4">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min gap-2 p-2" >
                <h1 className='text-white text-center'>Working Under Progress</h1>

                <div className="grid auto-rows-min gap-4 md:grid-cols-4 mb-2">
                    <InfoCard title="Total Accounts" icon={<Users className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Total Domains" icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Active Domains" icon={<Globe className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Active Accounts" icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                </div>
                <div className="grid auto-rows-min gap-4 md:grid-cols-4 mb-2">
                    <InfoCard title="Total Mail Sent" icon={<Mail className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Total Mail Received" icon={<MailCheck className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Total Mail Bounced" icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                    <InfoCard title="Failed Mail" icon={<XCircle className="h-4 w-4 text-muted-foreground" />} value={"0"} />
                </div>
                <MailChart />
                <SentReciveChart />
            </div>
        </div>
    )
}

export default page