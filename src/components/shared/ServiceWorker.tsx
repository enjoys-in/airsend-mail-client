"use client"
import { useEffect, Fragment } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/themes/mode-toggle"; 
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ReportButton } from "@/components/common/report-feature";
import { registerAppServiceWorker } from "@/lib/sw-url";

export function ServiceWorker() {
    // Registers the app's service worker (static-file caching + push) once the page has loaded, production only.
    // See workbox-config.js for what it caches and src/lib/sw-url.ts for why there is a single URL.
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
        const register = () => {
            registerAppServiceWorker().catch((error) => console.warn("Service worker not registered:", error));
        };
        if (document.readyState === "complete") register();
        else window.addEventListener("load", register, { once: true });
        return () => window.removeEventListener("load", register);
    }, []);

    return () => window.removeEventListener('click', handler);
    // }, []);


    return (
        <Fragment>
            <SonnerToaster visibleToasts={5} />
            <Toaster />
            <ModeToggle />
            <ReportButton />
        </Fragment>
    );
}
