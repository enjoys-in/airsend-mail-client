"use client"
import React, { useState } from 'react'
import { SmtpConfigForm, SmtpConfigFormProps } from '../../providers/_components/smtp-config-form'

export const RelayForm = () => {
    const [defaultValues, setDefaultValues] = useState<SmtpConfigFormProps["defaultValues"]>({})
    const handleSubmit = (id:string, config:SmtpConfigFormProps["defaultValues"]) => { }
    return (
        <div>
            <SmtpConfigForm onSave={handleSubmit} providerId='d' defaultValues={{}} />
        </div>
    )
}
