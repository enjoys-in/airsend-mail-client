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