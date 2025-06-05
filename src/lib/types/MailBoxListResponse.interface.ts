export interface StatusObject {
    path: string;
    messages?: number;
    recent?: number;
    uidNext?: number;
    uidValidity?: bigint;
    unseen?: number;
    highestModseq?: bigint;
}
export interface ListResponse {
    path: string;
    name: string;
    delimiter: string;
    flags: Set<string>;
    specialUse: string;
    listed: boolean;
    subscribed: boolean;
    status?: StatusObject;
}
export type MailBoxListResponse  ={
    total_count: number;
    unseen_count: number;
   
} & ListResponse