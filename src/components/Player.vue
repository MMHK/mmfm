<template>
  <div class="player-wrap fm">
    <div id="ablums" class="fm-ablums">
      <div class="fm-ablums-photo">
        <img
          :src="album.cover"
          @error="onImgError"
          alt="music ablums"
        />
      </div>
      <div class="fm-ablums-name">
        <h2 class="name-title">
          <i class="iconfont icon-music"></i>
          <a target="_blank" v-html="album.name"></a>
        </h2>
        <span v-if="album.author" class="name-anthor">
          <i class="fa fa-user"></i>
          {{ album.author }}
        </span>
      </div>

      <div id="ablums-contrl" class="ablums-contrl">
        <div class="time-wrap">{{ current }} / {{ total }}</div>
        <a v-on:click="prevItem" id="song-prev" class="btn contrl-icon prev">
          <i class="iconfont icon-skip-previous"></i>
        </a>
        <a
          v-if="paused"
          v-on:click="Play"
          id="song-play"
          class="btn contrl-icon switch"
        >
          <i class="iconfont icon-play"></i>
        </a>
        <a
          v-if="playing"
          v-on:click="Pause"
          id="song-stop"
          class="btn contrl-icon switch"
        >
          <i class="iconfont icon-stop"></i>
        </a>
        <a v-on:click="nextItem" id="song-next" class="btn contrl-icon next">
          <i class="iconfont icon-skip-next"></i>
        </a>
      </div>
      <div class="fm-tools clear">
        <input
          id="url"
          name="url"
          class="fm-add-url"
          type="text"
          v-model="playURL"
        />
        <a v-on:click="searchSong" id="add" title="添加" class="btn">
          <i class="iconfont icon-xinzeng"></i>
        </a>
        <a v-on:click="searchSong" id="search" title="搜索" class="btn">
          <i class="iconfont icon-search"></i>
        </a>
      </div>
      <div class="fm-list-title">
        <i class="iconfont icon-list"></i> 歌曲列表
        <a v-on:click="checkAll" class="btn btn-select-all" title="全选">
          <i class="iconfont icon-select-all"></i>
        </a>
      </div>
      <div id="list" class="fm-list clear ui-sortable">
        <draggable
          v-model="playlist"
          :item-key="(item, index) => index"
          @change="sortPlayList"
        >
          <template #item="{ element: item, index }">
            <div
              :class="['fm-list-item', playingClass[index]]"
              :id="'item_' + index"
            >
              <div class="item-name" :data-id="index">
                <i class="iconfont icon-music"></i>
                <a
                  class="music-url"
                  :href="item.src"
                  target="_blank"
                  :title="item.name"
                  v-html="item.name"
                ></a>
              </div>
              <div class="item-contrl" :data-id="index">
                <a
                  v-on:click="PlayItem(index, $event)"
                  class="btn play"
                  :data-src="item.src"
                  title="播放"
                >
                  <i class="iconfont icon-play"></i>
                </a>
                <span v-on:click="checkItem(index)" class="btn item-checkbox">
                  <i
                    v-if="!playlistCheckClass[index]"
                    class="iconfont icon-check-box-outline-bl"
                  ></i>
                  <i
                    v-if="playlistCheckClass[index]"
                    class="iconfont icon-checkbox"
                  ></i>
                </span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
      <div>
        <a v-if="ckecking" v-on:click="DelItem" class="btn btn-delete">
          <i class="iconfont icon-close"></i> 删除
        </a>
      </div>
      <a
        class="fm-intro-btn"
        target="_blank"
        alt="帮助"
        title="帮助"
        href="https://github.com/MMHK/mmfm"
      >
        <i class="iconfont icon-Info"></i> v2.7
      </a>
    </div>
  </div>
</template>
<script lang="ts">
import moment from "moment";
import { EventBus } from "../services/Bus";
import ChatService from "../services/ChatService";
import SongService from "../services/SongService";
import draggable from "vuedraggable";

let chat = new ChatService();
let song = new SongService();

export default {
  data() {
    return {
      checkall: false,
      currentSecond: 0,
      totalSecond: 0,
      ckecking: false,
      paused: false,
      playing: false,
      playingID: 0,
      searchList: false,
      playURL: "",
      playlist: [],
      album: {
        cover: "image/default-cover.png",
        name: "MixMedia FM",
        src: "",
        author: "",
      },
      playingClass: [],
      playlistCheckClass: [],
      audio: null,
    };
  },

  components: {
    draggable,
  },

  computed: {
    total() {
      return moment.unix(this.totalSecond).utc().format("HH:mm:ss");
    },
    current() {
      return moment.unix(this.currentSecond).utc().format("HH:mm:ss");
    },
  },

  created() {
    if (process.env.LOCAL_PLAYER_MODE === "true") {
      this.audio = new Audio();
      this.audio.addEventListener("timeupdate", this.onTimeUpdate);
      this.audio.addEventListener("loadedmetadata", this.onLoadedMetadata);
      this.audio.addEventListener("play", this.onAudioPlay);
      this.audio.addEventListener("pause", this.onAudioPause);
      this.audio.addEventListener("ended", this.onAudioEnded);
      this.audio.addEventListener("error", this.onAudioError);
      this.updatePlaylist();
      EventBus.on("song.add", (song) => {
        this.playlist.push(song);
        this.sortPlayList();
      });
      return;
    }

    this.updatePlaylist();

    EventBus.on(ChatService.CMD.ready, () => {
      EventBus.on(ChatService.CMD.player.playing, (args) => {
        let item = this.playlist.findIndex((val) => {
          return val.src == args[0].src;
        });

        this.PlayItem(item || 0);
        this.album = args[0];
        this.playing = true;
        this.paused = false;
        this.currentSecond = args[2] || 0;
        this.totalSecond = args[3] || 0;
      });

      EventBus.on(ChatService.CMD.player.pause, (args) => {
        this.playing = false;
        this.paused = true;
        this.album = args[0];
        this.currentSecond = args[2] || 0;
        this.totalSecond = args[3] || 0;
      });

      EventBus.on(ChatService.CMD.playlist.update, () => {
        this.updatePlaylist();
      });

      chat.player().current();
    });

    EventBus.on("song.add", (song) => {
      this.playlist.push(song);
      this.sortPlayList();
    });
  },

  methods: {
    PlayItem(index, e) {
      let item = this.playlist[index] || {
        name: "",
        cover: "image/logo.jpg",
        src: "",
        author: "",
      };
      this.album = item;
      this.playingClass.forEach((val, i) => {
        this.playingClass[i] = "";
      });
      this.playingID = index;
      this.playingClass[index] = "playing";

      if (process.env.LOCAL_PLAYER_MODE === "true") {
        this.audio.src = this.album.src || this.playlist[index].src;
        this.audio.play();
        return;
      }

      if (e) {
        chat.player().play(this.album, this.playingID);
      }
    },
    checkAll() {
      this.checkall = !this.checkall;
      this.playlistCheckClass.forEach((val, i) => {
        this.playlistCheckClass[i] = this.checkall;
      });

      this.playlistCheckClass[this.playingID] = false;

      this.ckecking = this.checkall;
    },

    checkItem(index) {
      this.playlistCheckClass[index] = !this.playlistCheckClass[index];
      let select_count = this.playlistCheckClass.filter((item) => {
        return item;
      }).length;
      this.ckecking = select_count > 0;
    },

    DelItem: function () {
      this.playlistCheckClass[this.playingID] = false;
      let playlist = [];
      this.playlistCheckClass.forEach((val, i) => {
        if (!val) {
          playlist.push(this.playlist[i]);
        }
      });
      this.playlist = playlist;
      this.ckecking = false;

      const playingIndex = this.playlist.findIndex(
        (val) => val.src === this.album.src,
      );
      if (playingIndex !== -1) {
        this.playingID = playingIndex;
      }

      this.sortPlayList();
    },

    addSong() {
      if (this.playURL && this.playURL.length > 0) {
        song.addSong(this.playURL).then((json) => {
          this.playlist = this.playlist.concat(json);
          song.savePlaylist(this.playlist).then((json) => {
            json.forEach((val, i) => {
              this.playingClass[i] = "";
              this.playlistCheckClass[i] = false;

              if (i == this.playingID) {
                this.playingClass[i] = "playing";
              }
            });
            this.playlist = json;
            chat.playlist.update();
          });
        });
      }
      this.playURL = "";
    },

    searchSong() {
      EventBus.emit("search.open");
    },

    updatePlaylist() {
      song.getPlaylist().then((json) => {
        let flag = false;
        json.forEach((val, i) => {
          this.playingClass[i] = "";
          this.playlistCheckClass[i] = false;
          if (!flag && json[i].src === this.album.src) {
            flag = true;
            this.playingClass[i] = "playing";
            this.playingID = i;
          }
        });
        this.playlist = json;
      });
    },

    sortPlayList() {
      song.savePlaylist(this.playlist).then(() => {
        let playingClass = [],
          playlistCheckClass = [];

        this.playlist.forEach((val, i) => {
          playingClass[i] = "";
          playlistCheckClass[i] = false;
        });

        const playingIndex = this.playlist.findIndex(
          (val) => val.src === this.album.src,
        );
        if (playingIndex !== -1) {
          this.playingID = playingIndex;
          playingClass[playingIndex] = "playing";
        }

        this.playingClass = playingClass;
        this.playlistCheckClass = playlistCheckClass;

        chat.playlist().update();
      });
    },

    Play() {
      if (process.env.LOCAL_PLAYER_MODE === "true") {
        this.audio.play();
        return;
      }
      chat.player().continue();
    },

    Pause() {
      if (process.env.LOCAL_PLAYER_MODE === "true") {
        this.audio.pause();
        return;
      }
      chat.player().pause();
      chat.player().current();
    },

    prevItem() {
      let index = this.playingID - 1;
      if (index < 0) {
        index = this.playlist.length - 1;
      }
      this.PlayItem(index);
      if (process.env.LOCAL_PLAYER_MODE === "true") return;
      chat.player().play(this.album, this.playingID);
    },

    nextItem() {
      let index = this.playingID + 1;
      if (index > this.playlist.length - 1) {
        index = 0;
      }
      this.PlayItem(index);
      if (process.env.LOCAL_PLAYER_MODE === "true") return;
      chat.player().play(this.album, this.playingID);
    },

    onTimeUpdate() {
      this.currentSecond = this.audio.currentTime;
    },
    onLoadedMetadata() {
      this.totalSecond = this.audio.duration;
    },
    onAudioPlay() {
      this.playing = true;
      this.paused = false;
    },
    onAudioPause() {
      this.playing = false;
      this.paused = true;
    },
    onAudioEnded() {
      this.nextItem();
    },
    onAudioError(e) {
      console.error("Audio playback error:", e);
    },
    onImgError(e) {
      const fallback = require('../assets/image/default-cover.png');
      if (e.target.src !== fallback) e.target.src = fallback;
    },
  },

  beforeUnmount() {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeEventListener("timeupdate", this.onTimeUpdate);
      this.audio.removeEventListener("loadedmetadata", this.onLoadedMetadata);
      this.audio.removeEventListener("play", this.onAudioPlay);
      this.audio.removeEventListener("pause", this.onAudioPause);
      this.audio.removeEventListener("ended", this.onAudioEnded);
      this.audio.removeEventListener("error", this.onAudioError);
      this.audio = null;
    }
  },
};
</script>
