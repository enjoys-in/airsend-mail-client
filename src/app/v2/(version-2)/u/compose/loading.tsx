import { LogoImage } from '@/components/logo-image'
import React from 'react'

const loading = () => {
    return (
        <section className='h-screen w-full flex justify-center items-center bg-black'>
            <div className='flex items-center justify-center gap-3 text-8xl'>
                <LogoImage />
            </div>
            <div className="loader" />
        </section>
    )
}

export default loading
