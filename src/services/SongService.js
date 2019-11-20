import axios from "axios";
import qs from "qs";

export default class {
    constructor() {
        this.API = global.API_URL || "";
        this.request = axios.create();

        this.request.interceptors.response.use((response) => {
            if (response.data) {
                return Promise.resolve(response.data);
            }
            return Promise.reject();
        }, (error) => {
            return Promise.reject(error);
        });
    }

    savePlaylist(playlist) {
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

    preload(song) {
        return this.request.post(this.API + "/song/preload",
            qs.stringify({
                url: song.src
            }))
            .then((data) => {
                if (data.status) {
                    let dest = data.url.replace(/^http(s?):\/\/([^\/]+)/i, "http://" + location.host)
                    song.src = dest
                    return Promise.resolve(song)
                }
                return Promise.reject()
            });
    }

    getPlaylist() {
        return this.request.get(this.API + "/song/get");
    }
}