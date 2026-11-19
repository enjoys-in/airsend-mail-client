import React from 'react'
import serverAxios from '@/lib/api/serverAxios';
import { SomethingWentWrong } from '@/components/common/SomethingWentWrong';
import StickyNote from './_components/StickyNote';
import { ApiKeysView, type ApiKeyRow } from './_components/api-keys-view';

const page = async () => {
    try {
        const { data } = await serverAxios.get("/api/v1/admin/api-keys") as {
            data: {
                success: boolean,
                message: string,
                result: ApiKeyRow[]
            }
        }

        if (!data.success) throw new Error(data.message)

        return (
            <>
                <ApiKeysView keys={data.result} />
                <StickyNote />
            </>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}

export default page
