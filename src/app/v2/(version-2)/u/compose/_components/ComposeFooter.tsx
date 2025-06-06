import React, { useState, useRef } from 'react';
import { Paperclip, Wand2, Pen, Send, ChevronDown, Eye, Clock, Bot, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dropdown from '@/components/ui/dropdown';
import { airsendDB } from '@/db';
import { useAppSelector } from '@/store/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
const ComposeFooter: React.FC = () => {
    const { currAccount, accounts } = useAppSelector((state) => state.accounts)

    const [selectedAccount, setSelectedAccount] = useState({
        email: currAccount?.email || '',
        name: currAccount?.name || '',
    });
    const [signatures, setSignatures] = useState<any[]>([]);

    const fetchSignatures = async () => {
        if (!currAccount?.email) {
            return
        }
        const { success, value } = await airsendDB.getNestedItem("settings", currAccount.email as string, "settings.signatures")
        if (success && value) {
            setSignatures(value)
        }
    }
    React.useLayoutEffect(() => {
        if (signatures.length === 0) {
            fetchSignatures()
        }
        setSelectedAccount({
            email: currAccount?.email || '',
            name: currAccount?.name || '',
        })
    }, [currAccount?.email])
    return (

        <div className="px-3 border-t border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Account Dropdown (Always on left) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                {/* Avatar + Account dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 dark:hover:bg-[#2a2a2a] hover:bg-neutral-200 px-2 py-1 rounded transition-colors">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-neutral-400 text-white">
                            {selectedAccount.name[0]}
                        </div>
                        <div className="hidden sm:flex flex-col items-start text-sm">
                            <span>{selectedAccount.name}</span>
                            <span className="text-xs text-gray-400">{selectedAccount.email}</span>
                        </div>
                        <ChevronUp size={14} className="hidden sm:block ml-2 text-gray-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="dark:bg-neutral-900 bg-neutral-100 border-none text-slate-900 dark:text-gray-200">
                        {accounts.map((address) => (
                            <DropdownMenuItem
                                key={address.email}
                                className="flex items-center gap-2 dark:hover:bg-neutral-800 hover:bg-neutral-200 cursor-pointer"
                                onClick={() => setSelectedAccount({ email: address.email, name: address.name })}
                            >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-neutral-400 text-white">
                                    {address.name[0]}
                                </div>
                                <div className="flex flex-col items-start text-sm">
                                    <span>{address.name}</span>
                                    <span className="text-xs text-gray-400">{address.email}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile-only right side: send + menu */}
                <div className="sm:hidden flex items-center gap-2">
                    <Button size="icon" variant="ghost">
                        <Send size={18} className="text-blue-600" />
                    </Button>

                    {/* Mobile menu dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                                <ChevronUp size={18} className="text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="dark:bg-neutral-900 bg-neutral-100 border-none text-slate-900 dark:text-gray-200">
                            <DropdownMenuItem>
                                <Paperclip size={16} />
                                <span>Attach</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Wand2 size={16} />
                                <span>AI</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Pen size={16} />
                                <span>Signatures</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Right Section (hidden on mobile) */}
            <div className="hidden sm:flex gap-2 items-center justify-end mt-2 sm:mt-0">
                <Button variant="ghost" type="button">
                    <Paperclip size={18} className="text-neutral-700 dark:text-neutral-300" />
                </Button>
                <Button variant="ghost" type="button">
                    <Wand2 size={18} className="text-neutral-700 dark:text-neutral-300" />
                </Button>
                <Button variant="ghost" className="text-purple-500 hover:text-purple-400 dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 flex items-center gap-1 p-2 rounded transition-colors">
                AI
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost">
                            <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-neutral-50 dark:bg-neutral-900">
                        {signatures.length > 0 ? (
                            signatures.map((signature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <Button variant="ghost">
                                        <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                                    </Button>
                                    <span>{signature}</span>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button variant="ghost">
                                    <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                                </Button>
                                <span>No signature found</span>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Send Mail Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 transition-colors flex items-center gap-2">
                            <Send size={16} />
                            Send Mail
                            <ChevronUp size={14} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#2a2a2a] border-gray-700 text-white">
                        <DropdownMenuItem className="flex items-center gap-2 hover:bg-[#3a3a3a] cursor-pointer">
                            <Eye size={16} />
                            <span>Preview Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 hover:bg-[#3a3a3a] cursor-pointer">
                            <Clock size={16} />
                            <span>Schedule Email</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 hover:bg-[#3a3a3a] cursor-pointer">
                            <Send size={16} />
                            <span>Send Immediately</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

    );
};

export default ComposeFooter;