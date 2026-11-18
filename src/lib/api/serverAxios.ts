import { __config } from '@/constants/config';
import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Security } from '../security';

const security = new Security();
const serverAxios = axios.create({
    baseURL: __config.APP.BASE_URL,
    withCredentials: true,
    headers: {
        'X-App-Version': '1.0.0',
        'X-App-Name': 'AirSend',
        'x-api-key': __config.APP.API_KEY,
    }
});

serverAxios.interceptors.request.use(async (config) => {
    const cookieStore = await cookies();
    const isAdminRoute = (config.url as string)?.includes('/admin');
    const adminToken = cookieStore.get('admin_access_token')?.value;
    const userToken = cookieStore.get('access_token')?.value;
    const token = isAdminRoute ? (adminToken || userToken) : (userToken || adminToken);

    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Forward cookies so backend endpoints reading req.cookies directly have them
    const cookiesToSend: string[] = [];
    if (adminToken) cookiesToSend.push(`admin_access_token=${adminToken}`);
    if (userToken) cookiesToSend.push(`access_token=${userToken}`);
    if (cookiesToSend.length > 0) {
        const existingCookie = (config.headers['Cookie'] as string) || '';
        config.headers['Cookie'] = existingCookie
            ? `${existingCookie}; ${cookiesToSend.join('; ')}`
            : cookiesToSend.join('; ');
    }

    const shieldRaw = cookieStore.get('shield_user')?.value;
    if (shieldRaw) {
        try {
            const user = JSON.parse(shieldRaw);
            if (user?.mid) config.headers['X-Tenant-ID'] = user.mid;
        } catch {}
    }

    const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
    const signature = await security.GenerateSignature((config.method as string).toUpperCase(), fullUrl, config.data);
    config.headers['X-Signature'] = signature;
    return config;
}, (error) => {
    return Promise.reject(error);
});
serverAxios.interceptors.response.use(async function (response) {
    return response;
}, function (error) {
    if (error?.response?.status === 401) {
        const isAdminRoute = (error?.config?.url as string)?.includes('/admin');
        redirect(isAdminRoute ? '/h-panel' : '/v2');
    }
    return Promise.reject(error);
});

export default serverAxios;