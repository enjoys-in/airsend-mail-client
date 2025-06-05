import React from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { KeyRound, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button'
import { APIKeyForm } from './_components/APIKeyForm'
import { Card } from '@/components/ui/card';
import serverAxios from '@/lib/api/serverAxios';
import { SomethingWentWrong } from '@/components/common/SomethingWentWrong';
import moment from 'moment';
import CopyToClipboard from '@/components/common/copyToClipboard';
import ServerButton from './_components/server-button';
import { Badge } from '@/components/ui/badge';
import StickyNote from './_components/StickyNote';
interface API_Response {
    id: number,
    name: string,
    api_key: string,
    api_secret: '6d777ab919d566870c574519a7955501',
    created_at: Date | string,
    used_times: number,
    updated_at: Date | string,
    domain: { id: string }
}
const page = async () => {
    try {
        const { data } = await serverAxios.get("/admin/api-keys") as {
            data: {
                success: boolean,
                message: string,
                result: API_Response[]
            }
        }
        if (!data.success) throw new Error(data.message)

        return (
            <div>
                <ScrollArea className="h-[400px] rounded-none border-b">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Key Name</TableHead>
                                <TableHead className="w-[100px]">API Key</TableHead>
                                <TableHead className="w-[100px]">API Secret</TableHead>
                                <TableHead className="w-[100px]">Created At</TableHead>
                                <TableHead className="w-[100px]">Used Times</TableHead>
                                <TableHead className="w-[100px]">Last Time Used</TableHead>
                                <TableHead className="w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.result.length > 0 ? data.result.map((item: any) => (
                                <TableRow key={item.id}>
                                    <TableCell className="">{item.name}</TableCell>
                                    <TableCell className="items-center"><CopyToClipboard text={item.api_key} />  {item.api_key.substring(0, 10)}******</TableCell>
                                    <TableCell className="items-center"><CopyToClipboard text={item.api_secret} />  *********************</TableCell>
                                    <TableCell className='font-sans'>{moment(item.createdAt).format("YYYY-MM-DD hh:mm:ss A")}</TableCell>
                                    <TableCell className='font-sans'>{item.used_times}</TableCell>
                                    <TableCell className='font-sans'>{moment(item.updated_at).format("YYYY-MM-DD hh:mm:ss A")}</TableCell>
                                    <TableCell>
                                        <ServerButton key_id={item.id} name={item.name} domain_id={item.domain.id}><Trash2 className="h-4 w-4" color='red' /></ServerButton>
                                    </TableCell>
                                </TableRow>
                            )) : (<TableRow>
                                <TableCell colSpan={7} className="text-center">No API keys found</TableCell>
                            </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>

                <Sheet>
                    <SheetTrigger className='w-full'>
                        <Button className='mt-4 bg-orange-400 rounded-none mx-auto' variant="outline">Generate API Credentials</Button>
                    </SheetTrigger>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle className='flex items-center gap-2'>
                                <KeyRound className="h-6 w-6" />Generate API Credentials <Badge variant="secondary">Beta</Badge></SheetTitle>
                        </SheetHeader>
                        <SheetDescription className='text-muted-foreground mt-4'>
                            Create a new API key and secret for your application.
                        </SheetDescription>
                        <div className="flex justify-end space-x-2">
                            <APIKeyForm />
                        </div>
                    </SheetContent>
                </Sheet>
                <StickyNote/>

            </div>
        )
    } catch (error) {
        return <SomethingWentWrong />
    }
}

export default page