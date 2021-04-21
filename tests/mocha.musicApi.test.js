const musicApi = require("../src/services/MusieApi");

describe("musicApi", function () {

    it("search", async function () {
        this.timeout(60000);

        const result = await musicApi.search("林俊杰");

        console.dir(result.migu);
    });

    it("song", async function () {
        this.timeout(60000);

        const result = await musicApi.song("mgtrack_60058621104");

        console.dir(result);
    });

    it("url", async function () {
        this.timeout(60000);

        const result = await musicApi.url("mgtrack_60058621104");

        console.dir(result);
    });
});