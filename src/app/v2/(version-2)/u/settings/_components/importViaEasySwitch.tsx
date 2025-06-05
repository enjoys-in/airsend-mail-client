import Badge from "@/components/common/badges";

export default function ImportViaEasySwitch({email}:{email:string}) {
  return (
    <div className="  p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-12 text-white ">Import Emails <Badge text="Comming Soon" variant="blue" className="text-4xl font-bold mb-12" /> </h1>

        {/* Set up forwarding section */}
        <div className="border border-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Set up forwarding</h2>
          <p className="text-gray-400 mb-5">
            Forward incoming mail from another account to your secure Airsend inbox.
          </p>
          <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
            <span className="text-red-500 font-bold">G</span>
            <span>Set up auto-forwarding from Gmail</span>
          </button>
        </div>

        {/* One time import section */}
        <div className="border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">One time import</h2>
          <p className="text-gray-400 mb-5">Bring your messages, contacts and calendars to Proton.</p>
          <div className="space-y-3">
            <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <span className="text-red-500 font-bold">G</span>
              <span>Import from Google</span>
            </button>
            <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <span className="text-purple-500 font-bold">Y</span>
              <span>Import from Yahoo</span>
            </button>
            <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <span className="text-blue-500 font-bold">O</span>
              <span>Import from Outlook</span>
            </button>
            <button disabled className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
              <span>Import from other</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
