const service = require("../src/services/WebService");
const path = require("path");

describe("Sample", function () {


    it("downloadFile", async function () {
       this.timeout(60000);

        const tempFile = path.join(__dirname, "temp", "temp.tmp");

        const res = await service.downloadFile("http://120.41.44.24/amobile.music.tc.qq.com/", tempFile);

        console.log(res);
    });
});