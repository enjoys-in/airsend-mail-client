import Cookies from 'js-cookie'
import { IUser } from './types/user.interface'
type CookieType = "access_token" | "shield_user"

/**
 * Validates if the input string is a valid domain name.
 *
 * @param domain - The domain name to validate.
 * @returns boolean - `true` if the domain is valid, `false` otherwise.
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;
  return domainRegex.test(domain);
}

export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("Oye Hoye Baddo Baddi.");
        } else {
          console.log("chiiiiii, Tum Tum Tum Badal gye ho.");
        }
      })
      .catch((err) => console.error("Error requesting notification permission:", err));
  } else {
    console.error("Browser does not support notifications.");
  }
}
export async function subscribeUser(serverUrl: string) {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array("BL1rUmqQcd09hAoVVnbAN5fF3DFQFJGutA3mVNZAHG9TmTvJeDMpqq79z8--jrT88VYcnH7-PyNQ5kTMtW8df2w"),
    });


    await fetch(`${serverUrl}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

  } else {
    console.error("Push notifications are not supported in this browser.");
  }
}

// Convert VAPID public key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

export function triggerNotification(title: string, options: { body: string; }) {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "show-notification",
      title,
      body: options.body,


    });
  } else {
    console.error("Service Worker not available.");
  }
}

export class Helpers {
  static getUserFromCookies(): IUser | null {
    const data = Cookies.get("shield_user") || null
    return data ? JSON.parse(data) : null
  }
  static gegtTokenFromCookies(): string | null {
    const data = Cookies.get("access_token") || null
    return data
  }
  static getTokenFromCookies(token: string): string | null {
    const data = Cookies.get(token) || null
    return data
  }
  static getUserFromLocalstorage(type: CookieType) {
    const data = localStorage.getItem(type) || null
    return data ? JSON.parse(data) : null
  }
  static getLocalStorage(key: string, fromStorage: "local" | "cookies" = "local"): IUser | null {
    if (fromStorage === "local") {
      const data = localStorage.getItem(key) || null
      return data ? JSON.parse(data) : null
    } else {

      const data = Cookies.get(key) || null
      return data ? JSON.parse(data) : null

    }
  }
}