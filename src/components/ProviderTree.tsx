"use client"
import { IndexDbProvider } from '@/context/IndexDbContext'
import React from 'react'

const ProviderTree = ({ children }: { children: React.ReactNode }) => {
    return (
        <IndexDbProvider>
            {children}
        </IndexDbProvider>
    )
}

export default ProviderTree