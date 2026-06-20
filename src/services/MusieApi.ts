import neteaseService from "./provider/netease";
import kugouService from "./provider/kugou";
import bilibiliService from "./provider/bilibili";
import flatCache from "flat-cache";
import os from "os";

interface Track {
  id: string;
  title: string;
  artist: string;
  source: string;
  duration?: string;
  img_url?: string;
  source_url?: string;
  url?: string;
  song_url?: string;
  [key: string]: unknown;
}

interface SearchResult {
  total: number;
  result: Track[];
}

interface SongItem {
  album: { cover?: string };
  artists: { name: string }[];
  name: string;
  id: string;
  link: string;
  vendor: string;
}

interface SearchResponse {
  [source: string]: {
    total: number;
    songs: SongItem[];
  };
}

const cache = flatCache.load("musicCache", os.tmpdir());

export const search = (keywork: string): Promise<SearchResponse> => {
  return Promise.all([
    neteaseService.search(keywork),
    kugouService.search(keywork).catch(() => {
      return Promise.resolve([]);
    }),
    bilibiliService.search(keywork).catch(() => {
      return Promise.resolve([]);
    }),
  ]).then((dataList: SearchResult[]) => {
    const list = Array.from(dataList).reduce(function (
      last: SearchResponse,
      row: SearchResult
    ) {
      if (
        row.result &&
        row.result.length > 0 &&
        row.result[0].source &&
        !last[row.result[0].source]
      ) {
        last[row.result[0].source] = {
          total: row.total,
          songs: Array.from(row.result).map((item: Track) => {
            cache.setKey(item.id, item);

            return {
              album: {
                cover: item.img_url,
              },
              artists: [
                {
                  name: item.artist,
                },
              ],
              name: item.title,
              id: item.id,
              link: item.source_url,
              vendor: item.source,
            };
          }),
        };
      }
      return last;
    }, {} as SearchResponse);

    cache.save();

    return list;
  });
};

export const song = (track_id: string): Promise<Track> => {
  const track = cache.getKey(track_id);
  if (!track) {
    return Promise.reject("no cache found");
  }
  return Promise.resolve(track);
};

export const url = (track_id: string): Promise<unknown> => {
  const track: Track = cache.getKey(track_id);
  if (!track) {
    return Promise.reject("no cache found");
  }

  const provider = track.source;
  switch (provider) {
    case "netease":
      return neteaseService.song(track);
    case "kugou":
      return kugouService.song(track);
    case "bilibili":
      return bilibiliService.song(track);
  }

  return Promise.reject("no provider found");
};
