import React from 'react'

const Test = () => {
  return (
    <div className="px-4">
    {/* Input and Suggestions */}
    <div className="relative">
      {/* Input Field */}
      <textarea
        className="w-full  p-3 border resize-none focus:outline-none   rounded-none"
        placeholder="Type your message..."
        defaultValue={""}
        rows={1}
      />
      {/* Mention Dropdown */}
      {/* <div className="absolute top-10 left-4 bg-stone-700 border shadow-md rounded-lg w-48 max-h-40 overflow-y-auto">
        <ul>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center">
            <img
              src="https://via.placeholder.com/30"
              alt="Avatar"
              className="w-6 h-6 rounded-full mr-2"
            />
            Diana Taylor
          </li>
          <li className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center">
            <img
              src="https://via.placeholder.com/30"
              alt="Avatar"
              className="w-6 h-6 rounded-full mr-2"
            />
            Daniel Anderson
          </li>
        </ul>
      </div> */}
    </div>
    {/* Icons and Buttons */}
    <div className="flex items-center justify-between">
      {/* Icons */}
      <div className="flex space-x-2 text-gray-500">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 11-2.828-2.828L12.344 4.344M18.344 4.344l3.95 3.95a2 2 0 11-2.828 2.828L15.172 7"
            />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 11c0 .838.39 1.581 1 2.055v2.945a4 4 0 11-2 0v-2.945c.61-.474 1-1.217 1-2.055M4 4a8 8 0 1016 0M10 14h4M10 17h4"
            />
          </svg>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2zm0 0V5a2 2 0 012-2h0a2 2 0 012 2v16a2 2 0 01-2 2h-4m0 0v-4m4 4v-4m0 0V5"
            />
          </svg>
        </button>
      </div>
      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-none hover:bg-gray-300">
          Discard
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-none hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  </div>
  )
}

export default Test