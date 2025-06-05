import React, { useEffect, useState } from 'react';
import { FileText, Download, FileImage } from 'lucide-react'; // Lucide icons for file types
import type { FileAttachmentInterface } from '@/lib/types/mail.interface';
import { FaFilePdf } from 'react-icons/fa';
import { API } from '@/lib/api/handler';
import { useToast } from '@/components/ui/use-toast';

const FileAttachment = ({ attachments, messageId }: { attachments: FileAttachmentInterface[], messageId: string }) => {
    const { toast } = useToast()

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop();
        switch (ext) {
            case 'pdf':
                return <FaFilePdf className="w-6 h-6 text-red-600" />;
            case 'txt':
                return <FileText className="w-6 h-6 text-gray-300" />;
            case 'jpg':
            case 'png':
                return <FileImage className="w-6 h-6 text-blue-500" />;
            default:
                return <FileText className="w-6 h-6 text-gray-300" />;
        }
    };
    const handleDownload = async (index: number) => {
        try {
            const { data } = await API.downloadAttachment(messageId, index)
            if (!data.success) {
                throw new Error("Error downloading attachment")
            }
            const binaryString = atob(data.result.content);
            const byteArray = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                byteArray[i] = binaryString.charCodeAt(i);
            }


            const url = window.URL.createObjectURL(new Blob([byteArray], { type: data.result.type }));
            const link = document.createElement('a');
            link.href = url;
            link.download = data.result.filename;
            link.click();


        } catch (error) {
            console.log(error)
            toast({
                title: "Error",
                description: "Error downloading attachment",
                variant: "destructive",
            })
        }


    }
    return (
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4  whitespace-pre-wrap px-1 py-4 md:p-4 text-sm rounded-none"  >
            {attachments.map((attachment, index) => (
                <div key={attachment.partId} className="flex items-center justify-between p-3 border border-gray-300 shadow-sm   transition-all sm:w-1/3">
                    <div className="flex items-center space-x-3">
                        <span className="flex-shrink-0 ">{getFileIcon(attachment.filename)}</span>
                        <span className="text-sm font-medium text-gray-200">{attachment.filename}</span>
                    </div>
                    <span
                        onClick={() => handleDownload(index)}

                        className="text-blue-500 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                        aria-label="Download file"
                    >
                        <Download className="w-5 h-5" />
                        <span className="text-xs">Download</span>
                    </span>
                </div>
            ))}
        </div>
    );
};

export default FileAttachment;
