import React from 'react'
import { Available, NotAvailable } from './CompetionPricing'

const PLAN_DETAILS = [
  { feature: "Number of Domains", free: "10", startup: "Up to 25", scaler: "Up to 50", professional: "Unlimited", team: "Up to 10", },
  { feature: "Mailboxes", free: "Unlimited", startup: "Unlimited", scaler: "Unlimited", professional: "Unlimited", team: "Unlimited", },
  { feature: "Storage", free: "1 GB", startup: "25 GB", scaler: "50 GB", professional: "Unlimited", team: "Unlimited", },
  { feature: "Attachments Size Limit", free: "100 MB", startup: "500 MB", scaler: "true", professional: "true", team: "true", },
  { feature: "Per Day Emails", free: "300", startup: "600", scaler: "850", professional: "100", team: "1000", },
  { feature: "Incoming Outgoing Logs", free: "-", startup: "-", scaler: "true", professional: "true", team: "true", },
  { feature: "Mail Tracking", free: "-", startup: "", scaler: "", professional: "", team: "Unlimited", },
  { feature: "Relay Server", free: "-", startup: "-", scaler: "-", professional: "-", team: "Unlimited", },
  { feature: "Ip Whitelist/Blacklist", free: "-", startup: "-", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Domain Whitelist/Blacklist", free: "-", startup: "-", scaler: "true", professional: "", team: "Unlimited", },
  { feature: "Per User Limit", free: "-", startup: "-", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Alerts", free: "-", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Mail Exchanger", free: "-", startup: "-", scaler: "-", professional: "-", team: "true", },
  { feature: "Drag & Drop Editor", free: "true", startup: "true", scaler: "true", professional: "true", team: "true", },
  { feature: "Email Templates", free: "10", startup: "25", scaler: "50", professional: "Unlimited", team: "Unlimited", },
  { feature: "Email Forwarding", free: "-", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Email Aliases", free: "", startup: "10", scaler: "30", professional: "Unlimited", team: "Unlimited", },
  { feature: "UseEmail Alises as SMTP", free: "-", startup: "-", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Catch All Emails", free: "5", startup: "25", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Multi SMTP", free: "-", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Anti Spam", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Anti Virus", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Anti Phishing", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Anti Malware", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Auto Responder", free: "-", startup: "5", scaler: "20", professional: "Unlimited", team: "Unlimited", },
  { feature: "Auto Forwarder", free: "-", startup: "10", scaler: "30", professional: "Unlimited", team: "Unlimited", },
  { feature: "API", free: "true", startup: "true", scaler: "true", professional: "true", team: "true", },
  { feature: "Req Limit/min on Send", free: "3", startup: "25", scaler: "60", professional: "100", team: "Unlimited", },
  { feature: "Req Limit/min on Get", free: "10", startup: "50", scaler: "100", professional: "200", team: "Unlimited", },
  { feature: "RealTime Mail Receive", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Integrations", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Calender", free: "true", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "SMTP", free: "true", startup: "true", scaler: "true", professional: "true", team: "true", },
  { feature: "IMAP", free: "-", startup: "true", scaler: "true", professional: "true", team: "Unlimited", },
  { feature: "Campaigns", free: "true", startup: "25", scaler: "250", professional: "Unlimited", team: "Unlimited", },
  { feature: "Organization", free: "1", startup: "10", scaler: "25", professional: "Unlimited", team: "Unlimited", },
  { feature: "Workspace", free: "-", startup: "-", scaler: "true", professional: "true", team: "Available", },
  { feature: "Webhooks", free: "5", startup: "20", scaler: "100", professional: "Unlimited", team: "Unlimited", },


]
const ComparePlanDetails = () => {
  return (
    <div className="relative">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 md:py-14 lg:py-20 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-3xl md:leading-tight text-gray-800 dark:text-neutral-300">Compare Our plans</h2>
        </div>

        <div className="hidden lg:block sticky top-0 start-0 py-2 bg-white/95 dark:bg-neutral-900/95 will-change-transform">
          <div className="grid grid-cols-7 gap-6">
            <div className="col-span-2">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300">
                Features
              </span>
            </div>


            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300">
                Free
              </span>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-300">
                Free forever
              </p>
            </div>

            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300">
                Startup
              </span>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-300">
                ₹29 per month
              </p>
            </div>


            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300" >
                Scaler
              </span>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-300">

                ₹44 per month
              </p>
            </div>


            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300">
                Professional
              </span>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-300">
                ₹149 per month
              </p>
            </div>
            <div className="col-span-1">
              <span className="font-semibold text-lg text-gray-800 dark:text-neutral-300">
                Teams
              </span>
              <p className="mt-2 text-sm text-gray-500 dark:text-neutral-300">
                ₹260 per month
              </p>
            </div>
          </div>

        </div>

        <div className="space-y-4 lg:space-y-0">
          {
            PLAN_DETAILS.map((plan, index) => (
              <ul className="grid lg:grid-cols-7 lg:gap-6" key={index}>
                <li className="lg:col-span-2 pb-1.5 lg:py-3">
                  <span className="font-semibold lg:font-normal text-sm text-gray-800 dark:text-neutral-300">
                    {plan.feature}

                  </span>
                </li>

                <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                    <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-neutral-300">
                      Free
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-300">

                      <ValidInput text={plan.free} />

                    </span>
                  </div>
                </li>

                <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                    <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-neutral-300">
                      Startup
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-300">
                      <ValidInput text={plan.startup} />
                    </span>
                  </div>
                </li>
                <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                    <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-neutral-300">
                      Scaler
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-300">
                      <ValidInput text={plan.scaler} />
                    </span>
                  </div>
                </li>
                <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                    <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-neutral-300">
                      Professional
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-300">
                      <ValidInput text={plan.professional} />
                    </span>
                  </div>
                </li>
                <li className="col-span-1 py-1.5 lg:py-3 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-6 lg:block">
                    <span className="lg:hidden md:col-span-2 text-sm text-gray-800 dark:text-neutral-300">
                      Teams
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-300">
                      <ValidInput text={plan.team} />
                    </span>
                  </div>
                </li>
              </ul>
            ))
          }




        </div>

        {/* <div className="hidden lg:block mt-6">
          
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-2">
            </div>
          

            <div className="col-span-1">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50" href="#">
                Get started
              </a>
            </div>
          

            <div className="col-span-1">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none" href="#">
                Get started
              </a>
            </div>
          

            <div className="col-span-1">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50" href="#">
                Get started
              </a>
            </div>
          

            <div className="col-span-1">
              <a className="w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50" href="#">
                Get started
              </a>
            </div>

          </div>

        </div> */}




      </div>
    </div>
  )
}
const ValidInput = ({ text }: { text: string }) => {
  return text === "true" ? <Available /> : text === "-" ? <NotAvailable /> : text
}
export default ComparePlanDetails