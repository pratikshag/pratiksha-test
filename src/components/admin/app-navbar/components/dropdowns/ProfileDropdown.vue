<template>
  <div class="profile-dropdown">
    <span class="name">{{ userFullName }}</span>
    <span class="profile-dropdown__avatar-container">
      <slot />
    </span>
    <vuestic-dropdown v-model="isShown" position="bottom">
      <div class="dropdown-item plain-link-item is-disabled">Username: {{ username }}</div>
      <div class="dropdown-item plain-link-item" @click="logout">
        <a class="plain-link" href="#" click="logout()"> Logout </a>
      </div>
    </vuestic-dropdown>
  </div>
</template>

<script>
import Axios from 'axios';
const Config = require('./../../../../../../config/default.env').default;

export default {
  name: 'profile-section',
  data() {
    return {
      isShown: false,
    };
  },
  computed: {
    username() {
      return this.$store.getters.userName;
    },
    userFullName() {
      return this.$store.getters.name;
    },
  },
  methods: {
    logout: function () {
      const self = this;
      return Axios.post(Config.MS_SOCO_ADMIN_API_URL + '/auth/logout').then((response) => {
        if (response.status == '200') {
          self.$store.commit('loggedIn', false);
          self.$store.commit('profileState', {});

          this.refreshUserData();
        }
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../../../../vuestic-theme/vuestic-sass/resources/resources';

.profile-dropdown {
  @include flex-center();
  cursor: pointer;
  padding: 5px 3px 5px 5px !important;
  border-radius: 30px;
  justify-content: flex-end;
  &:hover {
    background-color: #565656;
  }

  .is-disabled {
    background-color: #1d1d1d;
  }

  .name {
    display: inline-block;
    font-size: 15px;
    margin-right: 15px;
    color: #fff;
    font-weight: bolder;
  }

  &__avatar-container {
    display: inline-block;
    width: 38px;
    height: 38px;
    background-color: white;
    border-radius: 50%;
    border: 2px solid $lighter-gray;
    overflow: hidden;

    img {
      height: 100%;
      width: 100%;
      object-fit: cover;
      max-width: unset;
    }
  }
}
</style>
