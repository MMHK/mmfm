const bilibiliApi = require("../src/services/provider/bilibili");

describe("qqAPI", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "推开世界的门";

        return bilibiliApi.search(keywords)
            .then((data) => {
                console.dir(data.result);
            })

    });

    it("song", function () {
        this.timeout(600000);

        const track = {
            id: 'bitrack_v_BV1xe411W72M',
            title: '纯享版：杨乃文《<em class="keyword">推开世界的门</em>》，一开口就唱进你<em class="keyword">的</em>心房<em class="keyword">推开</em>你<em class="keyword">的</em>“心门”',
            artist: '天天天TD',
            artist_id: 'biartist_v_296845138',
            source: 'bilibili',
            source_url: 'https://www.bilibili.com/BV1xe411W72M',
            img_url: 'https://i0.hdslb.com/bfs/archive/7b099d604a96a163d11f4be726adbf06f3a8615e.jpg'
        };

        return bilibiliApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});