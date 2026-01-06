<template>
  <vuestic-navbar>
    <a
      v-if="isMobile"
      slot="logo"
      href="javascript:void(0)"
      class="col nav-item offset-md-1 col-md-4 col-lg-3"
      @click.prevent="toggleMenuMobile()"
    >
      <div class="menu-container">
        <span class="text-menu">Menu Admin</span>
        <div class="nav-toggle">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </a>

    <profile-dropdown class="col nav-item offset-md-1 col-md-4 col-lg-3">
      <img :src="image" :title="userFirstName" />
    </profile-dropdown>
  </vuestic-navbar>
</template>

<script>
import VuesticNavbar from '../../../vuestic-theme/vuestic-components/vuestic-navbar/VuesticNavbar';
import ProfileDropdown from './components/dropdowns/ProfileDropdown';

export default {
  name: 'app-navbar',
  components: {
    VuesticNavbar,
    ProfileDropdown,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      opened: false,
    };
  },
  computed: {
    userFirstName() {
      return this.$store.state.userProfile.name;
    },
    image() {
      return this.$store.getters.userImage;
    },
    isMobile() {
      return !this.$store.state.screen.isDesktop;
    },
  },
  watch: {
    $route(to, from) {
      if (this.isMobile) {
        this.toggleMenuMobile();
      }
    },
  },
  methods: {
    toggleMenuMobile() {
      const navToggle = document.querySelector('.nav-toggle');
      const bars = document.querySelectorAll('.bar');

      navToggle.addEventListener('click', this.toggleHamburger(bars));
      this.opened = !this.opened;
      this.$emit('toggle-menu', this.opened);
    },
    toggleHamburger(bars) {
      bars.forEach((bar) => bar.classList.toggle('x'));
    },
  },
};
</script>
<style lang="scss">
.menu-container {
  display: flex;
  gap: 20px;
  .text-menu {
    color: white;
    text-decoration: none;
  }
}
.nav-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 22px;
  width: 22px;
}

.nav-toggle .bar {
  height: 3px;
  width: 100%;
  background-color: white;
  transition: all 100ms ease-in-out;
}

.nav-toggle:hover {
  cursor: pointer;
}

.x:nth-of-type(1) {
  transition: all 100ms ease-in-out;
  transform: rotate(45deg);
  transform-origin: top left;
  width: 28px;
}

.x:nth-of-type(2) {
  transition: all 100ms ease-in-out;
  transform-origin: center;
  width: 0;
}

.x:nth-of-type(3) {
  transition: all 100ms ease-in-out;
  transform: rotate(-45deg);
  transform-origin: bottom left;
  width: 28px;
}

.navbar-brand {
  padding-top: 20px !important;
  padding-bottom: 35px !important;
  @media (max-width: 991px) {
    padding: 0 !important;
  }
}
</style>
