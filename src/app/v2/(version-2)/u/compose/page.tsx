"use client"
import { useState, useRef, type KeyboardEvent } from "react";

import EditorClient from '@/components/editor/EditorClient'
import ComposeFooter from './_components/ComposeFooter'
import ComposeHeader from './_components/ComposeHeader'
import ComposeRecipients from './_components/ComposeReciepients'
import { formatBytes, getFileIcon } from '@/lib/utils';





import {
    X,
    Minimize2,
    Maximize2,
    ChevronUp,
    Clock,
    Send,
    Eye,
    Trash2,
    File, FileText,
    FileImage,
    FileIcon as FilePdf,
    Image, Video, Paperclip,
} from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaFileWord } from "react-icons/fa";

type EmailAddress = {
    id: string;
    name: string;
    email: string;
    initial: string;
    color: string;
};

type Recipient = {
    id: string;
    name?: string;
    email: string;
    color: string;
};
function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
export default function EnhancedEmailComposer() {
    const [subject, setSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);

    const [toInput, setToInput] = useState("");
    const [ccInput, setCCInput] = useState("");
    const [bccInput, setBCCInput] = useState("");

    const [toRecipients, setToRecipients] = useState<Recipient[]>([]);
    const [ccRecipients, setCCRecipients] = useState<Recipient[]>([]);
    const [bccRecipients, setBCCRecipients] = useState<Recipient[]>([]);

    const handleMediaUpload = (files: FileList) => {
        Array.from(files).forEach(file => {
            const uploadId = Math.random().toString(36).substring(7);

            // setDialogs({ attachments: [...attachments, { id: uploadId, name: file.name, progress: 0, type: file.type, size: file.size }] });
            // upload progress
            let progress = 0;

        });
    };
    const GetFileIcon = ({ type }: { type: string }) => {

        switch (type) {
            case 'pdf':
                return <FilePdf size={16} className="text-red-500" />;
            case 'docx':
                return <FileText size={16} className="text-blue-500" />;
            case 'text':
                return <FaFileWord size={16} className="text-blue-500" />;
            case 'image':
                return <FileImage size={16} className="text-green-500" />;
            default:
                return <File size={16} className="text-gray-500" />
        }
    }
    const getRandomColor = () => {
        const colors = [
            "bg-blue-600",
            "bg-green-600",
            "bg-purple-600",
            "bg-red-600",
            "bg-yellow-600",
            "bg-pink-600",
            "bg-orange-600",
            "bg-indigo-600",
            "bg-blue-600",
            "bg-violet-600",
            "bg-teal-600",
            "bg-cyan-600",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const addRecipient = (type: "to" | "cc" | "bcc", value: string) => {

        const newRecipient: Recipient = {
            id: Date.now().toString(),
            email: value.trim(),
            color: getRandomColor(),
        };

        if (type === "to") {
            setToRecipients([...toRecipients, newRecipient]);
            setToInput("");
        } else if (type === "cc") {
            setCCRecipients([...ccRecipients, newRecipient]);
            setCCInput("");
        } else if (type === "bcc") {
            setBCCRecipients([...bccRecipients, newRecipient]);
            setBCCInput("");
        }
    };

    const removeRecipient = (type: "to" | "cc" | "bcc", id: string) => {
        if (type === "to") {
            setToRecipients(toRecipients.filter((r) => r.id !== id));
        } else if (type === "cc") {
            setCCRecipients(ccRecipients.filter((r) => r.id !== id));
        } else if (type === "bcc") {
            setBCCRecipients(bccRecipients.filter((r) => r.id !== id));
        }
    };



    return (
        <div className="flex items-center justify-center bg-black/50 mx-auto">
            <div className="w-full dark:bg-[#1e1e1e] bg-neutral-100  dark:text-neutral-200 text-gray-900 rounded-lg shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        <span className="font-medium">{subject}Compose Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {subject}
                    </div>
                </div>
                {/* Email Form */}
                <div className="flex-1 overflow-auto p-2">
                    <div className="space-y-4">
                        <ComposeRecipients type="to" removeRecipient={removeRecipient} addRecipient={addRecipient} recipients={toRecipients as any} />
                        <span className="flex items-center  text-blue-500">
                            <p className="text-xs" onClick={() => setShowCC(!showCC)}>cc</p>
                            <p className="text-xs" onClick={() => setShowBCC(!showBCC)}>bcc</p>
                        </span>
                        {/* CC */}
                        {showCC && (
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <ComposeRecipients type="cc" removeRecipient={removeRecipient} addRecipient={addRecipient} recipients={ccRecipients as any} />

                                </div>
                            </div>
                        )}

                        {/* BCC */}
                        {showBCC && (
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <ComposeRecipients type="bcc" removeRecipient={removeRecipient} addRecipient={addRecipient} recipients={bccRecipients as any} />
                                </div>
                            </div>
                        )}

                        {/* Subject */}
                        <div className="pt-4 flex items-start">
                            <input
                                type="text"
                                value={subject}
                                placeholder="Subject"
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full  border-none text-lg font-medium focus:outline-none dark:bg-[#2e2e2e] bg-neutral-200  px-2 py-1"
                            />
                        </div>

                        <EditorClient />
                    </div>
                </div>
                <div className="pt-4 border-t border-gray-700">
                    <div className="space-y-2">
                        {[
                            {
                                id: 'attachment-1',
                                name: 'attachment-1.jpg',
                                size: '2.5MB',
                                type: 'image/jpeg',
                                progress: 50
                            }
                        ].map((attachment) => (
                            <div key={attachment.id} className="flex items-center dark:bg-neutral-900 bg-neutral-200 p-2 rounded">
                                <div className="flex items-center gap-2 flex-1">
                                    <GetFileIcon type={attachment.type} />
                                    <span className="text-sm truncate">{attachment.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-gray-400">{formatBytes(+attachment.size)}</div>
                                    <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${attachment.progress}%` }}
                                        ></div>
                                    </div>
                                    <button
                                        className="text-gray-400 hover:text-white"
                                    // onClick={() => removeAttachment(attachment.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Footer with new toolbar */}
                <ComposeFooter />
            </div>
        </div>
    );
}
