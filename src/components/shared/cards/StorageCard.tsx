import { Button } from '@/components/ui/button';
import { cn, formatBytes } from '@/lib/utils';
import React from 'react'

const StorageCard = ({ 
  total,
  used,
}: {
  used: number;
  total: number;
 
}) => {
  const percent = Math.round((used / total) * 100);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="!z-5  max-h-[368px] relative flex h-full w-full flex-col rounded-[20px] e bg-clip-border p-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-800 dark:text-white dark:shadow-none">

        <div className="mb-auto flex flex-col items-center justify-center">
          <div className="mt-2 flex items-center justify-center rounded-full bg-lightPrimary p-[26px] text-5xl font-bold text-brand-500 dark:!bg-navy-700 dark:text-white">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth={0}
              viewBox="0 0 16 16"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.354 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"
              />
              <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
            </svg>
          </div>
          <h4 className="mb-px mt-3 text-2xl font-bold text-navy-700 dark:text-white">
            Your storage
          </h4>
          <p className="px-5 text-center text-base font-normal text-gray-400 md:!px-0 xl:!px-8">
            Supervise your drive space in the easiest way
          </p>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between">
            <span className={cn(`text-xs font-bold`, percent < 80 ? `text-blue-500 dark:text-zinc-50` : "text-red-600 dark:text-red-500")}>
              {formatBytes(used)}
            </span>
            <span className="text-xs text-zinc-400">{formatBytes(total)}</span>
          </div>

          <div className="h-[4px] mt-1 flex w-full items-center rounded-full bg-zinc-300 dark:bg-zinc-300">
            <LinearProgressBar progress={percent} />
          </div>
          <Button variant="secondary" className="mt-2 w-40">Buy More</Button>
        </div>
      </div>
    </div>

  )
}

export function LinearProgressBar({ progress ,width=350}: { progress: number, width?: number }) {

  const height = 12;
  let gradientStops = [];
  if (progress <= 25) {
    gradientStops = [
      { offset: "0%", color: "#4CAF50" }, // Green
      { offset: "100%", color: "#4CAF50" }, // Green
    ];
  } else if (progress <= 50) {
    gradientStops = [
      { offset: "0%", color: "#4CAF50" }, // Green
      { offset: `${((progress - 25) / 25) * 100}%`, color: "#FFC107" }, // Yellow
    ];
  } else if (progress <= 75) {
    gradientStops = [
      { offset: "0%", color: "#4CAF50" }, // Green
      { offset: "50%", color: "#FFC107" }, // Yellow
      { offset: `${((progress - 50) / 25) * 100 + 50}%`, color: "#FF5722" }, // Orange
    ];
  } else {
    gradientStops = [
      { offset: "0%", color: "#4CAF50" }, // Green
      { offset: "50%", color: "#FFC107" }, // Yellow
      { offset: "75%", color: "#FF5722" }, // Orange
      { offset: "100%", color: "#D50000" }, // Red
    ];
  }
  return (
    // <motion.div
    //   key="daily"
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   exit={{ opacity: 0, y: -20 }}
    //   transition={{ duration: 0.3 }}
    //   className="w-full max-w-md"
    // >
    //   <svg
    //     className="transform -rotate-90 w-full h-full"
    //     viewBox="0 0 300 300"
    //   >
    //     <circle
    //       cx="150"
    //       cy="150"
    //       r={radius}
    //       className="stroke-gray-800"
    //       strokeWidth="12"
    //       fill="none"
    //     />
    //     <motion.circle
    //       cx="150"
    //       cy="150"
    //       r={radius}
    //       className="transition-all duration-1000"
    //       stroke="url(#gradient)"
    //       strokeWidth="12"
    //       strokeLinecap="round"
    //       fill="none"
    //       initial={{ strokeDashoffset: circumference }}
    //       animate={{ strokeDashoffset }}
    //       transition={{ duration: 1, ease: "easeInOut" }}
    //       style={{
    //         strokeDasharray: circumference,
    //       }}
    //     />
    //     <defs>
    //       <linearGradient id="gradient" gradientTransform="rotate(90)">
    //         <stop offset="0%" stopColor="#4CAF50" />
    //         <stop offset="25%" stopColor="#8BC34A" />
    //         <stop offset="50%" stopColor="#CDDC39" />
    //         <stop offset="75%" stopColor="#FFC107" />
    //         <stop offset="100%" stopColor="#FF5722" />
    //       </linearGradient>
    //     </defs>

    //   </svg>
    //   <AnimatePresence mode="wait">
    //     <motion.div
    //       key={1}
    //       initial={{ scale: 0.5, opacity: 0 }}
    //       animate={{ scale: 1, opacity: 1 }}
    //       exit={{ scale: 0.5, opacity: 0 }}
    //       transition={{ duration: 0.3 }}
    //       className="absolute inset-0 flex flex-col items-center justify-center"
    //     >
    //       <span className="text-5xl font-light">{1}</span>
    //       <span className="text-sm opacity-70 mt-2">STEPS</span>
    //     </motion.div>
    //   </AnimatePresence>
    // </motion.div>
    <div className="relative w-full h-[4px]  rounded overflow-hidden">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute top-0 left-0"
      >
        {/* Background Rectangle */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="#e5e5e5"
          rx="6" // Rounded corners
        />
        {/* Progress Rectangle */}
        <rect
          x="0"
          y="0"
          width={(progress / 100) * width}
          height={height}
          fill="url(#gradient)"
        />
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, index) => (
              <stop
                key={index}
                offset={stop.offset}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default StorageCard