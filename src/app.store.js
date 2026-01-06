import Vue from 'vue';
import Vuex from 'vuex';
import VuexI18n from 'vuex-i18n'; // load vuex i18n module

import getters from 'vuex-store/getters'; // root getters
import actions from 'vuex-store/actions'; // root actions
import mutations from 'vuex-store/mutations'; // root mutations

// modules
import categories from 'vuex-store/modules/categories/categories-index';
import contacts from 'vuex-store/modules/contacts/contacts-index';
import posts from 'vuex-store/modules/posts/posts-index';
import products from 'vuex-store/modules/products/products-index';
import files from 'vuex-store/modules/files/files-index';
import jobs from 'vuex-store/modules/jobs/jobs-index';
import freebies from 'vuex-store/modules/freebies/freebies-index';
import users from 'vuex-store/modules/users/users-index';
import modal from 'vuex-store/modules/modal/modal';
import $_Auth from 'vuex-store/modules/auth/auth';
import screen from 'vuex-store/modules/screen/screen';
import sbn from './store/modules/sbn/sbn';

import menus from 'vuex-store/menu';

const Config = require('../config/default.env').default;

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    SOCIOLLA_ADMIN_URL: Config.SOCIOLLA_ADMIN_URL,

    userimage: '/assets/images/avatar-soco.png',
    name: '',
    dashboardToken: '',
    user_id: null,
    username: '',
    loggedin: false,
    userrole: '',
    userProfile: {},
    isLoading: false,

    app: {
      sidebar: {
        opened: false,
        withoutAnimation: false,
      },
      config: {
        googleMaps: {
          apiKey: 'AIzaSyBNAqPrTQoz9P4NBlDDyfxrnKiafkaL8iQ',
        },
        windowMatchSizeLg: '(min-width: 992px)',
        palette: {
          primary: '#4ae387',
          danger: '#e34a4a',
          info: '#4ab2e3',
          success: '#db76df',
          warning: '#f7cc36',
          white: '#fff',
          black: '#000',
          fontColor: '#34495e',
          transparent: 'transparent',
          lighterGray: '#ddd',
        },
      },
      isLoading: true,
    },
    menus: menus,
    menu_permission: [],
  },

  getters,
  actions,
  mutations,

  modules: {
    categories,
    contacts,
    posts,
    products,
    files,
    jobs,
    freebies,
    users,
    modal,
    $_Auth,
    screen,
    sbn,
  },
});

Vue.use(VuexI18n.plugin, store);

export default store;
