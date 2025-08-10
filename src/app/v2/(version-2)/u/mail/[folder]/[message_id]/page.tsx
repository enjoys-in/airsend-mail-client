import React, { Suspense } from 'react'
import { MailDisplaySkeleton } from './_components/mail-skeleton'
import { MailDisplay } from './_components/display-body'
import ClientDisplay from './_components/client-display'

const page = async ({ params }: any) => {
  const { folder, message_id } = await params

  return (
    <Suspense fallback={<MailDisplaySkeleton />}>
      <ClientDisplay folder={folder} message_id={message_id} />
      {/* <MailDisplay folder={folder} message_id={message_id} /> */}
    </Suspense>
  )
}

export default page