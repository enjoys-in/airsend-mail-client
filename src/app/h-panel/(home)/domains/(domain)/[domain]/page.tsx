import { Pill, PageHeader, PageShell, Section, Stat, StatGrid } from '@/components/h-panel/kit'
import serverAxios from '@/lib/api/serverAxios'
import { DOMAIN_STATUS, DomainVerificationResponse } from '@/lib/types/mail.interface'
import moment from 'moment'
import React from 'react'
import VerifyDnsButton from './_components.tsx/verifyDnsButton'
import DomainSkelton from './_components.tsx/domainSkelton'
import { AdditonalForm } from './_components.tsx/additonal-form'
import RecordsTable from './_components.tsx/records-table'
import { WorkspaceToggle } from './_components.tsx/workspace-toggle'
import { DomainTabs } from './_components.tsx/domain-tabs'
import { DomainStatusPill } from '../../_components/domain-status'

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
    <PageShell>
      <PageHeader
        back={{ href: "/h-panel/domains", label: "Domains" }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span className="break-all">{result.domain_name}</span>
            <DomainStatusPill status={result.status} />
          </span>
        }
        description="DNS records and settings for this domain."
        actions={result.status !== DOMAIN_STATUS.VERIFIED ? <VerifyDnsButton id={result.id} /> : undefined}
      />

      <DomainTabs domainId={result.id} active="overview" />

      <div className="space-y-5">
        <StatGrid>
          <Stat label="Created" value={<span className="text-base">{moment(result.created_at).fromNow()}</span>} />
          <Stat label="Status" value={<DomainStatusPill status={result.status} />} />
          <Stat label="Region" value={<span className="text-base">India</span>} />
          <Stat label="DNS provider" value={<span className="text-base">DNS</span>} />
        </StatGrid>

        {result?.records && (
          <Section
            title="DNS records"
            description="DKIM and SPF records to publish at your DNS provider."
            actions={<Pill tone="amber">Required</Pill>}
            flush
          >
            <RecordsTable records={result.records} />
          </Section>
        )}

        <Section title="Additional info" description="List this domain publicly and choose whether it is free or premium.">
          <AdditonalForm domainId={result.id} data={result} />
        </Section>

        <WorkspaceToggle
          domainId={result.id}
          domainName={result.domain_name}
          initialEnabled={result.workspace_enabled ?? false}
        />
      </div>
    </PageShell>
  )
}
