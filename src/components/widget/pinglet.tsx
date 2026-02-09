"use client"
import Script from 'next/script'
import React from 'react'

const PingletWidget = () => {
    return <Script
        type="module"
        crossOrigin="anonymous"
        src="https://cdn.jsdelivr.net/npm/@enjoys/pinglet@latest/pinglet-sse.js"
        data-endpoint="https://pinglet.enjoys.in/api/v1/notifications"
        data-configured-domain="airsend.in"
        data-templates="1"
        data-project-id="b13bafb4a588ce5f218a2a23"
        data-pinglet-id="BCrKaGlL0RJW9fQBs5B0EKWRofh9qinbOyfvziI4KT8GQundhP6h8i-gcR-lJl_cZ02SNoya2QXsAWbQc1NbNTU"
        data-checksum="sha384-bt2+37hfBbS8dxEUfbyk7QYPqeaSU/22+ZdVPh3xC1lMUeTKGl1UPg6wjiW0EkkN"
        data-load-templates="true"
    />
}

export default PingletWidget