import React from 'react'

import { SpotToolbar } from '../../_components/SpotToolbar'
import { MailList } from '../../_components/mail'
import { MobileMailHeader } from './_components/MobileMailHeader'


const MailTemplate = ({ children }: { children: React.ReactNode }) => {

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <MobileMailHeader />
            <SpotToolbar />
            <MailList>
                {children}
            </MailList>
        </div>
    )
}

export default MailTemplate