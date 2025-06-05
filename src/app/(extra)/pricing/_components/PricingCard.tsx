interface PricingPlan {
  title: string;
  description: string;
  popular: boolean;
  price: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  features: {
    name: string;
    available: boolean;
  }[];
  terms: string[];
  cta: {
    text: string;

    style: string;
  };
}
const PAY_AS_YOU_GO: PricingPlan[] = [
  {
    "title": "Professional",
    "description": "Everything a small startup or growing team needs.",
    "popular": true,
    "price": {
      "amount": 149.99,
      "currency": "INR",
      "billingCycle": "monthly"
    },
    "features": [
      {
        "name": "Up to 10-50 people",
        "available": true
      },
      {
        "name": "Calendar & Scheduling",
        "available": true
      },
      {
        "name": "Team Chat & Channels",
        "available": true
      },
      {
        "name": "Reports & Analytics",
        "available": false
      },
      {
        "name": "Security & Admin Controls",
        "available": false
      },
      {
        "name": "Cloud-Native & Mobile-Ready",
        "available": false
      }
    ],
    "terms": [
      "3 days free trial.",
      "No card required."
    ],
    "cta": {
      "text": "Start free trial",
      "style": "border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none px-4 py-3 text-sm font-medium rounded-none"
    }
  }
  , {
    title: "Teams",
    description: "For growing businesses.",
    "popular": false,
    price: {
      amount: 260.99,
      currency: "INR",
      billingCycle: "monthly",
    },
    features: [
      { name: "Up to 50-100 people", available: true },
      { name: "Service desk", available: true },
      { name: "Custom branding", available: true },
      { name: "Custom Tickets", available: true },
      { name: "Product support", available: true },
      { name: "Activity reporting", available: true },
    ],
    terms: ["1 day free trial", "No card required."],
    cta: {
      text: "Start free trial",

      style:
        "py-3 px-4 inline-flex rounded-none items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none",
    },
  },
]
export const PricingCard = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {PAY_AS_YOU_GO.map((plan, index) => (
        <div key={index}>
          <div
            className="shadow-xl shadow-gray-200 p-5 relative z-10 bg-white border border-gray-200 rounded-xl md:p-10"
          >
            <h3 className="text-xl font-bold text-gray-800">{plan.title}</h3>
            <div className="text-sm text-gray-500">{plan.description}</div>
            {/* Badge */}
            {plan.popular && (
              <span className="absolute top-0 end-0 rounded-se-xl rounded-es-xl text-xs font-medium bg-gray-800 text-white py-1.5 px-3">
                Most popular
              </span>
            )}

            <div className="mt-5">
              <span className="text-6xl font-bold text-gray-800">
                ₹{Math.floor(plan.price.amount)}
              </span>
              <span className="text-lg font-bold text-gray-800">
                .{(plan.price.amount % 1).toFixed(2).split(".")[1]}
              </span>
              <span className="ms-3 text-gray-500">
                {plan.price.currency} / {plan.price.billingCycle}
              </span>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-y-2 py-4 sm:gap-x-6 sm:gap-y-0">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex gap-x-3">
                  <span className="mt-0.5 size-5 flex justify-center items-center rounded-full bg-blue-50 text-blue-600">
                    <svg
                      className="shrink-0 size-3.5"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-gray-800">{feature.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-4 py-4">
              <div>
                {plan.terms.map((term, idx) => (
                  <p key={idx} className="text-sm text-gray-500">
                    {term}
                  </p>
                ))}
              </div>
              <div className="flex justify-end">
                <button type='button' className={plan.cta.style}>
                  {plan.cta.text}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

  );
};