const axios = require("axios").create({
    timeout: 10000,
});
const path = require("path");
const fs = require("fs");
const DOMParser = require('dom-parser');

const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';
    // config.headers["Host"] = 'www.qq.cn';
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

axios.interceptors.response.use((response) => {
    // console.log(response.config);
    // console.log(response.data);

    return response;
}, (error) => {
    // console.log(error);
    // console.log(error.response.data);

    return Promise.reject(error);
});


function isElectron() {
    return false;
}

function cookieGet(cookie, callback) {
    const url = cookie.url || cookie.domain;
    const name = cookie.name;
    cookieJar.getCookies(url, {}, (err, cookies) => {
        const target = Array.from(cookies).find((c) => {
            return name && c.key == name;
        }) || null;

        callback(target);
    });
}

function cookieSet(cookie, callback) {
    const c = new tough.Cookie({
        key: cookie.name,
        value: cookie.value
    });


    cookieJar.setCookie(c, cookie.url, {}, (err, cookieEntry) => {
        callback(cookieEntry);
    });
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function wrapFunc() {
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/bilibili.js");
    let body = fs.readFileSync(jsFile);

    body = (body+'').replace(/htmlDecode\(value\) {([^}]+)}/im, `
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

exports.search = (key) => {
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

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        bilibili.bootstrap_track(result, resolve, reject);
    })
};
