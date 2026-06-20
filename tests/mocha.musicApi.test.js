const musicApi = require("../src/services/MusieApi");

describe("musicApi", function () {

    it("search", async function () {
        this.timeout(60000);

        const result = await musicApi.search("How Many Times");

        console.dir(result);
    });

    it("song", async function () {
        this.timeout(60000);

        const result = await musicApi.song("NE_0");

        console.dir(result);
    });

    it("url", async function () {
        this.timeout(60000);

        const result = await musicApi.url("NE_0");

        console.dir(result);
    });
});