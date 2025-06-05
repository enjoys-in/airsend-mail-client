import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';



const ComposeHeader: React.FC = () => {
  const { currAccount, accounts } = useAppSelector((state) => state.accounts)

  const [selectedAccount, setSelectedAccount] = useState({
    email: currAccount?.email || '',
    name: currAccount?.name || '',
  });
  const [isOpen, setIsOpen] = useState(false);
  React.useEffect(() => {

  }, [currAccount?.email])
  return (
    <div className="relative">
      <div
        className="flex  space-x-2 cursor-pointer py-2  border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">From:</span>
        <div className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span>
            {selectedAccount.name}{' '}
            <span className="text-gray-500 dark:text-gray-400">
              &lt;{selectedAccount.email}&gt;
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''
              }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full max-w-md  border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 py-1 overflow-auto max-h-60">
          {accounts.map(account => (
            <div
              key={account.email}
              className={`px-4 py-2 flex items-center justify-between cursor-pointer 
              hover:bg-gray-100 dark:hover:bg-gray-700 
              ${selectedAccount.email === account.email
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200'
                }`}
              onClick={() => {
                setSelectedAccount({
                  email: account.email || '',
                  name: account.name || '',
                });
                setIsOpen(false);
              }}
            >
              <div>
                <div>{account.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{account.email}</div>
              </div>
              {selectedAccount.email === account.email && (
                <Check size={16} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>

  );
};

export default ComposeHeader;