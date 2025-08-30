"use client"
import { useEffect } from 'react'
import { LogoImage } from '../logo-image';


const CustomWidget = () => {

    useEffect(() => {
        const splash = document.getElementById("splash");
        let timer: NodeJS.Timeout
        const handleLoad = () => {
            if (splash) {
                splash.remove()

            }
            return
        };
        if (document.readyState === "complete") {
            timer = setTimeout(() => handleLoad(), 500);
        }
        return () => timer && clearTimeout(timer)
    }, []);
    return <div id="splash"
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-[99999] transition-opacity duration-300 dark:bg-black"

    >

        <LogoImage w={500} />
    </div>
}

export default CustomWidget