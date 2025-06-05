import { cn } from '@/lib/utils';
import React from 'react'

type BadgeVariant = "primary" | "gray" | "teal" | "blue" | "red" | "yellow" | "secondary"
const Badge = ({ text, variant,className }: { text: string, variant?: BadgeVariant ,className?:string}) => {
  let rclassName = "bg-gray-800 text-gray-200 dark:bg-white/10 dark:text-white ";
  switch (variant) {
    case "gray":
      rclassName = "bg-gray-800 text-gray-200 dark:bg-white/10 dark:text-white"
      break;
    case "teal":
      rclassName = "bg-teal-800 text-teal-200 dark:bg-teal-800/40 dark:text-teal-500"
      break;
    case "blue":
      rclassName = "bg-blue-800 text-blue-200 dark:bg-blue-800/30 dark:text-blue-500"
      break;
    case "red":
      rclassName = "bg-red-800 text-red-200 dark:bg-red-800/30 dark:text-red-500"
      break;
    case "yellow":
      rclassName = "bg-yellow-800 text-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-500"
      break;
    case "secondary":
      rclassName = "bg-black text-white dark:bg-white/10 dark:text-white"
      break;
    default:
      rclassName = "bg-neutral-800 text-gray-200 dark:bg-white/10 dark:text-white";
      break;
  }
  return (
    <span className={cn("inline-flex items-center gap-x-1.5 py-1.5 mx-2 px-3 rounded-full text-xs font-medium", rclassName,className)}>
      {text}
    </span>
  )
}

export default Badge