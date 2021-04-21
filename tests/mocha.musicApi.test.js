const musicApi = require("../src/services/MusieApi");

describe("musicApi", function () {

    it("search", async function () {
        this.timeout(60000);

        const result = await musicApi.search("走在冷风中");

        console.dir(result.migu);
    });

    it("song", async function () {
        this.timeout(60000);

        const result = await musicApi.song("mgtrack_69965700748");

        console.dir(result);
    });

    it("url", async function () {
        this.timeout(60000);

        const result = await musicApi.url("mgtrack_69965700748");

        console.dir(result);
    });
});