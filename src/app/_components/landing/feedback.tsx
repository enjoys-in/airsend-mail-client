
export const Feedback = () => {
  const data = [
    {
      text: "Auto-configuration",
      desc: "Our email servers support IMAP, POP3, and SMTP by default, so you can configure your email hosting with third-party mail clients, such as Apple Mail, Outlook, Thunderbird, or any other email app on your desktop or mobile device. Automatic configuration will make setting up these apps easier. ",
    },
    {
      text: "User-friendly management",
      desc: "Our email comes with an intuitive control panel. It includes everything you need to manage your email accounts – from device configuration to DNS settings. You can also try our easy-to-use webmail client to send emails, organize mailboxes and emails, and add new contacts.",
    },

    {
      text: "Advanced email messaging security",
      desc: "Their attention to detail and proactive communication make them a pleasure to work with. Our social media presence has never been stronger.",
    },
  ];

  return (
    <div className="px-6 py-8 md:px-12 lg:px-28 md:py-12 lg:py-16 flex flex-col space-y-6 md:space-y-12 relative  bg-gradient-to-b dark:from-[#28292cfe] dark:to-[#2b2c30fe]  bg-neutral-100 text-black">

      <div className="absolute inset-0">
        <div className="absolute top-0 z-[-2] h-24  bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>

      <div className="text-center md:text-left">
        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold dark:text-neutral-200">
          Stay professional with
        </div>
        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold dark:text-neutral-200">
          <span className="text-blue-600">email@yourdomain.com</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-x-5 gap-y-5">
        {data.map((item, index) => (
          <div className="grow min-w-0" key={index}>
            <h2 className="font-bold text-2xl md:text-3xl text-gray-800 dark:text-neutral-200 ">
              {item.text}
            </h2>
            <p className="mt-1 text-gray-600 dark:text-neutral-400  ">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
};