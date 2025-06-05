"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { InfoIcon as InfoCircle } from "lucide-react"
import Link from "next/link"
import LabelSettings from "./labelSettings"

export default function FoldersAndLabels({email}:{email:string}) {
  const [useFolderColors, setUseFolderColors] = useState(true)
  const [inheritColor, setInheritColor] = useState(true)

  return (
    <div className="   p-8">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold  text-white">Folders and labels</h1>
          <p className="text-gray-400">
            Keep your inbox organized with folders and labels.{" "}
            <Link href="#" className="text-blue-500 hover:underline">
              Learn more
            </Link>
          </p>
        </div>

        {/* Folders Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Folders</h2>

          <div className="flex items-center justify-between">
            <label htmlFor="folder-colors" className="text-gray-300">
              Use folder colors
            </label>
            <Switch
              id="folder-colors"
              checked={useFolderColors}
              onCheckedChange={setUseFolderColors}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label htmlFor="inherit-color" className="text-gray-300">
                Inherit color from parent folder
              </label>
              <InfoCircle className="h-5 w-5 text-gray-500" />
            </div>
            <Switch
              id="inherit-color"
              checked={inheritColor}
              onCheckedChange={setInheritColor}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          <div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add folder</Button>
          </div>
        </div>

        {/* Labels Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Labels</h2>
          <div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Add label</Button>
          </div>
        </div>
      </div>
      {/* <LabelSettings/> */}
    </div>
  )
}
