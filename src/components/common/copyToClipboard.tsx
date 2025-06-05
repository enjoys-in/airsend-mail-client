"use client"
import { CopyIcon } from 'lucide-react';
import React from 'react'

import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';


const CopyToClipboard = ({ text }: { text: string }) => {
  const { toast } = useToast()
  const copyToClipboard = () => {
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    })
    navigator.clipboard.writeText(text);
  }
  return (<Button onClick={copyToClipboard} variant="ghost" size={"sm"}>
    <CopyIcon className='cursor-pointer h-4 w-4' />
  </Button>)

}

export default CopyToClipboard