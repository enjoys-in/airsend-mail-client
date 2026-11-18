/**
 * Where a ?redirect= / ?return_to= parameter may send a signed-in user.
 *
 * The user's token is appended to the target (the receiving product reads it), so an unchecked
 * redirect would hand the token to any site a link points at. Allowed targets:
 *   - this site (relative paths, except the login page itself, which would loop)
 *   - airsend.in and its subdomains (the host is airsend.in or ends with ".airsend.in"), over https
 *   - localhost on any port (local development of the other AirSend products)
 *
 * Pure (no window), so it works in middleware as well as in the browser.
 */
export function resolveSafeRedirect(raw: string | null | undefined, siteOrigin: string): URL | null {
    if (!raw) return null

    let url: URL
    try {
        url = new URL(raw, siteOrigin)
    } catch {
        return null
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    // Credentials in the URL (https://airsend.in@evil.com) are never legitimate here.
    if (url.username || url.password) return null

    // Back to the login page would redirect straight here again (checked first: on airsend.in this
    // site is also an allowed domain).
    if (url.origin === siteOrigin && url.pathname.replace(/\/+$/, "") === "/v2") return null

    const host = url.hostname.toLowerCase()

    if (host === "localhost") return url
    if ((host === "airsend.in" || host.endsWith(".airsend.in")) && url.protocol === "https:") return url
    if (url.origin === siteOrigin) return url
    return null
}

/** The target with the user's token added, unless it already carries one. */
export function withToken(target: URL, token: string | null | undefined): URL {
    const out = new URL(target.toString())
    if (token && !out.searchParams.has("token")) out.searchParams.set("token", token)
    return out
}
