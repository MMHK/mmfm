const MiguService = require("./provider/migu");
const KuwoService = require("./provider/kuwo");
const QQService = require("./provider/qq");
const neteaseService = require("./provider/netease");
const kugouService = require("./provider/kugou");
const bilibiliService = require("./provider/bilibili");
const flatCache = require('flat-cache');
const os = require("os");

const cache = flatCache.load("musicCache", os.tmpdir());

exports.search = (keywork) => {
    return Promise.all([neteaseService.search(keywork)
        , QQService.search(keywork).catch((error) => {
            return Promise.resolve([]);
        })
        , MiguService.search(keywork).catch((error) => {
            return Promise.resolve([]);
        })
        , KuwoService.search(keywork).catch((error) => {
            return Promise.resolve([]);
        })
        , kugouService.search(keywork).catch((error) => {
            return Promise.resolve([]);
        })
        , bilibiliService.search(keywork).catch((error) => {
            return Promise.resolve([]);
        })
    ])
        .then((dataList) => {
            const list = Array.from(dataList).reduce(function (last, row) {
                if (row.result && row.result.length > 0 && row.result[0].source && !last[row.result[0].source]) {
                    last[row.result[0].source] = {
                        total: row.total,
                        songs: Array.from(row.result).map((item) => {
                            cache.setKey(item.id, item);

                            return {
                                album: {
                                    cover: item.img_url
                                },
                                artists: [
                                    {
                                        name: item.artist
                                    }
                                ],
                                name: item.title,
                                id: item.id,
                                link: item.source_url,
                                vendor: item.source
                            }
                        })
                    };
                }
                return last
            }, {});

            cache.save();

            return list;
        })
};

exports.song = (track_id) => {
    const track = cache.getKey(track_id);
    if (!track) {
        return Promise.reject("no cache found")
    }
    return Promise.resolve(track);
};

exports.url = (track_id) => {
    const track = cache.getKey(track_id);
    if (!track) {
        return Promise.reject("no cache found")
    }

    const provider = track.source;
    switch (provider) {
        case "qq":
            return QQService.song(track);
        case "netease":
            return neteaseService.song(track);
        case "kuwo":
            return KuwoService.song(track);
        case "migu":
            return MiguService.song(track);
        case "kugou":
            return kugouService.song(track);
        case "bilibili":
            return bilibiliService.song(track);
    }

    return Promise.reject("no provider found");
};
