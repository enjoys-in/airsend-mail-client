"use client"
import { useEffect, useState } from 'react'
import { LogoImage } from '../logo-image';

const CustomWidget = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>

        const handleLoad = () => {
            setVisible(false);
        };

        if (document.readyState === "complete") {
            timer = setTimeout(handleLoad, 500);
        } else {
            window.addEventListener("load", () => {
                timer = setTimeout(handleLoad, 1500);
            });
        }

        return () => timer && clearTimeout(timer)
    }, []);

    if (!visible) return null;

    return (
        <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black z-[99999] transition-opacity duration-300 dark:bg-black"
        >
            <LogoImage w={500} />
        </div>
    )
}

export default CustomWidget
