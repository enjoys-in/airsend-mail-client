import { __config } from '@/constants/config';
import * as crypto from 'crypto'
import CryptoJS from 'crypto-js'
const ENCRYPTION_KEY: string = "pY8rGx4JmZqK9nVtB2dE6fWcL1sQ3uHa";

export class Security {
    /**
    * Generates a signature for the given method, URI, body, and client secret.
    *
    * @param {RoutingMethods} method - The HTTP method used for the request.
    * @param {string} uri - The URI of the request.
    * @param {any} body - The body of the request.
    * @param {string} clientSecret - The client secret used for generating the signature.
    * @return {Promise<string>} A promise that resolves to the generated signature.
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
        const hmac = crypto
            .createHmac("sha512", __config.APP.APP_SECRET as string)
            .update(decodedString);
        return hmac.digest("hex");
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
        const key = CryptoJS.enc.Utf8.parse(secret || ENCRYPTION_KEY);
        const iv = CryptoJS.lib.WordArray.random(16);

        const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
            iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        });
        const ivB64 = CryptoJS.enc.Base64.stringify(iv);
        const cipherB64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);

        return `${ivB64}:${cipherB64}`;
    }
    /**
     * Decrypts the given ciphertext using AES decryption with the given IV and secret key.
     *
     * @param {string} ciphertextB64 - The base64-encoded ciphertext to decrypt.  
     * @param {string} [secret] - The secret key used for decryption. If not provided, the default encryption key will be used.
     * @return {string} The decrypted plaintext as a UTF-8 encoded string.
     */


    /**
     * Decrypts the given ciphertext using AES decryption with the given IV and secret key.
     *
     * @param {string} ciphertextB64 - The base64-encoded ciphertext to decrypt.
     * @param {string} [secret] - The secret key used for decryption. If not provided, the default encryption key will be used.
     * @return {string} The decrypted plaintext as a UTF-8 encoded string.
     * @throws {Error} If decryption fails, an error will be thrown.
     */
    decryptAES(ciphertextB64: string, secret?: string): string {
        try {
            const [ivB64, cipherB64] = ciphertextB64.split(":");

            const key = CryptoJS.enc.Utf8.parse(secret || ENCRYPTION_KEY);

            const decrypted = CryptoJS.AES.decrypt(
                {
                    ciphertext: CryptoJS.enc.Base64.parse(cipherB64),
                } as any,
                key,
                {
                    iv: CryptoJS.enc.Base64.parse(ivB64),
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7,
                }
            );

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {

            return "";
        }
    }
}