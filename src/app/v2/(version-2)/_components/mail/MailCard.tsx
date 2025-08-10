"use client"
import { airsendDB } from '@/db';
import React, { useCallback, useEffect } from 'react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Archive, Flag, MoreVertical } from "lucide-react";
import { Badge } from '@/components/ui/badge';

import { cn, dateToFromNowDaily, filterNameAndEmail, formattedName } from '@/lib/utils';
import { useMailStore } from '@/store/mails';
import { RiAttachment2 } from '@remixicon/react';

import { useParams, useRouter } from 'next/navigation';
import { EmailContextMenu } from './EmailContextMenu';

import { GetAllMailsPayload } from '@/lib/types/mail.interface';
import { Security } from '@/lib/security';

export const MailCard = ({ item }: { item: GetAllMailsPayload }) => {
    const router = useRouter()
    const params = useParams()
    const { setSelectedMail } = useMailStore()
    const [hovered, setHovered] = React.useState(false);
    const { checkedItems, setCheckedItems } = useMailStore()

    const handleCheckChange = useCallback(
        (id: string, isChecked: boolean) => {
            if (isChecked) {
                setCheckedItems([...checkedItems, id])
            } else {
                setCheckedItems(checkedItems.filter((itemId) => itemId !== id))
            }
        },
        [checkedItems]
    )
    const anyChecked = checkedItems.length > 0;
    const handleClick = async () => {
        const data = await airsendDB.getItemByKey("mails", item.message_id) as any | null
        if (data) {
            setSelectedMail(data)
        }
        router.push(`/v2/u/mail/${params?.folder}/${item.message_id}`,)
    }
    const handleHoveredIconClick = (action: string) => {
        console.log(action)
    }
    useEffect(() => { }, [checkedItems])

    return (
        <EmailContextMenu>
            <div
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                className={cn("bg-neutral-200 dark:bg-neutral-800 dark:border-neutral-900 hover:dark:border-neutral-800 duration-300 ease-in-out border cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-900 rounded-none shadow-sm hover:shadow-lg transition-all",)}>

                <div className="flex justify-between items-center py-0 px-2">
                    <div className="flex items-center">
                        {(hovered || anyChecked) ? (
                            <Checkbox
                                className="mr-2 rounded-none transition-all duration-300 ease-in-out "
                                checked={checkedItems.includes(item.message_id)}
                                onClick={(e) => e.stopPropagation()}
                                onCheckedChange={(isChecked) => handleCheckChange(item.message_id, !!isChecked)}
                            />
                        ) :
                            <div className="h-4 w-4 mr-2" />
                        }
                        <div className="relative z-0 mr-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-green-500 text-sm bg-muted-foreground/50 dark:bg-neutral-700" >{formattedName(filterNameAndEmail(Security.DecryptFromString(item.from_email), Security.DecryptFromString(item.from_email)))}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className='flex items-center text-sm'>
                            <span className="font-medium flex items-center justify-center gap-2">
                                {!item.is_read && <span className="inline-block w-2 h-2 bg-green-500 rounded-full mx-2"></span>}

                                {filterNameAndEmail(Security.DecryptFromString(item.from_email), Security.DecryptFromString(item.from_email))}
                            </span>
                            <span className="text-gray-500 ml-1">(4)</span>
                        </div>
                        <div className="flex items-center gap-2 w-[50rem] overflow-hidden text-sm ml-4">
                            <div className="font-medium  truncate">
                                {item?.subject}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-[30rem]">
                                {Security.DecryptFromString(item?.plain_text) || item?.plain_text}
                            </div>
                        </div>
                        <div>
                            {
                                item?.hasAttachment && item?.hasAttachment === true && Array.isArray(item.hasAttachment) && (
                                    <div className="flex items-center ml-2">
                                        {item.hasAttachment.length < 3 ?
                                            item.hasAttachment.map((attachment, index) => (
                                                <Badge key={index} className="ml-1 items-center text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-0.5">
                                                    <span className="mr-1 text-xs"><RiAttachment2 /></span>
                                                    <span>{attachment.name}</span>
                                                </Badge>
                                            ))
                                            :
                                            <Badge className=" ml-4  items-center text-gray-500 text-xs border border-gray-200 rounded-full px-2 py-0.5">
                                                <span className="mr-1 text-xs "><RiAttachment2 className='w-4 h-4' /></span>
                                                <span>{item.hasAttachment.length}</span>
                                            </Badge>
                                        }
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <div>
                        <div className="flex items text-sm text-gray-500">
                            <div className="relative min-h-[48px] flex flex-col justify-center w-full">
                                <div className={`transition-all duration-300 ease-in-out flex items-center self-end pt-0`}>
                                    {hovered ?
                                        <div
                                            className={`flex gap-2.5 transition-opacity duration-300 ease-in-out ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                            <button className="hover:text-yellow-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("starred");
                                            }}>
                                                <Star size={16} />
                                            </button>
                                            <button className="hover:text-blue-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("Flag");
                                            }}>
                                                <Flag size={16} />
                                            </button>
                                            <button className="hover:text-green-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("Archive");
                                            }}>
                                                <Archive size={16} />
                                            </button>
                                            <button className="hover:text-red-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("Trash2");
                                            }}>
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="hover:text-cyan-500 transition-colors duration-200" onClick={(e) => {
                                                e.stopPropagation();
                                                handleHoveredIconClick("more");
                                            }}>
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                        :
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Badge className="text-xs font-bold">personal</Badge>
                                            </div>
                                            <span className='ml-2'>{dateToFromNowDaily(new Date(item?.timestamp as string))}</span>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </EmailContextMenu>
    )
}

