const miguApi = require("../src/services/provider/migu");

describe("kuwoAPI", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "推开世界的门";

        miguApi.search(keywords)
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
            id: 'mgtrack_60057759769',
            title: '推开世界的门',
            artist: '杨乃文',
            artist_id: 'mgartist_591',
            album: '离心力',
            album_id: 'mgalbum_1004619203',
            source: 'migu',
            source_url: 'https://music.migu.cn/v3/music/song/60057759769',
            img_url: 'http://d.musicapp.migu.cn/prod/file-service/file-down/b1899d500dda5db2da11df3efc89cba6/d6ac70e448ff3cd5d545cf44d0d7a2c0/665d1b062398e7d106c2357b0913c191',
            lyric_url: 'http://d.musicapp.migu.cn/prod/file-service/file-down/5374c8e0f2e20a96df952a8b075279ac/429b0758d0e44f40f5afd6b39213adde/a7602aa2e04016673f88d3ff2fc25989',
            tlyric_url: '',
            quality: '111100',
            song_id: '1004665871'
        };

        miguApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});