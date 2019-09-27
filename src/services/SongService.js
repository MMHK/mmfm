import axios from "axios";
import qs from "qs";

export default class {
    constructor() {
        this.API = global.API_URL || "";

        axios.interceptors.response.use((response) => {
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
        return axios.post(this.API + "/song/save",
            qs.stringify({
                list: JSON.stringify(src)
            }));
    }

    getPlaylist() {
        return axios.get(this.API + "/song/get");
    }
}