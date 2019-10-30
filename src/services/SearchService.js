import axios from "axios";

export default class {
    constructor(){
        this.API = global.SEARCH_API_URL || "";
    }

    search(search) {
        return axios
            .get(this.API + "/search", {
                params: {
                    keyword: search
                }
            })
            .then((json) => {
                if (json && json.status) {
                    let data = json.data;
                    let list = Object.keys(data).map((key) => {
                        return data[key].songs.map((val) => {
                            val.vendor = key;
                            return {
                                vendor: key,
                                name: val.name,
                                author: val.artists.map(item =>{
                                    return item.name;
                                }).join(","),
                                cover: val.album.cover,
                                id: val.id
                            };
                        });
                    }).reduce((prev, current)=> {
                        return prev.concat(...current);
                    }, []);

                    return Promise.resolve(list)
                }
                return Promise.reject()
            })
    }

    detail(platform, id) {
        return axios
            .get(this.API + "/url", {
                params:{
                    vendor: platform,
                    id: id
                }
            })
            .then((json) => {
                if (json && json.status) {
                    return Promise.resolve(json.data)
                }
                return Promise.reject()
            })
    }

    hit(url) {
        return axios.get(url);
    }
}