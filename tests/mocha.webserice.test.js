const qqApi = require('@suen/music-api').qq;
const neteaseApi = require('@suen/music-api').netease;
const MiguService = require("../src/services/provider/migu");
const KuwoService = require("../src/services/provider/kuwo");
const QQService = require("../src/services/provider/qq");
const neteaseService = require("../src/services/provider/netease");
const path = require("path");

function combineSearch(search) {
    return Promise.all([QQService.search(search), neteaseService.search(search),
        MiguService.search(search), KuwoService.search(search)])
}

describe("WebService", function () {


    it("downloadFile", async function () {
       this.timeout(60000);

        const tempFile = path.join(__dirname, "temp", "temp.tmp");

        const res = await service.downloadFile("http://120.41.44.24/amobile.music.tc.qq.com/", tempFile);

        console.log(res);
    });

    it("combineSearch", async function () {
        this.timeout(60000);

        const result = await combineSearch("推开世界的门").then((dataList) => {
            return Array.from(dataList).reduce(function (last, row) {
                // console.log(row.result);
                return last.concat(row.result)
            }, [])
        });

        console.log(result);
    });
});