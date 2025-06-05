"use client"
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { API } from '@/lib/api/handler'
import { useRouter } from 'next/navigation'
import React from 'react'

const ServerButton = ({ children, key_id, name,domain_id }: { key_id: string, domain_id: string, children: React.ReactNode, name: string }) => {
    const { toast } = useToast()
    const router = useRouter()

    const handleDelete = async () => {
        try {
            const { data } = await API.handleDeleteAPIKey(`${domain_id}?key_name=${name}&key_id=${key_id}`)
            if (!data.success) {
                throw new Error(data.message)
            }
            toast({
                title: data.message
            })
            router.refresh()
        } catch (error: any) {
            toast({
                title: error.message,
                variant: "destructive",
            })
        }
    }
    return (
        <Button variant="ghost" onClick={handleDelete}>{
            children}
        </Button>
    )
}

export default ServerButton