const tough = require('tough-cookie');
const cookieJar = new tough.CookieJar();
const forge = require("node-forge");

const MOBILE_UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30';

module.exports = {
    isElectron() {
        return false;
    },

    MOBILE_UA,
    cookieJar,
    forge,

    cookieGet(cookie, callback) {
        const url = cookie.url || cookie.domain;
        const name = cookie.name;
        cookieJar.getCookies(url, {}, (err, cookies) => {
            const target = Array.from(cookies).find((c) => {
                return name && c.key == name;
            });

            callback(target);
        });
    },

    cookieSet(cookie, callback) {
        const c = new tough.Cookie({
            key: cookie.name,
            value: cookie.value
        });


        cookieJar.setCookie(c, cookie.url, {}, (err, cookieEntry) => {
            callback(cookieEntry);
        });
    },

    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&'); // eslint-disable-line no-useless-escape
        const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);

        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

}