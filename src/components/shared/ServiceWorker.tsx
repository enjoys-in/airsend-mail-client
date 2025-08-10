"use client"
import { useEffect, Fragment } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/themes/mode-toggle"; import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ReportButton } from "@/components/common/report-feature";
import { ConfirmationModal } from '../common/confirmationModal';
export function ServiceWorker() {
    // useEffect(() => {
    //     const handler = () => {
    //         if ('serviceWorker' in navigator) {
    //             navigator.serviceWorker.register('/worker.js')
    //                 .then(reg => console.log('W'))
    //                 .catch(err => console.error('F'));
    //         }
    //         window.removeEventListener('click', handler);
    //     };

    //     window.addEventListener('click', handler);

    //     return () => window.removeEventListener('click', handler);
    // }, []);


    return (
        <Fragment>
            <SonnerToaster visibleToasts={5} />
            <Toaster />
            <ModeToggle />
            <ReportButton />
            <ConfirmationModal title="Confirmation" message="It's Under Development" onConfirm={() => { }} />
        </Fragment>
    );
}
