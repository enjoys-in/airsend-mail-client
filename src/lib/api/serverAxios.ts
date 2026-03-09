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
    const toGet = (config.url as string).includes('/admin') ? 'admin_access_token' : 'access_token';
    const token = cookieStore.get(toGet)?.value;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }

    security.GenerateSignature((config.method as string).toUpperCase(), config.baseURL as string, config.data).then((signature) => {
        config.headers['X-Signature'] = signature
    })
    return config;
}, (error) => {
    return Promise.reject(error);
});
serverAxios.interceptors.response.use(async function (response) {
    return response;
}, function (error) {
    if (error?.response?.status === 401) {
        redirect('/v2');
    }
    return Promise.reject(error);
});

export default serverAxios;