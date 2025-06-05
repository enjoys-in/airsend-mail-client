"use client"
import React from 'react';
import { CrownIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
export default function MyAddresses() {
      const { accounts, currAccount } = useAppSelector((state) => state.accounts)
    
    return (
        <div className=" text-white">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
                <div className="space-y-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-200">My addresses</h1>
                        <p className="text-zinc-400">
                            Use the different types of email addresses and aliases offered by Airsend.{' '}
                            <a href="#" className="text-blue-500 hover:underline">
                                Learn more
                            </a>
                        </p>
                    </div>
                    {/* <ScrollArea className="h-[300px] pr-4">
                  <RadioGroup className="space-y-4">
                    {accountEmailsFields.map((field, index) => (
                      <div key={field.id} className="flex items-center space-x-2 border p-3 rounded-md">
                        <RadioGroupItem
                          id={`account-${index}`}
                          value={field.email}
                          checked={field.isDefault}
                          onClick={() => setDefaultEmail(index)}
                        />
                        <div className="flex flex-1 items-center">
                          <Label htmlFor={`account-${index}`} className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            {field.email}
                          </Label>
                          {field.isDefault && <Badge className="ml-auto">Default</Badge>}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea> */}
                    <div>
                        <Button
                            variant="outline"
                            className="border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300"
                        >
                            <CrownIcon className="w-4 h-4 mr-2 text-yellow-500" />
                            Get more addresses
                        </Button>
                    </div>

                    <div className="bg-[#1C1C1C] rounded-md overflow-hidden">
                        <AddressTable accounts={accounts} />
                    </div>
                </div>
            </div>
        </div>
    );
}



interface AddressProps {
    email: string;
    isDefault: boolean;
    isActive: boolean;
}

const AddressTable: React.FC<{accounts:any[]}> = ({accounts}) => {

  

    return (
        <div className="w-full">
            <div className="grid grid-cols-12 py-4 border-b border-zinc-800 px-4">
                <div className="col-span-4 sm:col-span-5 font-medium text-sm text-zinc-200">
                    Address
                </div>
                <div className="col-span-4 sm:col-span-5 font-medium text-sm text-zinc-200">
                    Status
                </div>
                <div className="col-span-4 sm:col-span-2 font-medium text-sm text-zinc-200 text-right">
                    Actions
                </div>
            </div>

            {accounts.map((address) => (
                <div
                    key={address.email}
                    className="grid grid-cols-12 py-4 border-b border-zinc-800 px-4 items-center"
                >
                    <div className="col-span-4 sm:col-span-5 flex items-center gap-2">
                        <div className="text-zinc-300 flex items-center">
                            <MoreHorizontal className="w-4 h-4 text-zinc-600 mr-2" />
                            <span className="text-sm">{address.email}</span>
                        </div>
                    </div>

                    <div className="col-span-4 sm:col-span-5">
                        <div className="flex space-x-2">
                            {address?.isDefault && (
                                <Badge className="uppercase text-[10px] font-medium">
                                    Default
                                </Badge>
                            )}
                            {address?.isActive && (
                                <Badge className="uppercase text-[10px] font-medium">
                                    Active
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="col-span-4 sm:col-span-2 flex justify-end">
                        <Button variant="outline" size="sm" className="text-xs h-8 px-4 border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300">
                            Edit
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

