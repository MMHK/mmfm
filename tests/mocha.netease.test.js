const neteaseApi = require("../src/services/provider/netease");

describe("neteaseApi", function() {

    it("search", function () {
        this.timeout(600000);

        const keywords = "推开世界的门";

        neteaseApi.search(keywords)
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
            id: 'netrack_1397315005',
            title: '推开世界的门',
            artist: '泡面',
            artist_id: 'neartist_33297461',
            album: '推开世界的门',
            album_id: 'nealbum_82385223',
            source: 'netease',
            source_url: 'https://music.163.com/#/song?id=1397315005',
            img_url: 'https://p1.music.126.net/OZUDTDVtwuCAm6nt4VdDTA==/109951164430926153.jpg',
            url: undefined
        };

        neteaseApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});