import React, { Suspense } from 'react'
import { MailDisplaySkeleton } from './_components/mail-skeleton'
import { MailDisplay } from './_components/display-body'

const page = async ({ params }: any) => {
  const { folder, message_id } = await params

  return (
    <Suspense fallback={<MailDisplaySkeleton />}>
      <MailDisplay folder={folder} message_id={message_id} />
    </Suspense>
  )
}

export default page