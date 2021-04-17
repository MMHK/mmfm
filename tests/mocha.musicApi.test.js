const musicApi = require("../src/services/MusieApi");

describe("musicApi", function () {

    it("search", async function () {
        this.timeout(60000);

        const result = await musicApi.search("推开世界的门");

        console.dir(result.migu);
    });

    it("song", async function () {
        this.timeout(60000);

        const result = await musicApi.song("mgtrack_60057759769");

        console.dir(result);
    });
});