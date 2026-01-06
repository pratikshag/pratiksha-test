// Polyfills
// import 'es6-promise/auto'
// import 'babel-polyfill'

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VeeValidate from 'vee-validate';
import App from './App';
import store from './app.store';
import router from './router';
import Axios from 'axios';
import VuesticPlugin from '@/vuestic-theme/vuestic-plugin';
import './i18n';
import YmapPlugin from 'vue-yandex-maps';
import '@/sass/style.scss';
import Paginate from 'vuejs-paginate';
import VueProgressBar from 'vue-progressbar';
import VModal from 'vue-js-modal';
import interceptorsSetup from './shared/interceptors';
import 'vue-loaders/dist/vue-loaders.css';
import $SO from '@/shared/package/socio-lib';
import * as VueLoaders from 'vue-loaders';
import VuejsDialog from 'vuejs-dialog';
import 'vuejs-dialog/dist/vuejs-dialog.min.css';
import helper from './helper';
import './filter';
import moment from 'moment-timezone';
import TableEmpty from '@/components/tables/TableEmpty';
import Toasted from 'vue-toasted';

Vue.use(VModal, { dynamic: true, injectModalsContainer: true });

Vue.use(VueProgressBar, {
  color: 'rgb(143, 255, 199)',
  failedColor: 'red',
  height: '3px',
});
Vue.use(VuejsDialog);

Vue.use(VueLoaders);

Vue.component('TableEmpty', TableEmpty);

Vue.mixin({
  methods: {
    ...helper,
    refreshUserData() {
      const is_admin_soco = store.getters.isAdmin;

      if (!store.state.loggedin) {
        store.dispatch('fetchSso');
      } else if (is_admin_soco && store.state.loggedin) {
        router.push('/');
      } else {
        router.push('/unauthorized');
      }
    },
  },
});

Vue.prototype.$SO = $SO;
Vue.use(Paginate);
Vue.use(VuesticPlugin);
Vue.use(YmapPlugin);
Vue.prototype.$axios = Axios;

window.axios = Axios;
window.moment = moment;
window.Vue = Vue;

Axios.defaults.withCredentials = true;
interceptorsSetup();
const dict = {
  custom: {
    username: {
      required: () => 'Data not filled in',
      alpha_dash: () => 'Username cannot use special characters',
      min: () => 'Username must consist of 4 - 16 characters',
      max: () => 'Username must consist of 4 - 16 characters',
    },
    email: {
      required: () => 'Data not filled in',
      email: () => 'Email not valid',
    },
    phone_no: {
      required: () => 'Data not filled in',
      numeric: () => 'Phone number can only use numbers',
      min: () => 'Phone number must consists 4 - 14 number',
      max: () => 'Phone number must consists 4 - 14 number',
    },
  },
};

VeeValidate.Validator.localize('en', dict);
VeeValidate.Validator.extend('object_id', {
  getMessage: (field) => `${field} must be a valid ObjectId.`,
  validate: (value) => /^[a-f\d]{24}$/i.test(value),
});
// NOTE: workaround for VeeValidate + vuetable-2
Vue.use(VeeValidate, {
  fieldsBagName: 'formFields',
  classes: true,
  classNames: {
    valid: 'is-valid',
    invalid: 'is-invalid',
  },
  events: 'input|blur',
});

const customToastOpt = {
  position: 'top-center',
  singleton: true,
  duration: 3000,
  action: {
    text: '×',
    onClick: (e, toastObject) => {
      toastObject.goAway(0);
    },
  },
};

Vue.use(Toasted, customToastOpt);

Vue.toasted.register(
  'error',
  (payload) => {
    if (!Object.keys(payload).length) {
      return `
          <div class="toast-icon error">
              <i class="icon_error-circle_alt"></i>
          </div>
          <div class="toast-message">
            Error
          </div>`;
    }

    if (!!payload.message) {
      return `
          <div class="toast-icon error">
              <i class="icon_error-circle_alt"></i>
          </div>
          <div class="toast-message ${payload.className}">
            ${payload.message}
          </div>`;
    }
    if (typeof payload === 'string') {
      return `
          <div class="toast-icon error">
              <i class="icon_error-circle_alt"></i>
          </div>
          <div class="toast-message">
            ${payload}
          </div>`;
    }
  },
  customToastOpt
);
Vue.toasted.register(
  'show',
  (payload) => {
    if (!Object.keys(payload).length) {
      return `
          <div class="toast-icon">
              <i class="icon_check_alt2"></i>
          </div>
          <div class="toast-message">
            Error
          </div>`;
    }

    if (typeof payload === 'object') {
      return `
          <div class="toast-icon">
              <i class="icon_check_alt2"></i>
          </div>
          <div class="toast-message ${payload.classNameForMessage}">
            ${payload.message}
          </div>`;
    }
    if (typeof payload === 'string') {
      return `
          <div class="toast-icon">
              <i class="icon_check_alt2"></i>
          </div>
          <div class="toast-message">
            ${payload}
          </div>`;
    }
  },
  customToastOpt
);
Vue.toasted.register(
  'notif',
  (payload) => {
    if (!Object.keys(payload).length) {
      return `
          <div class="toast-icon">
              <i class="icon_check_alt2"></i>
          </div>
          <div class="toast-message">
            Error
          </div>`;
    }

    if (!!payload.message) {
      return `
          <div class="toast-icon">
              <i class="icon_check_alt2"></i>
          </div>
          <div class="toast-message">
            ${payload.message}
          </div>`;
    }
    if (typeof payload === 'string') {
      return `
          <div class="toast-icon">
              <img src="/assets/img/icon-notif.svg"/>
          </div>
          <div class="toast-message">
            ${payload}
          </div>`;
    }
  },
  { ...customToastOpt, type: 'info' }
);

router.beforeEach((to, from, next) => {
  store.commit('setLoading', true);
  next();
});

router.afterEach((to, from) => {
  store.commit('setLoading', false);
});

/* eslint-disable no-new */

const vm = new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});

export default vm;
