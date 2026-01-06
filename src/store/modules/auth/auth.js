import vm from '../../../main';
import router from '../../../router';
import { deleteLocalStorage } from '../../../utils/localstorage';
const Config = require('../../../../config/default.env').default;
import { get } from 'lodash';

export default {
  namespaced: true,
  state: {
    loggedin: false,
    email: '',
    phone_no: '',
    user_id: '',
    otp: '',
    meLoading: true,
    userData: null,
    userProfile: {},
  },
  mutations: {
    loggedin(state, data) {
      state.loggedin = data;
    },
    setEmail(state, data) {
      state.email = data;
    },
    setMeLoading(state, data) {
      state.meLoading = data;
    },
    setUserData(state, data) {
      state.userData = data;
    },
    setPhoneNo(state, data) {
      state.phone_no = data;
    },
    setOTP(state, data) {
      state.otp = data;
    },
    setUserID(state, data) {
      state.user_id = data;
    },
    profileState(state, data) {
      state.userProfile = data;
      state.user_id = data.id;
      state.userimage = data.image;
      state.name = data.name;
      state.user_name = data.user_name ? data.user_name : '';
      state.userrole = data.role;
      state.dashboardToken = get(data, 'clients.dashboard.token', '');
    },
  },
  actions: {
    sso({ dispatch, commit }) {
      return axios
        .get(Config.MS_SSO_BROKER_API_URL)
        .then((response) => {
          return dispatch('me');
        })
        .catch(() => commit('setMeLoading', false));
    },
    me({ commit, state, dispatch }) {
      return Promise.all([axios.get(Config.MS_SOCO_ADMIN_API_URL + '/user/me')])
        .then((responses) => {
          const response = responses && Array.isArray(responses) && responses.length ? responses[0] : null;

          if (response.status === 200 && response.data.success && Boolean(response.data.data.is_admin)) {
            commit('loggedin', true);
            commit('setUserData', response.data.data);
            commit('profileState', userData);
            router.push('/');
          } else {
            commit('loggedin', false);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
    login({ commit, state, dispatch }, data) {
      const params = {
        email: state.email,
        password: state.password,
        source: window.innerWidth > 1100 ? 'soco-admin-desktop' : 'soco-admin-mobile',
      };

      // clear user data before call login, so expired token won't be attached in Bearer
      commit('loggedin', false);
      commit('setUserData', null);
      return axios
        .post(Config.MS_SOCO_ADMIN_API_URL + '/auth/login', params)
        .then(async (response) => {
          if (response.status == '200') {
            commit('loggedin', true);
            dispatch('clear');
            deleteLocalStorage();
            await dispatch('me');
          }
        })
        .catch((error) => {
          if (
            error.response &&
            error.response.data &&
            error.response.data.data &&
            error.response.data.data.statusCode === 401 &&
            !error.response.data.errorCode
          ) {
            vm.$toasted.global.error(`Unauthorized`);
          }
        })
        .finally(() => (data.loading = false));
    },
    async requestOTP({ commit }, { phone_no, email }) {
      const response = await axios.post(`${Config.MS_SOCO_PUBLIC_API_URL}/auth/login/otp/request`, {
        entity: 'phone_no',
        mode: 'whatsapp',
        phone_no_e164: phone_no,
        email,
      });

      commit('setUserID', response?.data?.data?.user_id || '');
      return response;
    },
    verifyOTP(context, { otp, phone_no, user_id }) {
      return axios.post(`${Config.MS_SOCO_PUBLIC_API_URL}/auth/login/otp`, {
        code: otp,
        entity: 'phone_no',
        mode: 'whatsapp',
        entity_value: phone_no,
        phone_no_e164: phone_no,
        user_id,
      });
    },
    logout({ commit, state, dispatch }, data) {
      return axios
        .post(Config.MS_SOCO_ADMIN_API_URL + '/auth/logout')
        .then((response) => {
          if (response.status == '200') {
            commit('loggedin', false);
            commit('setUserData', null);
          }
        })
        .catch((error) => {});
    },
    clear({ commit, state, dispatch }, data) {
      commit('setEmail', '');
      commit('setPassword', '');
      deleteLocalStorage();
    },
    checkPhoneNumberAvailability(_, phone) {
      const { phone_no, phone_code } = phone;
      return axios
        .get(`${Config.MS_SOCO_PUBLIC_API_URL}/auth/phone/check`, {
          params: {
            filter: {
              phone_no,
              phone_code,
              is_new_response: true,
            },
          },
        })
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          return error.response.data;
        });
    },
  },
};
