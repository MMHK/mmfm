const kugouApi = require("../src/services/provider/kugou");

describe("kugouAPI", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "玩咗先至訓";

        kugouApi.search(keywords)
            .then((data) => {
                const {result, total, type} = data;
                console.log(result);
            })

    });

    it("song", function () {
        this.timeout(600000);

        const track = {
            id: 'kgtrack_6F24DD637A953E2C2EAA80E45DD5DA61',
            title: '玩咗先至瞓',
            artist: '郑中基',
            artist_id: 'kgartist_3540',
            album: '玩咗先至瞓',
            album_id: 'kgalbum_43565435',
            source: 'kugou',
            source_url: 'https://www.kugou.com/song/#hash=6F24DD637A953E2C2EAA80E45DD5DA61&album_id=43565435',
            img_url: undefined,
            lyric_url: '6F24DD637A953E2C2EAA80E45DD5DA61'
        };

        kugouApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});