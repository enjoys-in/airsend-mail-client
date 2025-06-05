"use client"


import { useToast } from '@/components/ui/use-toast'
import { useCookies } from '@/hooks/useCookies'
import { useSockets } from '@/hooks/useSockets'
import { API } from '@/lib/api/handler'
import { useAppDispatch } from '@/store/hooks'
import { setCurrAccount } from '@/store/slices/account'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TempMailWarningProps {
    onAccept: () => void
    onDeny: () => void

}

export function TempMailWarning() {

    const handleAccept = () => {

    }

    const handleDeny = async () => {
        try {


        } catch (error) {

        }
    }



    return (
        <div className="">
            <ConsentModal onAccept={handleAccept} onDeny={handleDeny} />
        </div>
    )
}
const ConsentModal: React.FC<TempMailWarningProps> = ({
    onAccept,
    onDeny,

}) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasConsent = localStorage.getItem('user_consent')
        // if (!hasConsent) {
        // setIsOpen(true)
        // }
    }, [])

    const handleAccept = () => {
        localStorage.setItem('user_consent', 'accepted')
        setIsOpen(false)
        onAccept()
    }

    const handleDeny = () => {
        localStorage.setItem('user_consent', 'denied')
        setIsOpen(false)
        onDeny()
    }


    if (!isOpen) return null

    return (
        <div className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-semibold text-gray-900">
                        AirSend is Temporarily Closed 💔
                    </h2>
                </div>

                <p className="mt-4 text-sm text-red-500">
                    We're deeply sorry, but we’ve had to pause our services due to financial constraints. Keeping our servers running has become impossible due to financial struggles. This isn’t goodbye—we’ll be back soon, stronger than ever!

                    Thank you for your support and patience. 🙏💙
                </p>

                {/* <button
                    onClick={() => { }}
                    className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                >
                    Learn more
                </button> */}

                <div className="mt-6 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        onClick={handleAccept}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Okay
                    </button>
                    {/* <button
                        onClick={handleDeny}
                        className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Deny
                    </button> */}

                </div>
            </div>
        </div>
    )
}



