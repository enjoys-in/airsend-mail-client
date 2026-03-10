import * as crypto from 'crypto'
import CryptoJS from 'crypto-js'

/**
 * Module-level security config.
 * - Server: reads from process.env directly.
 * - Client: set once via setSecurityConfig() from RuntimeConfigProvider
 *   (server component passes secrets as props → client component stores them here).
 */
let _appSecret: string = "";
let _encryptionKey: string = "";

/** Called once by RuntimeConfigProvider to store secrets in memory. */
export function setSecurityConfig(config: { appSecret: string; encryptionKey: string }) {
    _appSecret = config.appSecret;
    _encryptionKey = config.encryptionKey;
}

function getAppSecret(): string {
    if (typeof window === "undefined") return process.env.APP_SECRET || "";
    return _appSecret;
}

function getEncryptionKey(): string {
    if (typeof window === "undefined") return process.env.ENCRYPTION_KEY || "";
    return _encryptionKey;
}

/** Kept for backward compatibility. Returns the encryption key synchronously. */
export async function ensureEncryptionKey(): Promise<string> {
    return getEncryptionKey();
}

export class Security {
    /**
    * Generates a signature for the given method, URI, body, and client secret.
    * On the server uses process.env.APP_SECRET directly.
    * On the client calls /api/sign to keep the secret server-side.
    */
    async GenerateSignature(
        method: any,
        uri: string,
        body?: any,
    ): Promise<string> {
        let decodedString: string;
        if (method === "get") {
            decodedString = this.PurifiedString(method, uri);
        } else {
            decodedString = this.PurifiedString(method, uri, body);
        }

        const secret = getAppSecret();

        // Server-side: use Node crypto
        if (typeof window === "undefined") {
            const hmac = crypto
                .createHmac("sha512", secret)
                .update(decodedString);
            return hmac.digest("hex");
        }

        // Client-side: sign directly with CryptoJS (no server round-trip)
        return CryptoJS.HmacSHA512(decodedString, secret).toString(CryptoJS.enc.Hex);
    }

    /**
     * Sorts the query parameters in the given URL and returns the sorted URL.
     *
     * @param {string} wholeUrl - The URL containing the query parameters.
     * @return {string} The sorted URL with the query parameters in alphabetical order.
     */
    private sortQueryParams(wholeUrl: string): string {
        var url = wholeUrl.split("?"),
            baseUrl = url[0],
            queryParam = url[1].split("&");

        wholeUrl = baseUrl + "?" + queryParam.sort().join("&");

        return this.fixedEncodeURIComponent(wholeUrl);
    }
    /**
     * A recursive function that sorts the parameters of an object in alphabetical order.
     *
     * @param {Record<string, any>} object - The object whose parameters need to be sorted.
     * @return {Record<string, any>} The object with sorted parameters.
     */
    private sortBodyParams(object: Record<string, any>): Record<string, any> {
        if (typeof object !== "object" || object === null) {
            return object;
        }

        if (Array.isArray(object)) {
            return object.map((item) => this.sortBodyParams(item));
        }

        const sortedObject: any = {};
        Object.keys(object)
            .sort()
            .forEach((key) => {
                sortedObject[key] = this.sortBodyParams(object[key]);
            });
        return sortedObject;
    }
    /**
     * A function that creates a purified string based on the method, URL, and optional request body.
     *
     * @param {string} method - The HTTP method used.
     * @param {string} wholeurl - The complete URL.
     * @param {Record<string, any>} requestBody - The request body (optional).
     * @return {string} The purified string generated from the input.
     */
    private PurifiedString(
        method: string,
        wholeurl: string,
        requestBody?: Record<string, any>
    ): string {
        let baseArray: string[] = [];
        baseArray.push(method.toUpperCase());

        if (wholeurl.indexOf("?") >= 0) {
            baseArray.push(this.sortQueryParams(wholeurl));
        } else {
            baseArray.push(this.fixedEncodeURIComponent(wholeurl));
        }
        if (requestBody) {
            baseArray.push(
                this.fixedEncodeURIComponent(
                    JSON.stringify(this.sortBodyParams(requestBody))
                )
            );
        }

        return baseArray.join("&");
    }

    private fixedEncodeURIComponent = (str: string) => {
        return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
            return "%" + c.charCodeAt(0).toString(16).toUpperCase();
        });
    };
    
    encryptAES(plaintext: string, secret?: string): string {
        const key = CryptoJS.enc.Utf8.parse(secret || getEncryptionKey());
        const iv = CryptoJS.lib.WordArray.random(16);
        const encrypted = CryptoJS.AES.encrypt(plaintext, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return `${CryptoJS.enc.Base64.stringify(iv)}:${encrypted.ciphertext.toString(CryptoJS.enc.Base64)}`;
    }

    decryptAES(ciphertextB64: string, secret?: string): string {
        if (!ciphertextB64) return "";
        try {
            const [ivB64, cipherB64] = ciphertextB64.split(":");
            const key = CryptoJS.enc.Utf8.parse(secret || getEncryptionKey());
            const decrypted = CryptoJS.AES.decrypt(
                { ciphertext: CryptoJS.enc.Base64.parse(cipherB64) } as any,
                key,
                { iv: CryptoJS.enc.Base64.parse(ivB64), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
            );
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch {
            return "";
        }
    }
}