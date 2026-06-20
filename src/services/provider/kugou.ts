import axiosBase from "axios";
import path from "path";
import fs from "fs";
import asyncLib from "async";

import axiosCookieJarSupport from "axios-cookiejar-support";
import * as tough from "tough-cookie";

const axios = axiosBase.create({
    timeout: 10000,
});

(axiosCookieJarSupport as any)(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config: any) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    config.jar = cookieJar;
    config.withCredentials = true;
    config.headers["Referer"] = 'http://www.kugou.com/';

    return config;
});

axios.interceptors.response.use((response: any) => {
    return response;
}, (error: any) => {
    console.error(error);

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
        });

        callback(target);
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
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/kugou.js");
    const body: any = fs.readFileSync(jsFile);

    const func = new Function("async", "axios", "getParameterByName", "isElectron", "cookieGet", `${body} return kugou`);

    return func(asyncLib, axios, getParameterByName, isElectron, cookieGet);
}

const kugou = wrapFunc();

export const search = (key: string): Promise<any> => {
    const keywords = encodeURI(encodeURI(key));

    return new Promise(resolve => {
        kugou.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

export const song = (result: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        kugou.bootstrap_track(result, resolve, reject);
    })
};

export default { search, song };
