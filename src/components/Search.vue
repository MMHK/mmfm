<template>
  <div class="search-penal" v-if="show">

    <div class="wrap clear">
      <div class="search-group">
        <input class="search-input" v-on:keydown.enter="search" type="text" v-model="searchText" placeholder="请输入歌手或歌名">
        <button v-if="!loadingFlag" @click="search" class="btn btn-search">
          <i class="iconfont icon-search"></i> 搜索
        </button>
        <button v-if="loadingFlag" class="btn btn-search">Loading...</button>
      </div>
      <div class="list-wrap">
        <table class="table">
          <tr class="song-list" :key="item.id" v-for="item in songList">
            <td class="vendor" width="50"><img width="50%" :src="'image/' + item.vendor + '.png'" /></td>
            <td class="title"><img :src="item.cover" height="50" />
            <strong>{{item.name}}</strong>
            <br><span>{{item.author}}</span></td>
            <td width="40"><a @click="add(item.vendor, item.id)" class="btn"><i class="iconfont icon-xinzeng"></i></a></td>
          </tr>
        </table>
      </div>
      <a @click="close" class="btn btn-close">
        <i class="iconfont icon-close"></i>
      </a>
    </div>
  </div>
</template>
<script>
import SearchService from "../services/SearchService"
import SongService from "../services/SongService"
import { EventBus } from "../services/Bus"
import { Promise } from 'q';

const searchInstance = new SearchService();
const songService = new SongService();

export default {
  data() {
    return {
      loadingFlag: false,
      searchText: "",
      songList: []
    };
  },

  watch: {
    show(val) {
      if (!val) {
        this.searchText = "";
        this.songList = [];
      }
    }
  },

  props: {
    show: {
      default: false
    }
  },

  methods: {
    close() {
      this.$emit("close");
    },
    search() {
      if (this.searchText.length > 0) {
        this.fetchSearch();
      }
    },
    add(vendor, id) {
      this.loadingFlag = true;
      searchInstance.detail(vendor, id)
      .then((data) => {
        let song = this.songList.find((item) => {
          return (item.vendor == vendor && item.id == id);
        });
        if (song) {
          song.src = data.url;
          song.id = "" + song.id;
          return Promise.resolve(song);
        }
        return Promise.reject();
      })
      .then(data => {
        return songService.preload(data)
      })
      .then(data => {
        EventBus.$emit("song.add", data);
        this.$emit("close");
      })
      .finally(()=> {
         this.loadingFlag = false;
      })
    },
    fetchSearch() {
      this.loadingFlag = true;
      searchInstance
        .search(this.searchText)
        .then(data => {
          this.songList = data;
        })
        .finally(() => {
          this.loadingFlag = false;
        });
    }
  }
};
</script>
