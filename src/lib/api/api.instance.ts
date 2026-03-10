import { __config } from '@/constants/config'
import axios, { AxiosResponse } from 'axios'
import Cookies from 'js-cookie'
import { Security } from '../security';
import { ApiResponse } from '../types';
import { getMid } from './auth-state';

const security = new Security();


const instance = axios.create({
    baseURL: __config.APP.BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        // 'Access-Control-Allow-Origin': __config.APP.APP_ENV === "DEV" ? "http://localhost:9500" : "https://airsend.in",
    },
})
instance.defaults.headers["common"] = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    'X-App-Version': '1.0.0',
    'X-App-Name': 'AirSend',
    'x-api-key': __config.APP.API_KEY,
}

instance.interceptors.request.use(async (config) => {
    const signature = await security.GenerateSignature(
        (config.method as string).toUpperCase(),
        `${config.baseURL}${config.url}` as string,
        config?.data,
    )
    config.headers['X-Signature'] = signature

    const mid = getMid();
    if (mid) config.headers['X-Tenant-ID'] = mid;

    return config;
}, (error) => {
    return Promise.reject(error);
});
instance.interceptors.response.use(
    async (response:AxiosResponse<ApiResponse<any>>) => {
        return response;
    },
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('admin_access_token');
            localStorage.removeItem('access_token');
            document.cookie = 'admin_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'shield_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/v2';
        }
        return Promise.reject(error);
    }
)
export { instance }


// ---------------------------------------------------------------------------
// CalDev (Calendar) axios instance — same auth pattern, different base URL
// ---------------------------------------------------------------------------

const CALDEV_BASE_URL =
  (typeof window !== 'undefined' && (window as any).__RUNTIME_CONFIG__?.CALDEV_URL) || process.env.CALDEV_URL || "http://localhost:8443";

const caldevInstance = axios.create({
  baseURL: CALDEV_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

caldevInstance.defaults.headers["common"] = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "X-App-Version": "1.0.0",
  "X-App-Name": "AirSend",
  "x-api-key": __config.APP.API_KEY,
};

caldevInstance.interceptors.request.use(
  (config) => {
    const mid = getMid();
    if (mid) config.headers['X-Tenant-ID'] = mid;
    return config;
  },
  (error) => Promise.reject(error),
);

caldevInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      window.location.href = '/v2';
    }
    return Promise.reject(error);
  },
);

export { caldevInstance }