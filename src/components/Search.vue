<template>
  <div class="search-penal" v-if="show">
    <div class="wrap clear">
      <div class="search-group">
        <input
          class="search-input"
          v-on:keydown.enter="search"
          type="text"
          v-model="searchText"
          placeholder="请输入歌手或歌名"
        />
        <button v-if="!loadingFlag" @click="search" class="btn btn-search">
          <i class="iconfont icon-search"></i> 搜索
        </button>
        <button v-if="loadingFlag" class="btn btn-search">Loading...</button>
        <button
          @click="showSettings = !showSettings"
          class="btn btn-settings"
          title="Cookie 设定"
        >
          ⚙
        </button>
      </div>
      <div class="settings-panel" v-if="showSettings">
        <div class="settings-header">
          <h3>Cookie 设定</h3>
          <button @click="showSettings = false" class="btn">✕</button>
        </div>
        <div v-for="p in ['youtube', 'bilibili']" :key="p" class="cookie-block">
          <div class="cookie-label">
            {{ p === "youtube" ? "YouTube" : "Bilibili" }}
            <span class="cookie-status">
              <span
                :class="[
                  'status-dot',
                  cookieStatus[p].exists ? 'status-exists' : 'status-missing',
                ]"
              ></span>
              {{
                cookieStatus[p].exists
                  ? "最近更新 " + formatTime(cookieStatus[p].updatedAt)
                  : "未设定"
              }}
            </span>
          </div>
          <input type="file" accept=".txt" @change="onFileChange(p, $event)" />
          <button @click="uploadCookie(p)" class="btn btn-upload">上传</button>
        </div>
      </div>
      <div class="list-wrap">
        <table class="table">
          <tr class="song-list" :key="item.id" v-for="item in songList">
            <td class="vendor" width="50">
              <img width="50%" :src="'image/' + item.vendor + '.png'" />
            </td>
            <td class="title">
              <img @error="onImgError" :src="item.cover" height="50" />
              <strong v-html="item.name"></strong>
              <br /><span>{{ item.author }}</span>
            </td>
            <td width="40">
              <a @click="add(item.vendor, item.id)" class="btn"
                ><i class="iconfont icon-xinzeng"></i
              ></a>
            </td>
          </tr>
        </table>
      </div>
      <a @click="close" class="btn btn-close">
        <i class="iconfont icon-close"></i>
      </a>
    </div>
    <div class="toast-wrap" v-if="toast.visible">
      <div
        :class="[
          'toast',
          toast.type === 'error' ? 'toast-error' : 'toast-success',
        ]"
      >
        {{ toast.message }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import SearchService from "../services/SearchService";
import SongService from "../services/SongService";
import { EventBus } from "../services/Bus";
import axios from "axios";
import qs from "qs";

const searchInstance = new SearchService();
const songService = new SongService();

export default {
  data() {
    return {
      loadingFlag: false,
      searchText: "",
      songList: [],
      showSettings: false,
      cookieStatus: {
        youtube: { exists: false, updatedAt: null },
        bilibili: { exists: false, updatedAt: null },
      },
      selectedFiles: {
        youtube: null,
        bilibili: null,
      },
      toast: { visible: false, message: "", type: "info" },
      toastTimer: null,
    };
  },

  mounted() {
    this.fetchCookieStatus();
  },

  watch: {
    show(val) {
      if (!val) {
        this.searchText = "";
        this.songList = [];
      }
    },
  },

  props: {
    show: {
      default: false,
    },
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
      return songService
        .preload({
          src: id,
        })
        .then((data) => {
          EventBus.emit("song.add", data);
          this.$emit("close");
        })
        .finally(() => {
          this.loadingFlag = false;
        });
    },
    fetchSearch() {
      this.loadingFlag = true;
      searchInstance
        .search(this.searchText)
        .then((data) => {
          this.songList = data;
        })
        .catch((res) => {
          if (res && Array.isArray(res.cookieNeed) && res.cookieNeed.length) {
            const names = res.cookieNeed
              .map((p) => (p === "youtube" ? "YouTube" : "Bilibili"))
              .join("、");
            this.showToast("需要更新 " + names + " 的 Cookie", "error");
            return;
          }
        })
        .finally(() => {
          this.loadingFlag = false;
        });
    },
    async fetchCookieStatus() {
      try {
        const res = await axios.get("/api/cookies/status");
        if (res && res.data && res.data.youtube)
          this.cookieStatus.youtube = res.data.youtube;
        if (res && res.data && res.data.bilibili)
          this.cookieStatus.bilibili = res.data.bilibili;
      } catch {
        // silently ignore
      }
    },
    onFileChange(platform, event) {
      const input = event.target;
      this.selectedFiles[platform] = input.files?.[0] || null;
    },
    async uploadCookie(platform) {
      const file = this.selectedFiles[platform];
      if (!file) {
        this.showToast("请先选择档案", "error");
        return;
      }
      const text = await file.text();
      if (!text.trim()) {
        this.showToast("档案内容为空", "error");
        return;
      }
      try {
        await axios.post(
          "/api/cookies/" + platform,
          qs.stringify({ content: text }),
        );
        this.showToast("Cookie 更新成功", "success");
        this.selectedFiles[platform] = null;
        await this.fetchCookieStatus();
      } catch (err) {
        this.showToast(err?.response?.data?.error || "上传失败", "error");
      }
    },
    showToast(message, type = "info") {
      this.toast = { visible: true, message, type };
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => {
        this.toast.visible = false;
      }, 3000);
    },
    onImgError(e) {
      const fallback = require("../assets/image/default-cover.png");
      if (e.target.src !== fallback) e.target.src = fallback;
    },
    formatTime(ts) {
      if (!ts) return "未设定";
      const diff = Math.floor((Date.now() - ts) / 1000);
      if (diff < 60) return "刚刚";
      if (diff < 3600) return Math.floor(diff / 60) + " 分钟前";
      if (diff < 86400) return Math.floor(diff / 3600) + " 小时前";
      return Math.floor(diff / 86400) + " 天前";
    },
  },
};
</script>
