"use client"
import { useMailStore } from '@/store/mails'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const MailRedirectPage = () => {
  const router = useRouter()
  const selected_mailbox = useMailStore((state) => state.selected_mailbox)

  useEffect(() => {
    router.replace(selected_mailbox ? `/v2/u/mail/${selected_mailbox}` : "/v2/u/mail/inbox")
  }, [router, selected_mailbox])

  return null
}

export default MailRedirectPage