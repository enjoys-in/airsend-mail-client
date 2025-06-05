import React from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, } from "@/components/ui/avatar"
import { Contact } from './types';

interface RecipientChipProps {
  contact: Contact;
  onRemove: (id: string) => void;
}

const RecipientChip: React.FC<RecipientChipProps> = ({ contact, onRemove }) => {
  return (
    <div className="inline-flex items-center bg-blue-50 text-blue-800 rounded-full px-2 py-1 m-0.5 text-sm group animate-fadeIn">
      <div className="flex items-center">
        <Avatar>
          <AvatarFallback>{contact.name[0]}</AvatarFallback>
        </Avatar>
        <span className="ml-1.5 max-w-[150px] truncate">{contact.email}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(contact.id);
        }}
        className="ml-1 rounded-full p-0.5 hover:bg-blue-200 transition-colors duration-150"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default RecipientChip;