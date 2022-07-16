const axios = require("axios").create({
    timeout: 10000,
});
const path = require("path");
const fs = require("fs");
const forge = require("node-forge");
const btoa = require("btoa");

const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');

axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.interceptors.request.use((config) => {
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

    // console.log(config);

    return config;
}, (error) => {
    // console.log(error);
    Promise.reject(error);
});

axios.interceptors.response.use((response) => {
    // console.log(response.config);
    // console.log(response.data);
    return response;
}, (error) => {
    // console.error(error);

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
    const jsFile = path.resolve("node_modules", "listen1_chrome_extension/js/provider/netease.js");
    let body = fs.readFileSync(jsFile);

    const func = new Function("axios", "getParameterByName",
        "isElectron", "cookieGet", "forge", "btoa", "cookieSet",`${body} return netease`);

    return func(axios, getParameterByName, isElectron, cookieGet, forge, btoa, cookieSet);
}


const netease = wrapFunc();

const songDetail =  (result) => {
    return new Promise((resolve, reject) => {
        netease.bootstrap_track(result, resolve, reject);
    })
};

exports.search = (key) => {
    const keywords = encodeURI(key);

    return new Promise(resolve => {
       netease.get_user().success(resolve);
    }).then(() => {
        return new Promise(resolve => {
            netease.search(`/search?keywords=${keywords}&type=0&curpage=1`)
                .success(resolve)
        })
    })
        .then((data) => {
            const list = data.result || [];
            return Promise.all(list.map((track) => {
                return songDetail(track).then((data) => {
                    return {
                        ...track,
                        ...data,
                    }
                }, () => {
                    return track;
                });
            }))
        })
        .then((data) => {
            return {
                result: data,
                total: data.length || 0,
            }
        })
};

exports.song = songDetail;
