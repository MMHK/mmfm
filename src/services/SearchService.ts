import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

interface SongArtist {
  name: string;
}

interface SongAlbum {
  cover: string;
}

interface SongItem {
  id: string | number;
  name: string;
  artists: SongArtist[];
  album: SongAlbum;
  vendor?: string;
}

interface SearchResultItem {
  songs: SongItem[];
}

interface SearchResponseData {
  [vendor: string]: SearchResultItem;
}

interface SearchResponse {
  status: boolean;
  data: SearchResponseData;
}

export interface SearchResult {
  vendor: string;
  name: string;
  author: string;
  cover: string;
  id: string | number;
}

interface DetailResponse {
  status: boolean;
  data: any;
}

export default class SearchService {
  private API: string;
  private request: AxiosInstance;

  constructor() {
    this.API = (globalThis as any).SEARCH_API_URL || "";
    this.request = axios.create();

    this.request.interceptors.response.use(
      (response: AxiosResponse) => {
        if (response.data) {
          return Promise.resolve(response.data);
        }
        return Promise.reject();
      },
      (error: any) => {
        return Promise.reject(error);
      },
    );
  }

  search(search: string): Promise<SearchResult[]> {
    return this.request
      .get(this.API + "/search", {
        params: {
          keyword: search,
        },
      })
      .then((json: SearchResponse) => {
        if (json && json.status) {
          let data = json.data;
          let list = Object.keys(data)
            .map((key) => {
              return data[key].songs.map((val: SongItem) => {
                val.vendor = key;
                return {
                  vendor: key,
                  name: val.name,
                  author: val.artists
                    .map((item) => {
                      return item.name;
                    })
                    .join(","),
                  cover: val.album.cover,
                  id: val.id,
                };
              });
            })
            .reduce((prev: SearchResult[], current: SearchResult[]) => {
              return prev.concat(...current);
            }, [] as SearchResult[]);

          return Promise.resolve(list);
        }
        return Promise.reject();
      });
  }

  detail(platform: string, id: string | number): Promise<any> {
    return this.request
      .get(this.API + "/detail", {
        params: {
          vendor: platform,
          id: id,
        },
      })
      .then((json: DetailResponse) => {
        if (json && json.status) {
          return Promise.resolve(json.data);
        }
        return Promise.reject();
      });
  }

  hit(url: string): Promise<any> {
    return this.request.get(url);
  }
}
