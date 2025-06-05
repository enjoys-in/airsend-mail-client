"use client"
import EditorClient from '@/components/editor/EditorClient'
import React from 'react'
import ComposeFooter from './_components/ComposeFooter'
import ComposeHeader from './_components/ComposeHeader'
import ComposeRecipients from './_components/ComposeReciepients'

const page = () => {
    return (
        <div className='p-8 flex flex-col gap-1 '>
            <ComposeHeader />
            <ComposeRecipients/>
            <EditorClient />
            <ComposeFooter />
        </div>
    )
}

export default page