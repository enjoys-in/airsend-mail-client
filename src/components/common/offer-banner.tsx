import Link from "next/link"
import React from "react"

export default function OfferBbanner() {
  return (
    <section className="">
      <div className="alert alert-dismissible fade show items-center justify-between  bg-green-600 px-6 py-2 text-center text-white md:flex md:text-left">
        <div className="mb-4 flex flex-wrap items-center justify-center md:mb-0 md:justify-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 384 512"
            className="mr-2 h-4 w-4"
          >
            <path
              fill="currentColor"
              d="M216 23.86c0-23.8-30.65-32.77-44.15-13.04C48 191.85 224 200 224 288c0 35.63-29.11 64.46-64.85 63.99-35.17-.45-63.15-29.77-63.15-64.94v-85.51c0-21.7-26.47-32.23-41.43-16.5C27.8 213.16 0 261.33 0 320c0 105.87 86.13 192 192 192s192-86.13 192-192c0-170.29-168-193-168-296.14z"
            />
          </svg>
          <strong className="mr-1">Need Custom Domain Mail?</strong> Get Your Own Domain Name, Mail box me Dila Dunga wo bhi Free of Cost.
        </div>
        <div className="flex items-center justify-center">
          <Link
            className="mr-4 inline-block rounded bg-white px-6 py-2.5 text-xs font-medium uppercase leading-tight text-gray-700 shadow-md transition duration-150 ease-in-out hover:bg-gray-100 hover:shadow-lg focus:bg-gray-100 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-200 active:shadow-lg"
            href="/h-panel"
            role="button"
            data-mdb-ripple="true"
            data-mdb-ripple-color="light"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}