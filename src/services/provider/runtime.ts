import * as tough from "tough-cookie";
import forge from "node-forge";

const cookieJar = new tough.CookieJar();

const MOBILE_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';

export function isElectron() {
    return false;
}

export { MOBILE_UA, cookieJar, forge };

export function cookieGet(cookie: any, callback: any) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err: any, cookies: any) => {
        const target = Array.from(cookies).find((c: any) => {
            return name && c.key == name;
        });

        callback(target);
    });
}

export function cookieSet(cookie: any, callback: any) {
    const c = new tough.Cookie({
        key: cookie.name,
        value: cookie.value
    });

    cookieJar.setCookie(c, cookie.url, {}, (err: any, cookieEntry: any) => {
        callback(cookieEntry);
    });
}

export function getParameterByName(name: string, url?: string) {
    if (!url) url = (globalThis as any).window?.location?.href;
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url!);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default {
    isElectron,
    MOBILE_UA,
    cookieJar,
    forge,
    cookieGet,
    cookieSet,
    getParameterByName,
};
