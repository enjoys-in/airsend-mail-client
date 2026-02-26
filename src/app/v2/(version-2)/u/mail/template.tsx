import React from 'react'

import { SpotToolbar } from '../../_components/SpotToolbar'
import { MailList } from '../../_components/mail'


const MailTemplate = ({ children }: { children: React.ReactNode }) => {

    return (
        <div>
            <SpotToolbar />
            <MailList >
                {children}
            </MailList>
        </div>
    )
}

export default MailTemplate