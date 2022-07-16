const kuwoApi = require("../src/services/provider/kuwo");

describe("kuwoAPI", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "推开世界的门";

        return kuwoApi.search(keywords)
            .then((result,
                   total,
                   type) => {
                console.dir(total);
                console.dir(result);
            })

    });

    it("song", function () {
        this.timeout(600000);

        const track = {
            id: 'kwtrack_28511201',
            title: '推开世界的门',
            artist: '杨乃文',
            artist_id: 'kwartist_1487',
            album: '离心力',
            album_id: 'kwalbum_1358411',
            source: 'kuwo',
            source_url: 'https://www.kuwo.cn/play_detail/28511201',
            img_url: 'http://img4.kuwo.cn/star/albumcover/500/17/7/3428943064.jpg',
            lyric_url: 28511201
        };

        kuwoApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});