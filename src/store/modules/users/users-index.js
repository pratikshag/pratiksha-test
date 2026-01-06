import Api from '@/api/Api';

const api = new Api({ name: 'MS_SOCO_ADMIN_API_URL' });

// initial state
const state = () => ({});

const getters = {};

const actions = {
  getCount: (context, { filter }) =>
    api
      .getData({
        endpoint: '/users/count',
        params: { filter },
      })
      .then(({ data: { data } }) => data),

  getUsers: (context, payload) =>
    api
      .getData({
        endpoint: '/users',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  unverify: (context, payload) =>
    api
      .getData({
        endpoint: '/users/unverify',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  verify: (context, payload) =>
    api
      .getData({
        endpoint: '/users/verify',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  updateStatus: (context, { id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/user/${id}/status`,
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
