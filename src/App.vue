<template>
  <div id="app">
    <div class="container">
      <player-panel></player-panel>
      <transition name="page">
        <search-panel @close="closeSearch" :show="showSearch"></search-panel>
      </transition>
    </div>
  </div>
</template>

<script>
import Player from "./components/Player";
import Search from "./components/Search";
import { EventBus } from "./services/Bus";

export default {
  name: "app",
  data() {
    return {
      showSearch: false
    };
  },
  components: {
    "player-panel": Player,
    "search-panel": Search
  },

  created() {
    EventBus.$on("search.open", () => {
      this.showSearch = true;
    });
  },

  methods: {
    closeSearch() {
      this.showSearch = false;
    }
  }
};
</script>
<style lang="scss" src="./assets/style/main.scss"></style>
