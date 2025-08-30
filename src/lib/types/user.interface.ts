export interface IAdmin {
    mid: string;
    email: string;
    name: string;
    role: ROLE_TYPE;
    picture: string | null
}
export interface IUser {
    mid: string;
    email: string;
    domain_name: string;
    tenant: string;
    name: string;
    role: ROLE_TYPE;
    hasOrgs: Record<string, any> | null;
}
export enum ROLE {
    USER = "USER",
    GUEST = "GUEST",
    ADMIN = "ADMIN"
}
interface BaseAuthState {
    isLoggedIn: boolean;
}
export interface UserAuthState extends BaseAuthState {
    user: IUser | null;
}
export interface AdminAuthState extends BaseAuthState {
    user: IAdmin | null;
}
export type ROLE_TYPE = keyof typeof ROLE