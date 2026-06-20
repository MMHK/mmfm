import axiosBase from "axios";
import path from "path";
import fs from "fs";
import DOMParser from "dom-parser";

import axiosCookieJarSupport from "axios-cookiejar-support";
import * as tough from "tough-cookie";

const axios = axiosBase.create({
    timeout: 10000,
});

(axiosCookieJarSupport as any)(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config: any) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
    config.jar = cookieJar;
    config.withCredentials = true;

    if (
        config.url.includes('.bilibili.com/') ||
        config.url.includes('.bilivideo.com/')
    ) {
        config.headers["Referer"] = 'https://www.bilibili.com/';
    }

    return config;
});

axios.interceptors.response.use((response: any) => {
    return response;
}, (error: any) => {
    return Promise.reject(error);
});

function isElectron() {
    return false;
}

function cookieGet(cookie: any, callback: any) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err: any, cookies: any) => {
        const target = Array.from(cookies).find((c: any) => {
            return name && c.key == name;
        }) || null;

        callback(target);
    });
}

function cookieSet(cookie: any, callback: any) {
    const c = new tough.Cookie({
        key: cookie.name,
        value: cookie.value
    });

    cookieJar.setCookie(c, cookie.url, {}, (err: any, cookieEntry: any) => {
        callback(cookieEntry);
    });
}

function getParameterByName(name: string, url?: string) {
    if (!url) url = (globalThis as any).window?.location?.href;
    name = name.replace(/[[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url!);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/bilibili.js");
    let body: any = fs.readFileSync(jsFile);

    body = (body + '').replace(/htmlDecode\(value\) {([^}]+)}/im, `
    htmlDecode (value) { 
        const parser = new DOMParser();
        const dom = parser.parseFromString(value);
        const elements = dom.getElementsByTagName("body");
        if (elements.length > 0) {
            return elements[0].textContent;
        }
        
        return value;
    }`);

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "DOMParser", "cookieSet", `${body} return bilibili`);

    return func(axios, getParameterByName, isElectron, cookieGet, DOMParser, cookieSet);
}

const bilibili = wrapFunc();

export const search = (key: string): Promise<any> => {
    const keywords = encodeURI(key);
    return new Promise(resolve => {
        return bilibili.get_user().success(resolve);
    }).then(() => {
        return new Promise(resolve => {
            bilibili.search(`/search?keywords=${keywords}&type=0&curpage=1`)
                .success(resolve)
        })
    })
};

export const song = (result: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        bilibili.bootstrap_track(result, resolve, reject);
    })
};

export default { search, song };
