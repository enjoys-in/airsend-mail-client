import axios from "axios";
import { instance } from "./api.instance";
import { __config } from "@/constants/config";
import { MailEventData } from "../types/update-mail-events.interface";
import { ApiResponse } from "../types";
import { MailBoxListAPIResponse, MailLablesType } from "../types/MailBoxListResponse.interface";

const adminRoutes = (url: string) => `/api/v1/admin${url}`

export class API {
    static handleLogin(data: any) {
        return axios.post(__config.APP.BASE_URL + '/api/v1/auth/login', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            },
            withCredentials: true
        })
    }
    static handleTempCreateMailbox(data: any) {
        return axios.post(__config.APP.BASE_URL + '/api/v1/temp', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static getTempMails(url: string) {
        return axios.get(__config.APP.BASE_URL + '/api/v1/temp-mails' + url, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static handleRegister(data: any) {
        return axios.post(__config.APP.BASE_URL + '/api/v1/auth/register', data, {
            headers: {
                'X-App-Version': '1.0.0',
                'X-App-Name': 'Airsend',
                'x-api-key': __config.APP.API_KEY,
            }
        })
    }
    static subcribeWebPush(data: any) {
        return instance.post("/api/v1/subscribe", data)
    }
    static handleLogout() {
        return instance.post('/api/v1/auth/logout')
    }
    static handleAdminLogout() {
        return instance.get('/api/v1/auth/admin/logout')
    }
    static getDomains() {
        return instance.get('/api/v1/domains')
    }

    static checkUserName(username: string) {
        return instance.get('/api/v1/check-username?username=' + username)
    }
    static getSingleMailData(id: string) {
        return instance.get(`/api/v1/get-mail/${id}`)
    }
    static getAllMailData(query: string = "") {
        return instance.get(`/api/v1/get-mails${query}`)
    }

    static handleGoogleLogin() {
        return instance.get('/api/v1/oauth2/google/connect')
    }
    static handleGoogleCallback(code: string) {
        return instance.get('/api/v1/oauth2/google/callback?code=' + code, { withCredentials: true })
    }

    // DOMAIN
    static handleGetAllDomains(url: string = "") {
        return instance.get(adminRoutes("/domains" + url))
    }
    static addNewDomain(data: any) {
        return instance.post(adminRoutes("/domain"), data)
    }
    static verifyDomain(domainId: string) {
        return instance.get(adminRoutes(`/verify-records/${domainId}`))
    }
    static getSingleDomain(domainId: string) {
        return instance.get(adminRoutes(`/domain/${domainId}`))
    }
    static updateDomain(domainId: string, data: any) {
        return instance.patch(adminRoutes(`/domain/${domainId}`), data)
    }
    static deleteDomain(domainId: string) {
        return instance.delete(adminRoutes(`/domain/${domainId}`))
    }

    static verifyDomainOwnership(domainId: string) {
        return instance.get(adminRoutes(`/verify-domain-ownership/${domainId}`))
    }

    static claimDomainOwnership(domainId: string) {
        return instance.get(adminRoutes(`/claim-domain-ownership/${domainId}`))
    }

    // BLOCKED IPs - Global
    static getGlobalBlockedIPs() { return instance.get(adminRoutes('/blocked-ips')) }
    static removeGlobalBlockedIP(ip: string) { return instance.delete(adminRoutes(`/blocked-ips/${encodeURIComponent(ip)}`)) }
    static purgeGlobalBlockedIPs() { return instance.delete(adminRoutes('/blocked-ips')) }

    // BLOCKED IPs - Per Domain
    static getDomainBlockedIPs(domain?: string) { return instance.get(adminRoutes(`/blocked-ips/domains${domain ? `?domain=${domain}` : ''}`)) }
    static unblockDomainIP(domain: string, ip: string) { return instance.delete(adminRoutes('/blocked-ips/domains'), { data: { domain, ip } }) }
    static purgeDomainBlockedIPs(domain: string) { return instance.delete(adminRoutes('/blocked-ips/domains/purge'), { data: { domain } }) }

    // ACCOUNTS
    static handleGetAllAccounts(domain: string) {
        return instance.get(adminRoutes(`/accounts?domain=${domain}`))
    }
    static handleGetAccountSettings(account: string) {
        return instance.get(adminRoutes(`/account-settings/${account}`))
    }
    static handleUpdateAccountSettings(account: string, data: any) {
        return instance.put(adminRoutes(`/account-settings/${account}`), data)
    }

    // USER
    static handleAddUser(data: any) {
        return instance.post(adminRoutes(`/user`), data)
    }
    static handleGetAllUsers() {
        return instance.get(adminRoutes(`/users`))
    }
    static handleDeleteUser(userid: string) {
        return instance.delete(adminRoutes(`/user/${userid}`))
    }
    static handleResetPassword(userid: string,data:{
        isRandom:boolean,
        user_password:string
    }) {
        return instance.put(adminRoutes(`/reset-password/${userid}`),data)
    }
    static downloadAttachment(messageId: string, index: number) {
        return instance.get(adminRoutes(`/download-attachment/${messageId}?index=${index}`))
    }
    static handleCreateAPIKey(data: any) {
        return instance.post(adminRoutes(`/api-key`), data)
    }
    static handleGetAPIKeys() {
        return instance.get(adminRoutes(`/api-keys`))
    }
    static handleDeleteAPIKey(id: string) {
        return instance.delete(adminRoutes(`/api-key/${id}`),)
    }
    static generateAPiCode() {
        return instance.get(`/api/v1/client/code`)
    }
    static getQuota() {
        return instance.get(`/api/v1/get-mailbox-quota`)
    }
    // API TEST
    static sendMail(data: any) {
        return instance.post(`/api/v1/client/send`, data)
    }
    static fetchMails() {
        return instance.get(`/api/v1/client/get`)
    }
    // DRAFTS
    static saveDraft(data: { to?: string[]; cc?: string[]; bcc?: string[]; subject?: string; html?: string; message_id?: string }) {
        return instance.post<ApiResponse<{ message_id: string; uid: string }>>(`/api/v1/draft`, data)
    }
    static updateDraft(messageId: string, data: { to?: string[]; cc?: string[]; bcc?: string[]; subject?: string; html?: string }) {
        return instance.put<ApiResponse<{ message_id: string; uid: string }>>(`/api/v1/draft/${messageId}`, data)
    }
    static deleteDraft(messageId: string) {
        return instance.delete<ApiResponse<null>>(`/api/v1/draft/${messageId}`)
    }
    static getDrafts(query: string = "") {
        return instance.get<ApiResponse<any[]>>(`/api/v1/drafts${query}`)
    }
    // MAIL USER SETTING
    static handleGetMailUserSetting(key?: string | undefined) {
        return instance.get(`/api/v1/get-user-settings${key ? `?key=${key}` : ''}`)
    }
    static handleUpdateMailUserSetting(data: any) {
        return instance.put(`/api/v1/update-user-settings`, data)
    }
    static handleMailEvents(data: MailEventData,folder:string) {
        return instance.patch(`/api/v1/update-mail-event?current_mailbox=${folder}&timestamp=${Date.now()}`, data)
    }
    static getMailboxUnReadCount(current_mailbox: string) {
        return instance.get(`/api/v1/get-mail-event?current_mailbox=${current_mailbox}`)
    }
    static fetchUserFolderLabels(type?: MailLablesType) {
        return instance.get<ApiResponse<MailBoxListAPIResponse[]>>(`/api/v1/get-folder-labels?type=${type}`)
    }
    static sendMailOG(data: any) {
        return instance.post<ApiResponse<{ uid: string, message_id: string, thread_id: string }>>(`/api/v1/send-mail`, data)
    }
    static uploadFiles(data: any) {
        return instance.post(`/api/v1/attachment/upload`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }
    static uploadDelete(data: { id: string, index: string }) {
        return instance.get(`/api/v1/attachment/delete?id=${data.id}&index=${data.index}`)
    }
    static uploadCancel(data: any) {
        return instance.post(`/api/v1/attachment/cancel`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }
    static downloadFiles(data: any) {
        return instance.post(`/api/v1/attachment/download`, data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }

    // ORGANIZATIONS
    static getOrganizations() {
        return instance.get(adminRoutes("/organizations"))
    }
    static getOrganization(id: string) {
        return instance.get(adminRoutes(`/organization/${id}`))
    }
    static createOrganization(data: any) {
        return instance.post(adminRoutes("/organization"), data)
    }
    static updateOrganization(id: string, data: any) {
        return instance.put(adminRoutes(`/organization/${id}`), data)
    }
    static deleteOrganization(id: string) {
        return instance.delete(adminRoutes(`/organization/${id}`))
    }

    // MEMBERS
    static getMembers(query: string = "") {
        return instance.get(adminRoutes(`/members${query}`))
    }
    static getOrgMembers(orgId: string) {
        return instance.get(adminRoutes(`/organization/${orgId}/members`))
    }
    static inviteMember(data: any) {
        return instance.post(adminRoutes("/member"), data)
    }
    static updateMember(id: string, data: any) {
        return instance.put(adminRoutes(`/member/${id}`), data)
    }
    static removeMember(id: string) {
        return instance.delete(adminRoutes(`/member/${id}`))
    }

    // ROLES
    static getRoles(query: string = "") {
        return instance.get(adminRoutes(`/roles${query}`))
    }
    static getOrgRoles(orgId: string) {
        return instance.get(adminRoutes(`/organization/${orgId}/roles`))
    }
    static createRole(data: any) {
        return instance.post(adminRoutes("/role"), data)
    }
    static updateRole(id: string, data: any) {
        return instance.put(adminRoutes(`/role/${id}`), data)
    }
    static deleteRole(id: string) {
        return instance.delete(adminRoutes(`/role/${id}`))
    }

    // LOGS
    static getLogs(query: string = "") {
        return instance.get(adminRoutes(`/logs${query}`))
    }

    // DOMAIN-ORG HISTORY
    static getDomainHistory(query: string = "") {
        return instance.get(adminRoutes(`/domain-org-history${query}`))
    }

    // WORKSPACE
    static toggleWorkspace(data: { domain_id: string; enabled: boolean }) {
        return instance.patch(adminRoutes("/workspace/toggle"), data)
    }
    static getWorkspace(domainId: string) {
        return instance.get(adminRoutes(`/workspace/${domainId}`))
    }
    static addWorkspaceMembers(data: { domain_id: string; members: { email: string; scopes?: string[] }[] }) {
        return instance.post(adminRoutes("/workspace/members"), data)
    }
    static updateWorkspaceMemberScopes(memberId: number, data: { scopes: string[] }) {
        return instance.patch(adminRoutes(`/workspace/members/${memberId}`), data)
    }
    static removeWorkspaceMember(memberId: number) {
        return instance.delete(adminRoutes(`/workspace/members/${memberId}`))
    }
}

