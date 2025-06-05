import React, { useState, useRef } from 'react';
import { Paperclip, Wand2, Pen, Send, ChevronDown, Eye, Clock, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Dropdown from '@/components/ui/dropdown';
import { airsendDB } from '@/db';
import { useAppSelector } from '@/store/hooks';


import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
const ComposeFooter: React.FC = () => {
    const currAccount = useAppSelector((state) => state.accounts.currAccount);
    const [isSignatureOpen, setIsSignatureOpen] = useState(false);
    const [isSendOptionsOpen, setIsSendOptionsOpen] = useState(false);
    const [signatures, setSignatures] = useState<any[]>([]);
    const signatureBtnRef = useRef<HTMLButtonElement>(null);
    const sendBtnRef = useRef<HTMLButtonElement>(null);

    const sendOptions = [
        { id: 'preview', label: 'Preview', icon: Eye },
        { id: 'schedule', label: 'Schedule send', icon: Clock },
    ];
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
    }, [currAccount?.email])
    return (
        <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 sm:px-6 py-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                {/* Left controls (attachments, wand, signature) */}
                <div className="flex items-center space-x-2">
                    <Button variant="ghost">
                        <Paperclip size={18} className="text-neutral-700 dark:text-neutral-300" />
                    </Button>

                    <Button variant="ghost">
                        <Wand2 size={18} className="text-neutral-700 dark:text-neutral-300" />
                    </Button>
                    <div
                        className="absolute z-40 opacity-50 hover:opacity-100 transition-opacity"
                    //   style={{
                    //     left: `${position.x}px`,
                    //     top: `${position.y}px`,
                    //   }}
                    >
                        <button
                            // onClick={onPrompt}
                            className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                            title="Get AI assistance"
                        >
                            <Bot className="w-5 h-5" />
                        </button>
                    </div>

                    <div>
                        <Popover

                        >
                            <PopoverTrigger asChild>
                                <Button
                                    ref={signatureBtnRef}
                                    variant="ghost"
                                    onClick={() => setIsSignatureOpen(!isSignatureOpen)}
                                >
                                    <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-80 bg-neutral-50 dark:bg-neutral-900'>
                                {signatures.length > 0 ?
                                    signatures.map((signature, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Button variant="ghost">
                                                <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                                            </Button>
                                            <span>{signature}</span>
                                        </div>
                                    )
                                    ) :
                                    <div className="flex items-center space-x-2">
                                        <Button variant="ghost">
                                            <Pen size={18} className="text-neutral-700 dark:text-neutral-300" />
                                        </Button>
                                        <span>No signature found</span>
                                    </div>
                                }
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Send button and options */}
                <div className="flex items-center">
                    <div className="relative flex">
                        <Button
                            className="rounded-r-none border-r border-neutral-300 dark:border-neutral-600"
                            onClick={() => console.log('Send email')}
                        >
                            <Send size={16} className="mr-2" />
                            Send
                        </Button>

                        <Button
                            ref={sendBtnRef}
                            className="rounded-l-none px-2"
                            onClick={() => setIsSendOptionsOpen(!isSendOptionsOpen)}
                        >
                            <ChevronDown size={16} />
                        </Button>
                    </div>

                    {isSendOptionsOpen && (
                        <Dropdown
                            items={sendOptions.map(option => ({
                                id: option.id,
                                content: (
                                    <div className="flex items-center">
                                        <option.icon size={16} className="mr-2" />
                                        <span>{option.label}</span>
                                    </div>
                                )
                            }))}
                            onSelect={(id) => {
                                console.log(`Selected option: ${id}`);
                                setIsSendOptionsOpen(false);
                            }}
                            onClickOutside={() => setIsSendOptionsOpen(false)}
                            anchorEl={sendBtnRef.current}
                            position="top"
                            align="end"
                        />
                    )}
                </div>
            </div>
        </div>

    );
};

export default ComposeFooter;