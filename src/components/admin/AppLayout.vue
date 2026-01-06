<template>
  <vuestic-layout v-layout>
    <app-navbar :is-open="opened" @toggle-menu="toggleMenuNew" />
    <app-sidebar :is-open="isDesktop || (!isDesktop && openedMenu)" />
    <main id="content" slot="content" class="content" role="main">
      <vuestic-pre-loader v-show="isLoading" class="pre-loader"></vuestic-pre-loader>
      <router-view></router-view>
      <template v-if="$route.name == 'admin'">
        <div class="welcome-page">
          <div class="welcome-content">
            <div class="welcome-logo">
              <img src="@/assets/icons/logo-soco.png" />
            </div>
            <div class="welcome-desc">Welcome to SOCO Admin!</div>
          </div>
        </div>
      </template>
    </main>
    <!--     <span slot="footer">©2018. Made by&nbsp;<a href="https://epicmax.co" target="_blank">Epicmax </a></span>
         -->
  </vuestic-layout>
</template>

<script>
import VuesticLayout from '../../vuestic-theme/vuestic-components/vuestic-layout/VuesticLayout';
import AppNavbar from './app-navbar/AppNavbar';
import AppSidebar from './app-sidebar/AppSidebar';
import Layout from 'vuestic-theme/vuestic-directives/Layout';
import { debounce } from 'lodash';

export default {
  name: 'app-layout',
  components: {
    VuesticLayout,
    AppNavbar,
    AppSidebar,
  },
  directives: {
    layout: Layout,
  },
  data() {
    return {
      opened: true,
      openedMenu: true,
    };
  },
  computed: {
    isLoading() {
      return this.$store.state.isLoading;
    },
    isDesktop() {
      return this.$store.state.screen.isDesktop;
    },
  },
  mounted() {
    this.getWindowSize();
  },
  methods: {
    toggleSidebar(opened) {
      this.opened = opened;
    },
    toggleMenuNew(params) {
      this.openedMenu = params;
    },
    getWindowSize() {
      const w = window;
      const d = document;
      const e = d.documentElement;
      const g = d.getElementsByTagName('body')[0];
      const windowWidth = w.innerWidth || e.clientWidth || g.clientWidth;
      const windowHeight = w.innerHeight || e.clientHeight || g.clientHeight;

      this.$store.dispatch('setScreenSize', {
        width: windowWidth,
        height: windowHeight,
      });
      window.addEventListener('resize', debounce(this.onWindowResize, 150));
    },
    onWindowResize(event) {
      const w = window;
      const d = document;
      const e = d.documentElement;
      const g = d.getElementsByTagName('body')[0];
      const windowWidth = w.innerWidth || e.clientWidth || g.clientWidth;
      const windowHeight = w.innerHeight || e.clientHeight || g.clientHeight;

      this.$store.dispatch('setScreenSize', {
        width: windowWidth,
        height: windowHeight,
      });
    },
  },
};
</script>

<style lang="scss">
.vuestic-sidebar,
.vuestic-navbar.navbar {
  position: fixed;
}

.vuestic-sidebar {
  top: 58px;
}

.vuestic-navbar.navbar {
  width: 100%;
  z-index: 1;
  background-color: #676767; // Navbar color
}

.scrollbar-wrapper {
  height: calc(100vh - 58px);
  // background-color: #DA709E;
  background-color: #4a4a4a; // Scrollbar sidebar color
}
</style>
