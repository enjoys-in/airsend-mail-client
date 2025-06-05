import { EmailProviderForm } from "./_components/email-provider-form"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-200">Email Provider Configuration</h1>
      <EmailProviderForm />
    </main>
  )
}

