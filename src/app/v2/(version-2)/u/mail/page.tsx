import { redirect } from 'next/navigation'


const page = () => {
  return redirect("/v2/u/mail/inbox")
}

export default page