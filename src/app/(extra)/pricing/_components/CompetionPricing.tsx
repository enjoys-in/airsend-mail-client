import React from "react";

const ProvidersPricingCompare = [
  {
    name: "Zoho",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
  {
    name: "Resend",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
  {
    name: "MS Office 365",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
  {
    name: "GoDaddy",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
  {
    name: "Google Workspace",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
  {
    name: "Hostinger",
    price: "$0.00",
    plan_name: "Free",
    features: [
      { service: "Domains", text: "1", icon: "check",available: true },
      { service: "Per Day Email", text: "300", icon: "check" },
      { service: "Mailboxes", text: "Up to 5", icon: "check" },
      { service: "Storage", text: "5 GB", icon: "check" },
    ],
  },
];
const CompetionPricing = () => {
  return (
    <div className="relative">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 md:py-14 lg:py-20 mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
          <h2 className="text-2xl font-bold md:text-3xl md:leading-tight dark:text-white">
            Simple, transparent pricing
          </h2>
          <p className="mt-1 text-gray-600 dark:text-neutral-400">
            Increase your teams productivity. Get things done in rapid time.
          </p>
        </div>
        <div className="relative after:absolute after:inset-x-0 after:bottom-0 after:z-10 after:w-full after:h-48 after:bg-linear-to-t after:from-white after:via-white/70 dark:after:from-neutral-900 dark:after:via-neutral-900/95">
          <div className="hidden lg:block sticky top-0 start-0 py-2 bg-white dark:bg-neutral-900">
            {/* Grid */}
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-2">
                <div className="h-full"></div>
              </div>
              {ProvidersPricingCompare.map((plan, index) => (
                <div className="col-span-1" key={index}>
                  <div className="h-full p-4 flex flex-col justify-between bg-white border border-gray-200 rounded-xl dark:bg-neutral-900 dark:border-neutral-800">
                    <div>
                      <span className="font-semibold text-lg text-gray-800 dark:text-neutral-200">
                        {plan.name}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-gray-50 dark:bg-transparent dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:bg-neutral-800">
                        {plan.plan_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* End Grid */}
          </div>

          {/* Section */}
          <div className="space-y-4 lg:space-y-0">
            {/* List */}
            <ul className="grid lg:grid-cols-6 lg:gap-6">
              {/* Item */}
              <li className="lg:col-span-2 lg:py-3">
                <span className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                  General
                </span>
              </li>
              {/* End Item */}
              {/* Item */}
              <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
              {/* End Item */}
              {/* Item */}
              <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
              {/* End Item */}
              {/* Item */}
              <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
              {/* End Item */}
              {/* Item */}
              <li className="hidden lg:block lg:col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center"></li>
              {/* End Item */}
            </ul>
            {ProvidersPricingCompare.map((plan, index) => plan.features.map((feature, iindex) => (
              <ul className="grid lg:grid-cols-6 lg:gap-6" key={index + iindex}>
                {/* Item */}
                <li className="lg:col-span-2 pb-1.5 lg:py-3">
                  <span className="text-sm text-gray-800 dark:text-neutral-200">
                    {feature.service}
                  </span>
                </li>
                <li className="col-span-1 py-1.5 lg:py-3 px-4 lg:px-0 lg:text-center bg-gray-100 dark:bg-neutral-800">
                  <div className="grid grid-cols-6 lg:block">
                    <span className="lg:hidden col-span-2 font-semibold text-sm text-gray-800 dark:text-neutral-200">
                      {plan.name}
                    </span>
                    <span className="text-sm text-gray-800 dark:text-neutral-200">
                      {feature.text}
                    </span>
                  </div>
                </li>
              </ul>)
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            className="hs-collapse-toggle hs-collapse-open:rounded-full hs-collapse-open:px-3 group py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-full border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 focus:outline-hidden focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
            id="view-all-features"
            aria-expanded="false"
            aria-controls="view-all-features-button"
            data-hs-collapse="#view-all-features-button"
          >
            <span className="hs-collapse-open:hidden">View all features</span>
            <svg
              className="hidden hs-collapse-open:block group-hover:rotate-180 transition duration-300 shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
};

export const NotAvailable = () => (
  <svg
    className="shrink-0 lg:mx-auto size-5 text-gray-400 dark:text-neutral-600"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
  </svg>
);
export const Available = () => (
  <svg
    className="shrink-0 lg:mx-auto size-5 text-blue-600 dark:text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default CompetionPricing;
