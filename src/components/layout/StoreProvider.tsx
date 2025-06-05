"use client";
import React from 'react'
import { Provider as RTKProvider } from "react-redux";
import { makeStore, AppStore } from "@/store";
 
const StoreProvider = ({ children}: { children: React.ReactNode,  }) => {
    const storeRef = React.useRef<AppStore>(null);
    if (!storeRef.current) storeRef.current = makeStore();
   

   
    return (
        <RTKProvider store={storeRef.current}>
            {children}
        </RTKProvider>
    )
}

export default StoreProvider