import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import React from 'react'

const page = async({ params }: { params: any }) => {
 
  return (
    <React.Fragment>
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <div className="flex-1 lg:max-w-2xl">
          <h1 className="text-2xl font-bold text-white tracking-tight">Hi </h1>
          This page is Comming Soon
        </div>
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          
          <div className="flex flex-col items-center py-10">
            <Image
              className="w-24 h-24 mb-3 rounded-full shadow-lg"
              src="/user.png"
              width={100}
              height={100}
              alt="Bonnie image"
            />
            <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
              Mullayam
            </h5>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              mullayam06@cozin.co
            </span>
            <div className="flex mt-4 md:mt-6">

            </div>
          </div>
        </div>

      </div>
    </React.Fragment>
  )
}

export default page