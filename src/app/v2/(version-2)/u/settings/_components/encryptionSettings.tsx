"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, Info, LinkIcon } from "lucide-react"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function EncryptionSettings({email}:{email:string}) {
  const [promptTrustKeys, setPromptTrustKeys] = useState(true)
  const [verifyKeysWithTransparency, setVerifyKeysWithTransparency] = useState(true)
  const [signExternalMessages, setSignExternalMessages] = useState(true)
  const [attachPublicKey, setAttachPublicKey] = useState(true)
  const [defaultPgpScheme, setDefaultPgpScheme] = useState("PGP/MIME")

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-white ">Encryption and keys</h1>

        {/* Address and key verification section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Address and key verification</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Prompt to trust keys</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Information about prompting to trust keys</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch checked={promptTrustKeys} onCheckedChange={setPromptTrustKeys} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <span>Verify keys with Key</span>
                <div className="flex items-center gap-2">
                  <span>Transparency</span>
                  <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">BETA</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-80">Information about key transparency</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
            <Switch checked={verifyKeysWithTransparency} onCheckedChange={setVerifyKeysWithTransparency} />
          </div>
        </section>

        {/* External PGP settings section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-500" />
            <h2 className="text-2xl font-bold">External PGP settings</h2>
          </div>

          <p className="text-gray-400">
            Only change these settings if you are using PGP with non-Proton recipients.
            <Link href="#" className="text-blue-500 ml-2">
              Learn more
            </Link>
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Sign external messages</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Information about signing external messages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch checked={signExternalMessages} onCheckedChange={setSignExternalMessages} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Attach public key</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Information about attaching public key</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch checked={attachPublicKey} onCheckedChange={setAttachPublicKey} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Default PGP scheme</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80">Information about PGP schemes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={defaultPgpScheme} onValueChange={setDefaultPgpScheme}>
              <SelectTrigger className="w-[180px] bg-black border-gray-700">
                <SelectValue placeholder="Select scheme" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="PGP/MIME">PGP/MIME</SelectItem>
                <SelectItem value="PGP/INLINE">PGP/INLINE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Email encryption keys section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Email encryption keys</h2>
          <p className="text-gray-400">Download your PGP keys for use with other PGP-compatible services.</p>

          <div className="flex">
            <Button variant="outline" className="bg-black text-white border-gray-700 rounded-r-none">
              Generate key
            </Button>
            <Button variant="outline" className="bg-black text-white border-gray-700 border-l-0 px-2 rounded-l-none">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
