import Image from "next/image"
import MailboxForm from "./_components/mailbox-form"

export default function Home() {
    return (
        <main className="dark:bg-black bg-slate-100 h-screen">
            <h1 className="text-3xl py-4 font-bold text-center mb-8 dark:text-gray-300 text-slate-100">Disposable Mailbox</h1>
            <div className="container bg-card rounded-none shadow-lg p-4  ">
                <MailboxForm />
            </div>
            <div className="flex justify-center items-center py-10 dark:bg-black bg-slate-100">
                <Image className="hidden dark:block" alt="airsend-logo" src={"/navbar-logo.png"} width={512} height={512} />
                <Image alt="airsend-logo" className="dark:hidden block" src={"/navbar-logo-light.png"} width={512} height={512} />
            </div>
        </main>
    )
}

