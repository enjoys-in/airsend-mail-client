import { MailBoxListResponse } from "@/lib/types/MailBoxListResponse.interface";
import { ApiResponse } from "./types";
import { SingleEmailResponse } from "@/lib/types/EmailResponse";

export type CacheStorageKey = keyof CacheResponseMap;

export type CacheResponseMap = {
  "fetch-mailboxes": ApiResponse<MailBoxListResponse[]>;
  [key: `fetch-mailbox?folder=${string}`]: ApiResponse<MailBoxListResponse>;
  [key: `fetch-emails?folder=${string}`]: ApiResponse<SingleEmailResponse>;
  [key: `fetch-emails-body?id=${string}`]: ApiResponse<SingleEmailResponse>;
} & {};
export type CacheResponse<K> =
  K extends CacheStorageKey ? CacheResponseMap[K]
  : K extends `fetch-mailbox?folder=${string}` ? ApiResponse<MailBoxListResponse>
  : never;