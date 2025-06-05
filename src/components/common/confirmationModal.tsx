"use client"


import { useEffect, useState } from 'react'
interface ConfirmationModalProps {
    title: string
    message: string
    onConfirm: () => void
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm }) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasConfirmed = localStorage.getItem('modalConfirmed')
        if (!hasConfirmed) {
            setIsOpen(true)
        }
    }, [])

    const handleConfirm = () => {
        localStorage.setItem('modalConfirmed', 'true')
        setIsOpen(false)
        onConfirm()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900  rounded-lg p-8 max-w-lg w-full">
                <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Airsend Mail is Under Development 🚧</h2>
                    <p className="mb-6">
                        Airsend Mail is currently in active development. While you can continue to send emails without interruption, some features may not work as expected. If you encounter any issues, feel free to click on the <strong>Help</strong> button to raise a request — we’ll aim to fix it promptly!
                    </p>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}
