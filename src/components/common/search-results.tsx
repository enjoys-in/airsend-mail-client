import Image from 'next/image'
import React from 'react'

function SearchResults() {
  return (
    <div className="absolute shadow bg-white top-100 z-40 md:w-[100px] lg:w-[300px] mt-2 lef-0 rounded max-h-select overflow-y-auto svelte-5uyqqj">
    <div className="flex flex-col w-full">
        <div className="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100">
            <div className="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                <div className="w-6 flex flex-col items-center">
                    <div className="flex relative   bg-orange-500 justify-center items-center m-1 mr-2 w-4 h-4 mt-1 rounded-full ">
                        <Image className="rounded-full" alt="A" src="https://randomuser.me/api/portraits/men/62.jpg" /> </div>
                </div>
                <div className="w-full items-center flex">
                    <div className="mx-2 -mt-1  ">Jack jhon
                        <div className="text-xs truncate w-full normal-case font-normal -mt-1 text-gray-500">CEO &amp; managin director</div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
</div>
  )
}

export default SearchResults