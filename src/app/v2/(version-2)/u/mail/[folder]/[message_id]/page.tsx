import React, { Suspense } from 'react'
import { MailDisplaySkeleton } from './_components/mail-skeleton'
import { MailDisplay } from './_components/display-body'
import ClientDisplay from './_components/client-display'
import ServerMailBody from './_components/server-mail-body'

const page = async ({ params }: any) => {
  const { folder, message_id } = await params

  return (
    <div
      className="flex-1 md:flex-none flex flex-col overflow-auto"
      style={{ height: "calc(100dvh - 80px)" }}
    >
      <ClientDisplay folder={folder} message_id={message_id} />
      <MailDisplay folder={folder} message_id={message_id} >
        <Suspense fallback={<MailDisplaySkeleton />}>
          <ServerMailBody folder={folder} message_id={message_id} />
        </Suspense>
      </MailDisplay>
    </div>

  )
}

export default page