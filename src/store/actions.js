import Axios from 'axios';
import router from '../router';
import vm from '../main';
import helper from '@/helper';

const Config = require('../../config/default.env').default;

export default {
  isToggleWithoutAnimation({ commit }, value) {
    commit('TOGGLE_WITHOUT_ANIMATION', value);
  },

  fetchSso({ dispatch }) {
    return new Promise((resolve, reject) => {
      return Axios.get(Config.MS_SSO_BROKER_API_URL)
        .then(() => {
          dispatch('fetchMe');
          resolve();
        })
        .catch((e) => {
          console.log(e);

          reject(e);
        });
    });
  },

  fetchMe({ commit, dispatch }) {
    return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/user/me')
      .then((response) => {
        const userData = response && response.data && response.data.data;
        const success = response && response.data && response.data.success;

        if (success && userData.is_admin_soco) {
          commit('loggedin', true);
          commit('profileState', userData);
          dispatch('setMenu', userData);

          if (!helper.restrictionCheck(['superadmin', 'admin', 'editor', 'contributor'])) {
            dispatch('goToLogin');
          }
        } else if (response.data.success) {
          commit('loggedIn', true);
          router.push('/unauthorized');
        } else {
          dispatch('goToLogin');
        }
      })
      .catch(() => {
        dispatch('goToLogin');

        vm.$toasted.global.error('coba beberapa saat lagi');
      });
  },

  goToLogin({ dispatch }) {
    router.push('/login');
    dispatch('setMenu');
  },

  setMenu({ state }, user_data = null) {
    const roles = user_data && user_data.role ? user_data.role : null;
    const checkPermissionRoles = (role, access = []) => {
      let result = false;
      let new_role = [];
      if (role) {
        if (role.indexOf(',') > -1) {
          const split = role.split(',');
          new_role = split;
        } else {
          new_role.push(role);
        }
      }
      const idx = new_role.findIndex((r) => r == 'community');
      if (idx > -1) {
        new_role.splice(idx, 1);
      }
      if (new_role && new_role.length) {
        result = access.findIndex((a) => new_role.indexOf(a) > -1) > -1;
      }
      return result;
    };
    state.menu_permission = state.menus.filter((m) => checkPermissionRoles(roles, m.permission));
  },

  checkPermission({ getters }, to) {
    let allow = to.name == 'admin';
    const menu_permission = getters.menuPermission;
    const user_roles = getters.userRole;
    if (user_roles && /superadmin|admin/.test(user_roles)) {
      return true;
    }
    if (menu_permission && menu_permission.length) {
      const matchPermission = (m, to) => {
        let result = m.key == to.name || to.name.indexOf(m.key) > -1;
        if (!result && m.sub_key && m.sub_key.length) {
          result = m.sub_key.findIndex((sk) => to.name.indexOf(sk) > -1) > -1;
        }
        return result;
      };
      const check_permission = menu_permission.find((m) => {
        let result = matchPermission(m, to);
        if (!result && m.childs && m.childs.length) {
          result = m.childs.find((mc) => matchPermission(mc, to));
        }
        return result;
      });
      if (check_permission) {
        allow = true;
      }
    }
    if (to.name == 'admin') {
      allow = true;
    }
    return allow;
  },
};
