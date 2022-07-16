const neteaseApi = require("../src/services/provider/netease");

describe("neteaseApi", function() {

    it("search", function () {
        this.timeout(11600000);

        const keywords = "最伟大的作品";

        return neteaseApi.search(keywords)
            .then((data) => {
                console.log(data);
            })

    });

    it("song", function () {
        this.timeout(600000);

        const track = {
            id: 'netrack_441120217',
            title: '推开世界的门',
            artist: '杨乃文',
            artist_id: 'neartist_10198',
            album: '离心力',
            album_id: 'nealbum_34984449',
            source: 'netease',
            source_url: 'https://music.163.com/#/song?id=441120217',
            img_url: 'https://p1.music.126.net/4ESdAPfVH-tAMl-pRYNE3A==/3399689972238493.jpg',
            url: ''
        };

        return neteaseApi.song(track)
            .then((data) => {
                console.dir(data)
            })

    });
});