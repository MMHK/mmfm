const cookie = require('cookie');

describe("Cookie", function() {

    it("parse", function () {
        this.timeout(6000);

        const val = cookie.parse(`__cfduid=d4dc3ead289edc9d8223f2af8a7e58f5f1618557349; expires=Sun, 16-May-21 07:15:49 GMT; path=/; domain=.bundlephobia.com; HttpOnly; SameSite=Lax; Secure`)

        console.dir(val);
    });
});