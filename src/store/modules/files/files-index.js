import Api from '@/api/Api';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_BJ_ADMIN_API_URL' });

const state = () => ({
  temp: {},
});

const getters = {};

const actions = {
  getPreSignedUrl: (context, payload) =>
    api
      .getData({
        endpoint: '/pre-signed-url',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  putFile: ({ state, commit, dispatch }, { filename, blob }) =>
    dispatch('getPreSignedUrl', {
      fileName: filename,
      contentType: blob.type,
    })
      .then((data) => {
        axios.defaults.withCredentials = false;
        commit('setState', ['temp', data]);

        return axios.put(state.temp.signedUrl, blob, {
          headers: {
            'Content-Type': blob.type,
          },
        });
      })
      .then(() => {
        axios.defaults.withCredentials = true;
        return state.temp;
      })
      .catch(console.log),
};

const mutations = {
  ...mixins.mutations,
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
