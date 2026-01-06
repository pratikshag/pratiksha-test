<template>
  <div id="app" class="app">
    <router-view v-if="loaded"></router-view>
    <!-- set progressbar -->
    <vue-progress-bar v-if="!loaded"></vue-progress-bar>
  </div>
</template>

<script>
import './router'; // tried to delete this but i got an error, store state getters undefined on chart component

export default {
  name: 'app',
  data() {
    return {
      loaded: false,
    };
  },
  computed: {
    loggedin() {
      return this.$store.state.loggedin;
    },
  },
  watch: {
    async loggedin(val) {
      if (val) {
        const allow = await this.$store.dispatch('checkPermission', this.$route);
        if (!allow) {
          this.$router.push({ name: 'unauthorized' });
        }
      }
    },
  },
  created() {
    this.$store.dispatch('fetchSso').finally(() => {
      this.loaded = true;
    });
  },
};
</script>

<style lang="scss">
@import 'assets/css/main.css';
@import 'assets/css/util.css';
@import 'assets/css/scrollbar.css';
@import 'assets/css/animate.css';
@import 'sass/main';

body {
  height: 100%;
  #app {
    height: 100%;
  }
}
</style>
