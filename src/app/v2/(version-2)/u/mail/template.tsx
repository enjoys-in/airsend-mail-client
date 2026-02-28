import React from 'react'

import { SpotToolbar } from '../../_components/SpotToolbar'
import { MailList } from '../../_components/mail'
import { MobileMailHeader } from './_components/MobileMailHeader'


const MailTemplate = ({ children }: { children: React.ReactNode }) => {

    return (
        <div>
            <MobileMailHeader />
            <SpotToolbar />
            <MailList >
                {children}
            </MailList>
        </div>
    )
}

export default MailTemplate