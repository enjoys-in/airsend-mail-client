import React from 'react'

const Notifications = () => {
    return (
        <div className="relative w-full max-w-sm">
        <ul>
          <li className="border-b border:gray-100 dark:border-gray-600">
            <a
              href="#"
              className="flex items-center justify-center w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {/* <img
                className="me-3 rounded-full w-11 h-11"
                src="/docs/images/people/profile-picture-1.jpg"
                alt="Jese Leos Avatar"
              /> */}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  New message from{" "}
                  <span className="font-medium text-gray-900 dark:text-white">
                    Jese Leos
                  </span>
                  : cvcv
                </p>
                <span className="text-xs text-blue-600 dark:text-blue-500">
                  a few moments ago
                </span>
              </div>
            </a>
          </li>
        
        </ul>
        
      </div>
       

    )
}

export default Notifications