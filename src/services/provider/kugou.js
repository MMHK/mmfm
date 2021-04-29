const axios = require("axios").create({
    timeout: 10000,
});
const path = require("path");
const fs = require("fs");
const async = require("async");

const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
    config.headers["User-Agent"] = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36';
    config.jar = cookieJar;
    config.withCredentials = true;
    config.headers["Referer"] = 'http://www.kugou.com/';


    return config;
});

axios.interceptors.response.use((response) => {
    // console.dir(response.data.data.lists);
    // console.dir(response.config);
    return response;
}, (error) => {
    console.error(error);

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
        });

        callback(target);
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
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/kugou.js");
    const body = fs.readFileSync(jsFile);

    const func = new Function("async", "axios", "getParameterByName", "isElectron", "cookieGet", `${body} return kugou`);

    return func(async, axios, getParameterByName, isElectron, cookieGet);
}

const kugou = wrapFunc();

exports.search = (key) => {
    const keywords = encodeURI(encodeURI(key));

    return new Promise(resolve => {
        kugou.search(`/search?keywords=${keywords}&type=0&curpage=1`)
            .success(resolve)
    })
};

exports.song = (result) => {
    return new Promise((resolve, reject) => {
        kugou.bootstrap_track(result, resolve, reject);
    })
};
