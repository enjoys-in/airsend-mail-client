"use client"
import { API } from '@/lib/api/handler'
import { Button } from '@/components/ui/button'
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
        <Button variant="outline" onClick={() => handleVerifyDomain(id)}>
            Verify DNS Records
        </Button>
    )
}

export default VerifyDnsButton