import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import qs from "qs";

export interface PlaylistItem {
    id: string;
    name: string;
    author: string;
    src: string;
    cover: string;
}

interface PreloadResponse {
    status: boolean;
    url: string;
}

interface SongInput {
    src: string;
    [key: string]: any;
}

export default class SongService {
    private API: string;
    private request: AxiosInstance;

    constructor() {
        this.API = (globalThis as any).API_URL || "";
        this.request = axios.create();

        this.request.interceptors.response.use((response: AxiosResponse) => {
            if (response.data) {
                return Promise.resolve(response.data);
            }
            return Promise.reject();
        }, (error: any) => {
            return Promise.reject(error);
        });
    }

    savePlaylist(playlist: PlaylistItem[]): Promise<any> {
        var src = playlist.map((item) => {
            return {
                id: "",
                name: item["name"] || "",
                author: item["author"] || "",
                src: item["src"] || "",
                cover: item["cover"] || ""
            }
        });
        return this.request.post(this.API + "/song/save",
            qs.stringify({
                list: JSON.stringify(src)
            }));
    }

    preload(song: SongInput): Promise<SongInput> {
        return this.request.post(this.API + "/song/preload",
            qs.stringify({
                url: song.src
            }))
            .then((data: PreloadResponse) => {
                if (data.status) {
                    let dest = data.url.replace(/^http(s?):\/\/([^/]+)/i, "http://" + location.host)
                    song.src = dest
                    return Promise.resolve(song)
                }
                return Promise.reject()
            });
    }

    getPlaylist(): Promise<any> {
        return this.request.get(this.API + "/song/get");
    }
}
