import axiosBase from "axios";
import path from "path";
import fs from "fs";
import forge from "node-forge";
import btoa from "btoa";

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

    if (config.url.includes('://music.163.com/')) {
        config.headers["Referer"] = 'https://music.163.com/';
        config.headers["Origin"] = 'https://music.163.com';
    }
    if (config.url.includes('://interface3.music.163.com/')) {
        config.headers["Referer"] = 'https://music.163.com/';
        config.headers["Origin"] = 'https://music.163.com';
    }
    if (config.url.includes('://gist.githubusercontent.com/')) {
        config.headers["Referer"] = 'https://gist.githubusercontent.com/';
        config.headers["Origin"] = 'https://gist.githubusercontent.com';
    }

    return config;
}, (error: any) => {
    Promise.reject(error);
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
        });

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
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/netease.js");
    let body: any = fs.readFileSync(jsFile);

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "forge", "btoa", "cookieSet", `${body} return netease`);

    return func(axios, getParameterByName, isElectron, cookieGet, forge, btoa, cookieSet);
}

const netease = wrapFunc();

const songDetail = (result: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        netease.bootstrap_track(result, resolve, reject);
    })
};

export const search = (key: string): Promise<any> => {
    const keywords = encodeURI(key);

    return new Promise(resolve => {
        netease.get_user().success(resolve);
    }).then(() => {
        return new Promise(resolve => {
            netease.search(`/search?keywords=${keywords}&type=0&curpage=1`)
                .success(resolve)
        })
    })
        .then((data: any) => {
            const list = data.result || [];
            return Promise.all(list.map((track: any) => {
                return songDetail(track).then((data: any) => {
                    return {
                        ...track,
                        ...data,
                    }
                }, () => {
                    return track;
                });
            }))
        })
        .then((data: any) => {
            return {
                result: data,
                total: data.length || 0,
            }
        })
};

export const song = songDetail;

export default { search, song };
