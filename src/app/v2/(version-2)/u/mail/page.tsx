"use client"
import { useMailStore } from '@/store/mails'
import {  useRouter } from 'next/navigation'


const page = () => {
  const router = useRouter()
  const { selected_mailbox } = useMailStore()
  return router.push(selected_mailbox ? `/v2/u/mail/${selected_mailbox}` : "/v2/u/mail/inbox")
}

export default page