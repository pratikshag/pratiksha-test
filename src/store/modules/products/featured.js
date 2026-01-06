import Api from '@/api/Api';

const api = new Api({ name: 'MS_SOCO_ADMIN_API_URL' });

// initial state
const state = () => ({});

const getters = {};

const actions = {
  getConfig: (context, { name = 'trending' } = {}) =>
    api.getData({
      endpoint: '/config/featured/products/' + name,
    }),

  putConfig: (context, { name = 'trending', payload = {} } = {}) =>
    api.putData({
      endpoint: '/config/featured/products/' + name,
      payload,
    }),
};

const mutations = {};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
