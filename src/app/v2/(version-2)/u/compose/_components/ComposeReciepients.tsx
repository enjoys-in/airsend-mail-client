import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import RecipientChip from './RecipientChip';
import RecipientSuggestion from './RecipientSuggestion';
import { Contact } from './types';

function isValidEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

const ComposeRecipients: React.FC = () => {
  const [toRecipients, setToRecipients] = useState<Contact[]>([]);
  const [ccRecipients, setCcRecipients] = useState<Contact[]>([]);
  const [bccRecipients, setBccRecipients] = useState<Contact[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [activeField, setActiveField] = useState<'to' | 'cc' | 'bcc'>('to');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Contact[]>([]);

  const [showCC, setShowCC] = useState(false);
  const [showBCC, setShowBCC] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const allContacts: Contact[] = []; // Replace with actual contact list

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allContacts.filter(contact =>
        contact.name.toLowerCase().includes(inputValue.toLowerCase()) ||
        contact.email.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const getActiveList = () => {
    if (activeField === 'cc') return ccRecipients;
    if (activeField === 'bcc') return bccRecipients;
    return toRecipients;
  };

  const setActiveList = (list: Contact[]) => {
    if (activeField === 'cc') setCcRecipients(list);
    else if (activeField === 'bcc') setBccRecipients(list);
    else setToRecipients(list);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addEmail = (email: string) => {
    const clean = email.trim().replace(',', '');
    if (!isValidEmail(clean)) return;
    const currentList = getActiveList();
    if (currentList.some(r => r.email === clean)) return;

    const newContact: Contact = {
      id: `new-${Date.now()}`,
      name: clean.split('@')[0],
      email: clean,
    };

    setActiveList([...currentList, newContact]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && inputValue.trim()) {
      e.preventDefault();
      addEmail(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && getActiveList().length > 0) {
      setActiveList(getActiveList().slice(0, -1));
    }
  };

  const handleAddRecipient = (contact: Contact) => {
    const currentList = getActiveList();
    if (!currentList.some(r => r.id === contact.id)) {
      setActiveList([...currentList, contact]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveRecipient = (id: string, field: 'to' | 'cc' | 'bcc') => {
    const listSetter = field === 'cc' ? setCcRecipients : field === 'bcc' ? setBccRecipients : setToRecipients;
    const list = field === 'cc' ? ccRecipients : field === 'bcc' ? bccRecipients : toRecipients;
    listSetter(list.filter(r => r.id !== id));
  };

  const renderRecipientField = (label: string, list: Contact[], field: 'to' | 'cc' | 'bcc') => (
    <div className="flex items-start gap-2 mb-2">
      <div className="w-10 pt-2 text-sm text-neutral-700 dark:text-neutral-300">{label}</div>
      <div
        className={`flex flex-wrap items-center flex-1 min-h-[38px] px-2 py-[3px] rounded-md border bg-neutral-50 dark:bg-neutral-800 transition-all duration-200 ${
          isFocused && activeField === field
            ? 'border-blue-500 ring-1 ring-blue-500'
            : 'border-neutral-300 dark:border-neutral-600'
        }`}
        onClick={() => {
          setActiveField(field);
          inputRef.current?.focus();
        }}
      >
        {list.map(recipient => (
          <RecipientChip
            key={recipient.id}
            contact={recipient}
            onRemove={() => handleRemoveRecipient(recipient.id, field)}
          />
        ))}
        {activeField === field && (
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              setActiveField(field);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            placeholder={list.length === 0 ? `Enter ${label}` : ''}
          className="flex-1 outline-none placeholder:text-neutral-500 dark:placeholder:text-neutral-400 bg-transparent focus:outline-none"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="relative max-w-2xl">
      {renderRecipientField('To:', toRecipients, 'to')}

      {showCC ? renderRecipientField('Cc:', ccRecipients, 'cc') : (
        <button className="ml-10 text-xs text-blue-600 hover:underline" onClick={() => setShowCC(true)}>Add Cc</button>
      )}

      {showBCC ? renderRecipientField('Bcc:', bccRecipients, 'bcc') : (
        <button className="ml-2 text-xs text-blue-600 hover:underline" onClick={() => setShowBCC(true)}>Add Bcc</button>
      )}

      {showSuggestions && (
        <div className="absolute z-10 mt-1 w-full max-w-2xl bg-neutral-50 dark:bg-neutral-800 rounded-md shadow-lg border border-neutral-200 dark:border-neutral-600 py-1 max-h-60 overflow-y-auto">
          {filteredSuggestions.map(contact => (
            <RecipientSuggestion
              key={contact.id}
              contact={contact}
              onSelect={handleAddRecipient}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComposeRecipients;
