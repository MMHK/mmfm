const qqApi = require("../src/services/provider/qq");

describe("qqAPI", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "推开世界的门";

        qqApi.search(keywords)
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
            id: 'qqtrack_002aIsl12I5omi',
            title: '推开世界的门 (Live伴奏)',
            artist: '唐汉霄',
            artist_id: 'qqartist_001cmj1c1SxuvI',
            album: '天赐的声音 第11期',
            album_id: 'qqalbum_000jScXu2heNpX',
            img_url: 'https://y.gtimg.cn/music/photo_new/T002R300x300M000000jScXu2heNpX.jpg',
            source: 'qq',
            source_url: 'https://y.qq.com/#type=song&mid=002aIsl12I5omi&tpl=yqq_song_detail',
            url: undefined
        };

        qqApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});