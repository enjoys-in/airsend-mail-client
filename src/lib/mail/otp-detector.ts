/**
 * OTP / Security Verification Code Detector for Airsend Mail Client
 *
 * Automatically detects one-time passwords (OTPs), verification codes,
 * and security codes from email subjects, plain text bodies, and HTML content.
 * Supports:
 * - New emails (e.g. "Your Vercel security code: 489362")
 * - Forwarded emails ("Fwd: ...", "FW: ...", forwarded body blocks)
 * - Reply emails ("Re: ...", thread replies)
 */

export interface OtpInfo {
  code: string;
  displayCode: string;
  digits: string[];
  title: string;
  service?: string;
  expiresIn?: string;
  isReply: boolean;
  isForward: boolean;
}

/** Strip HTML tags, styles, scripts, and entities to plain text */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip reply and forward prefixes from email subject */
export function cleanSubject(subject: string): { clean: string; isReply: boolean; isForward: boolean } {
  if (!subject) return { clean: "", isReply: false, isForward: false };
  let s = subject.trim();
  let isReply = false;
  let isForward = false;

  let changed = true;
  while (changed) {
    changed = false;
    const repMatch = s.match(/^(?:re|aw|vs|rv)\s*:\s*/i);
    if (repMatch) {
      isReply = true;
      s = s.slice(repMatch[0].length).trim();
      changed = true;
      continue;
    }
    const fwdMatch = s.match(/^(?:fwd?|fw|wg|forward)\s*:\s*/i);
    if (fwdMatch) {
      isForward = true;
      s = s.slice(fwdMatch[0].length).trim();
      changed = true;
      continue;
    }
    const bracketMatch = s.match(/^\[(?:external|secure|sandbox|fwd|fw)\]\s*/i);
    if (bracketMatch) {
      if (/fwd|fw/i.test(bracketMatch[0])) isForward = true;
      s = s.slice(bracketMatch[0].length).trim();
      changed = true;
      continue;
    }
  }

  return { clean: s, isReply, isForward };
}

/** Check if candidate string meets OTP code requirements (4 to 8 characters, alphanumeric/digits) */
export function isValidCode(cand: string): boolean {
  if (!cand) return false;
  const clean = cand.replace(/[^A-Za-z0-9]/g, "");
  if (clean.length < 4 || clean.length > 8) return false;
  // Discard 4-digit years like 2020..2035 unless surrounded by explicit code label
  if (clean.length === 4 && /^20[2-3][0-9]$/.test(clean)) return false;
  // Discard all identical characters like "0000" or "999999"
  if (/^(.)\1+$/.test(clean)) return false;
  return true;
}

/**
 * Detect OTP / Security Code from email subject and body
 */
export function detectOtp(
  subject?: string | null,
  bodyText?: string | null,
  bodyHtml?: string | null,
  fromEmail?: string | null
): OtpInfo | null {
  const { clean: sClean, isReply: sReply, isForward: sForward } = cleanSubject(subject || "");
  const plain = stripHtml(bodyText || bodyHtml || "");

  const fullText = `${sClean}\n${plain}`;

  // Check for reply / forward in body if not in subject
  const isReply = sReply || /in_replied_to/i.test(plain) || /on\s+.+wrote:\s*$/im.test(plain);
  const isForward = sForward || /---------- forwarded message ---------/i.test(plain) || /begin forwarded message/i.test(plain);

  // OTP Context keywords - ensures we don't extract false positives from normal emails
  const contextPatterns = [
    /\b(?:otp|one[- ]time (?:password|passcode|code|pin)|passcode)\b/i,
    /\b(?:verification|security|login|access|confirmation|authentication|auth|validation|activation)\s+code\b/i,
    /\bverify (?:your )?(?:account|email|identity|device|login)\b/i,
    /\bconfirm (?:your )?(?:account|email|identity|action|device|login)\b/i,
    /\bcode requested\b/i,
    /\buse (?:this|the) code\b/i,
    /\benter (?:this|the|following) code\b/i,
    /\bhere is your (?:[\w\s]{0,15}\s+)?code\b/i,
    /\byour (?:[\w\s]{0,15}\s+)?code is\b/i,
    /\bcode expires\b/i,
    /\b(?:two[- ]factor|2fa|multi[- ]factor|mfa)\b/i,
    /\bpassword reset (?:code|pin)\b/i,
    /\breset your password\b/i,
    /\bsteam guard\b/i,
  ];

  const hasOtpContext = contextPatterns.some((pattern) => pattern.test(fullText));
  if (!hasOtpContext) {
    return null;
  }

  // Detect service name if possible (e.g. "Vercel", "Google", "GitHub")
  let service = "";
  const serviceMatch =
    sClean.match(/^(?:your\s+)?([A-Za-z0-9]+)\s+(?:security|verification|login|confirmation)\s+code/i) ||
    sClean.match(/^([A-Za-z0-9]+):\s+(?:your\s+)?verification\s+code/i);
  if (serviceMatch) {
    service = serviceMatch[1];
  } else if (fromEmail) {
    const domainMatch = fromEmail.match(/@(?:[a-z0-9-]+\.)*([a-z0-9-]+)\.[a-z]{2,}/i);
    if (domainMatch && !["gmail", "outlook", "yahoo", "hotmail", "mail"].includes(domainMatch[1].toLowerCase())) {
      service = domainMatch[1].charAt(0).toUpperCase() + domainMatch[1].slice(1);
    }
  }

  // Detect expiration if mentioned
  let expiresIn = "";
  const expMatch = fullText.match(/\b(?:expires|valid for|valid)\s+(?:in\s+)?(\d+\s+(?:minutes?|mins?|hours?|seconds?|secs?))\b/i);
  if (expMatch) {
    expiresIn = `Expires in ${expMatch[1]}`;
  }

  let code = "";

  // Direct patterns with code capture
  const directPatterns = [
    // "Use this code [to complete sign in]: 489362" or "Enter this code: 489362"
    /(?:use|enter|here is|your)\s+(?:this|the|your)?\s*code[^\n\r:.]{0,40}[:\s]+([A-Za-z0-9]{1,4}[-\s]?[A-Za-z0-9]{3,6})\b/i,

    // "Your Vercel security code: 489362" or "Your Uber code: 4920"
    /(?:your|the)?\s*[\w\s]{0,20}\s*(?:security|verification|confirmation|login|access|auth|authentication|one[- ]time|activation|validation|uber|steam|guard)?\s*code[^\n\r:.]{0,40}[:\s\-]+([A-Za-z0-9]{1,4}[-\s]?[A-Za-z0-9]{3,6})\b/i,

    // "489362 is your verification code"
    /\b([A-Za-z0-9]{1,4}[-\s]?[A-Za-z0-9]{3,6})\s+is your (?:[\w\s]{0,20}\s+)?(?:security|verification|confirmation|login|access|auth|one[- ]time)?\s*code\b/i,

    // Google format "G-123456"
    /\b(G\-[0-9]{6})\b/i,

    // "OTP: 123456" or "Passcode: 123456"
    /(?:otp|passcode|pin)[^\n\r:.]{0,30}[:\s]+([0-9]{4,8})\b/i,

    // "Code Requested: 123456"
    /code requested[^\n\r:.]{0,30}[:\s]+([A-Za-z0-9]{4,8})\b/i,
  ];

  // Try subject first
  for (const pat of directPatterns) {
    const m = sClean.match(pat);
    if (m && m[1]) {
      const candidate = m[1].replace(/\s+/g, "");
      if (isValidCode(candidate)) {
        code = candidate;
        break;
      }
    }
  }

  // If not found in subject, try body
  if (!code) {
    for (const pat of directPatterns) {
      const m = plain.match(pat);
      if (m && m[1]) {
        const candidate = m[1].replace(/\s+/g, "");
        if (isValidCode(candidate)) {
          code = candidate;
          break;
        }
      }
    }
  }

  // Pattern 2: Isolated block of 4-8 digits in text
  if (!code) {
    const lines = plain.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const lineDigitMatch = line.match(/^([0-9]{4,8})$/);
      if (lineDigitMatch && isValidCode(lineDigitMatch[1])) {
        code = lineDigitMatch[1];
        break;
      }
      const lineHyphenMatch = line.match(/^([0-9]{3}[-\s][0-9]{3})$/);
      if (lineHyphenMatch) {
        const cand = lineHyphenMatch[1].replace(/[-\s]/g, "");
        if (isValidCode(cand)) {
          code = cand;
          break;
        }
      }
    }
  }

  // If still not found, search in HTML for prominent styled code elements
  if (!code && bodyHtml) {
    const htmlCodeMatch = bodyHtml.match(
      /(?:font-size:\s*(?:2[2-9]|[3-9][0-9])px|letter-spacing:\s*[2-9]px|class="[^"]*(?:code|otp|token)[^"]*")[^>]*>\s*([0-9]{4,8}|[A-Za-z0-9]{3,4}[-][A-Za-z0-9]{3,4})\s*</i
    );
    if (htmlCodeMatch && isValidCode(htmlCodeMatch[1].replace(/[-\s]/g, ""))) {
      code = htmlCodeMatch[1].replace(/\s+/g, "");
    }
  }

  if (!code) {
    return null;
  }

  // Format code digits array
  const cleanCodeOnly = code.replace(/[^A-Za-z0-9]/g, "");
  const digits = cleanCodeOnly.split("");

  return {
    code: cleanCodeOnly,
    displayCode: code,
    digits,
    title: "Code Requested",
    service,
    expiresIn,
    isReply,
    isForward,
  };
}

// Global cache for detected OTPs per messageId
export const otpCache = new Map<string, OtpInfo | null>();

/** Custom event name dispatched when an OTP is discovered or updated */
export const OTP_DISCOVERED_EVENT = "airsend:otp-discovered";

export function notifyOtpDiscovered(messageId: string, info: OtpInfo) {
  otpCache.set(messageId, info);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(OTP_DISCOVERED_EVENT, {
        detail: { messageId, info },
      })
    );
  }
}
