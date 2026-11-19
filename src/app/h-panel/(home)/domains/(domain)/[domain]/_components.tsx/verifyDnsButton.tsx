"use client"
import { API } from '@/lib/api/handler'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import React from 'react'

const VerifyDnsButton = ({ id }: { id: string }) => {
    const handleVerifyDomain = React.useCallback(async (id: string) => {
        try {
            const { data } = await API.verifyDomain(id)
            if (data.success) {
                window.location.reload()
            }
        } catch (error) {

        }
    }, [])
    return (
        <Button variant="outline" size="sm" onClick={() => handleVerifyDomain(id)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Verify DNS records
        </Button>
    )
}

export default VerifyDnsButton
