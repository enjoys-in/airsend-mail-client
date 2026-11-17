// ============================================================================
// Raw MIME of a mail, decrypted on the client. Shared by the mail view and the
// mail list (RSVP chip), cached in the mail store so each mail is fetched and
// decrypted once.
// ============================================================================

import { instance } from "@/lib/api/api.instance";
import { Security } from "@/lib/security";
import { DecryptEncryptedMail } from "@/lib/pgp-service";
import type { ApiResponse } from "@/lib/types";
import type { EncodedMessageResponse } from "@/lib/types/mail.interface";
import { useMailStore } from "@/store/mails";

const security = new Security();
const inFlight = new Map<string, Promise<string>>();

/** Decrypt an encoded mail response into raw MIME and cache it. */
export async function decryptEncodedMail(messageId: string, data: EncodedMessageResponse): Promise<string> {
  const cached = useMailStore.getState().rawData[messageId];
  if (cached) return cached;

  const decrypted = await DecryptEncryptedMail({
    encrypted: security.decryptAES(data.chiper_text),
    privateKeyArmored: security.decryptAES(data.open_pgp.privateKey),
    publicKeyArmored: security.decryptAES(data.open_pgp.publicKey),
    password: data.k,
  });
  const store = useMailStore.getState();
  store.setRawData({ ...store.rawData, [messageId]: decrypted });
  return decrypted;
}

/** Raw MIME of a mail: from the cache, or fetched and decrypted. */
export function loadRawMail(messageId: string): Promise<string> {
  const cached = useMailStore.getState().rawData[messageId];
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(messageId);
  if (pending) return pending;

  const job = (async () => {
    const { data } = await instance.get<ApiResponse<EncodedMessageResponse>>(`/api/v1/get-encoded-mail/${messageId}`);
    if (!data.success) throw new Error(data.message || "Could not load the mail");
    return decryptEncodedMail(messageId, data.result);
  })().finally(() => inFlight.delete(messageId));

  inFlight.set(messageId, job);
  return job;
}
