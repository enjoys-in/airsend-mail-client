import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AES } from 'crypto-js'
import { jwtDecode } from 'jwt-decode'

import moment from "moment";
import { DOMAIN_STATUS } from "./types/mail.interface";
import { __config } from "@/constants/config";

moment.updateLocale('en', {


  meridiem: function (hour, minute, isLowercase) {
    if (hour >= 12)
      return isLowercase ? 'pm' : 'PM';
    else
      return isLowercase ? 'am' : 'AM';
  }
});
export function validateMailboxSize(value: number, unit: string) {
  let sizeInBytes;

  if (unit === "GB") {
    sizeInBytes = value * 1024 * 1024 * 1024;
  } else if (unit === "MB") {
    sizeInBytes = value * 1024 * 1024;
  } else {
    throw new Error("Invalid unit, must be MB or GB");
  }

  if (sizeInBytes > 1024 * 1024 * 1024 * 1) {

    return false;
  }
  return true;
}
export async function loadUserImage(url: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
export function filterNameAndEmail(inputString: string, email: string, onlyEmail = true) {
  const regex = /['"]?([^'"]+)['"]?\s*<([^>]+)>/;
  const match = inputString.match(regex)

  if (match && onlyEmail) {
    const name = match[1];  // Extracted name
    const email = match[2];
    return `${name} <${email}>`;
  }
  email = match && match[2] ? match[2] : email
  return email;
}

export const fileToArrayBuffer = (file: File): Promise<{ filename: string; content: ArrayBuffer; contentType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        filename: file.name,
        contentType: file.type,
        content: reader.result as ArrayBuffer,
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Convert an array of Files to Base64
export const attachmentsToBase64 = async (files: File[]) => {
  const base64Array = await Promise.all(files.map(file => fileToBase64(file)));
  return base64Array;
};



export const manualDelay = (ms: number) => new Promise(res => setTimeout(res, ms));
export function html2markdown(html: string): string {
  // Basic HTML to Markdown conversion
  return html
    .replace(/<b>(.*?)<\/b>/g, '**$1**')
    .replace(/<i>(.*?)<\/i>/g, '*$1*')
    .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<ul>(.*?)<\/ul>/g, (_, list) =>
      list.replace(/<li>(.*?)<\/li>/g, '- $1\n'))
    .replace(/<ol>(.*?)<\/ol>/g, (_, list) =>
      list.replace(/<li>(.*?)<\/li>/g, '1. $1\n'));
}
export const getEmailStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case "DELIVERED":
    case "OPEN":
    case "LINK OPEN":
      return "bg-emerald-950 text-emerald-400 hover:bg-emerald-950"
    case "UNSUBSCRIBED":
      return "bg-amber-950 text-amber-400 hover:bg-amber-950"
    default:
      return "bg-gray-800 text-gray-400 hover:bg-gray-800"
  }
}
export function formatNameInParts(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {

    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  } else {

    return parts.map(part => part.charAt(0).toUpperCase()).join('');
  }
}
export const getFileIcon = (mimeType: string): string => {
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return '📊';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return '📝';
  if (mimeType.includes('image')) return ''; // Empty for images as they're handled separately
  return '📎'; // Default icon
};

export const formatBytes = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes < 0) {
    return 'Unlimited';
  }
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export const dnsRecordsValue: { [key: number]: string } = {
  1: "A",       // Address record
  2: "NS",      // Name server
  5: "CNAME",   // Canonical name
  6: "SOA",     // Start of authority
  12: "PTR",    // Pointer record
  15: "MX",     // Mail exchange
  16: "TXT",    // Text record
  28: "AAAA",   // IPv6 address record
  33: "SRV",    // Service locator
  41: "OPT",    // Option (EDNS0)
  43: "DS",     // Delegation signer
  46: "RRSIG",  // DNSSEC signature
  47: "NSEC",   // Next secure record
  48: "DNSKEY", // DNSSEC key
  257: "CAA",   // Certification Authority Authorization
  52: "TLSA",
};
export const getColor = (type: string) => {
  switch (type.toUpperCase()) {
    case 'INFO':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80'
    case 'WARN':
    case 'ALERT':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80'
    case 'ERROR':
    case 'CRIT':
      return 'bg-red-100 text-red-800 hover:bg-red-100/80'
    case 'DEBUG':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80'
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80'
  }
}
export function formatEmail(email: string) {

  const cleanedEmail = email
    .replace(/"/g, '') // Remove all double quotes
    .replace(/[^\w\.\-@<>]/g, ''); // Allow alphanumeric, dots, hyphens, @, <, and >

  return cleanedEmail;

}

export function getStatusColor(status: DOMAIN_STATUS) {
  switch (status) {
    case DOMAIN_STATUS.PENDING:
      return "text-yellow-600";
    case DOMAIN_STATUS.VERIFIED:
      return "text-green-600";
    case DOMAIN_STATUS.REJECTED:
      return "text-red-600";
    default:
      return "text-gray-600";
  }
}
export const formattedName = (name: string) => {
  const nameParts = name.split(' ');
  if (nameParts.length > 1) {
    const fname = name?.split(' ')[0]?.charAt(0).toUpperCase();
    const lname = name?.split(' ')[1]?.charAt(0).toUpperCase();
    return `${fname}${lname}`.toLocaleUpperCase();
  }
  return name.slice(0, 2).toLocaleUpperCase();
};
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function dateToFromNowDaily(myDate: Date) {

  // get from-now for this date
  let fromNow = moment(myDate).format('MMM D');

  // ensure the date is displayed with today and yesterday
  return moment(myDate).calendar(null, {
    // when the date is closer, specify custom values
    lastWeek: 'MMM D',
    lastDay: '[Yesterday]',
    sameDay: 'hh:mm A',

    // when the date is further away, use from-now functionality             
    sameElse: function () {
      return "[" + fromNow + "]";
    }
  });
}
export const validateTokenExpiry = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    const exp = (decoded as any).exp;
    const now = Date.now() / 1000;
    if (exp < now) {
      return false;
    }
    return true;

  } catch (error) {
    return false;
  }
}

export const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const isValidTimezone = (timezone: string) => {
  try {
    return Intl.supportedValuesOf('timeZone').includes(timezone);
  } catch (error) {
    return false;
  }
};