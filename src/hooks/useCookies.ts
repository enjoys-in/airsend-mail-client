import Cookies from 'js-cookie'


export const useCookies = () => {
    const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => Cookies.set(name, value, options)
    const getCookie = (name: string) => Cookies.get(name)
    const deleteCooke = (name: string) => Cookies.remove(name)
    const clearAll = () => {
        var Cookies = document.cookie.split(';');
        for (var i = 0; i < Cookies.length; i++)
            document.cookie = Cookies[i] + "=;expires=" + new Date(0).toUTCString();
    }
    return {
        setCookie,
        getCookie,
        deleteCooke,
        clearAll
    }
}