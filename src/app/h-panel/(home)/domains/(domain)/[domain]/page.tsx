import { Clock, Globe, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Badge as BadgeComponent } from "@/components/ui/badge"
import serverAxios from '@/lib/api/serverAxios'
import { DOMAIN_STATUS, DomainVerificationResponse } from '@/lib/types/mail.interface'
import { cn, getStatusColor } from '@/lib/utils'
import moment from 'moment'
import React from 'react'
import VerifyDnsButton from './_components.tsx/verifyDnsButton'
import DomainSkelton from './_components.tsx/domainSkelton'
import Badge from '@/components/common/badges'
import { AdditonalForm } from './_components.tsx/additonal-form'
import RecordsTable from './_components.tsx/records-table'
import { WorkspaceToggle } from './_components.tsx/workspace-toggle'
export default async function DNSManager({ params }: { params: any }) {
  const { domain } = await params
  const { data } = await serverAxios.get(`/api/v1/admin/domain/${domain}`,{
    withCredentials: true
  })
 
  if (!data.success) {
    return <DomainSkelton />
  }
  const result = data.result as DomainVerificationResponse
  return (
    <div className={`p-4 md:p-6`}>
      <div className="container space-y-6 bg-background text-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-900">
              <Globe className={`absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform ${getStatusColor(result.status)}`} />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Domain</div>
              <h1 className={cn("text-2xl font-bold tracking-tight", getStatusColor(result.status))}>{result.domain_name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.status !== DOMAIN_STATUS.VERIFIED && <VerifyDnsButton id={result.id} />}
            {/* <Button variant="outline" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button> */}
          </div>
        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="CREATED"
            content={
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {moment(result.created_at).fromNow()}
              </div>
            }
          />
          <StatusCard
            title="STATUS"
            content={
              <Badge text={result.status}
                variant={result.status === DOMAIN_STATUS.VERIFIED ? "teal" : result.status === DOMAIN_STATUS.PENDING ? "yellow" : "red"}
              />}
          />
          <StatusCard
            title="REGION"
            content={
              <div className="flex items-center gap-2">

                India
              </div>
            }
          />
          <StatusCard
            title="DNS PROVIDER"
            content={
              <div className="flex items-center gap-2">
                DNS
              </div>
            }
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Addtional Info</CardTitle>
          </CardHeader>
          <CardContent>
            <AdditonalForm domainId={result.id} data={result} />
          </CardContent>
        </Card>

        <WorkspaceToggle
          domainId={result.id}
          domainName={result.domain_name}
          initialEnabled={result.workspace_enabled ?? false}
        />

        {result?.records && (
          <Card>
            <CardHeader>
              <CardTitle>DNS Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-6">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold">DKIM and SPF</h3>
                  <ExternalLink className="h-4 w-4" />
                  <BadgeComponent>Required</BadgeComponent>
                </div>
                <RecordsTable records={result.records} />
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}

function StatusCard({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="mt-1">{content}</div>
      </CardContent>
    </Card>
  )
}

