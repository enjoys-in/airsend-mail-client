import React from 'react';
import { Avatar, } from "@/components/ui/avatar"

import { Contact } from './types';

interface RecipientSuggestionProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
}

const RecipientSuggestion: React.FC<RecipientSuggestionProps> = ({ contact, onSelect }) => {
  return (
    <div 
      className="px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer transition-colors"
      onClick={() => onSelect(contact)}
    >
      <Avatar name={contact.name} imageUrl={contact.imageUrl} size="sm" />
      <div className="ml-2">
        <div className="font-medium text-gray-800">{contact.name}</div>
        <div className="text-sm text-gray-500">{contact.email}</div>
      </div>
    </div>
  );
};

export default RecipientSuggestion;