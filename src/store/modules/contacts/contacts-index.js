import Api from '@/api/Api';
// import mixins from 'vuex-store/mixins'

const api = new Api({ name: 'MS_BJ_ADMIN_API_URL' });

// initial state
const state = () => ({});

const getters = {};

const actions = {
  getCount: (context, { filter = {} } = {}) =>
    api
      .getData({
        endpoint: '/feedback_forms/count',
        params: { filter },
      })
      .then(({ data: { data } }) => data),

  getContacts: (context, payload) =>
    api
      .getData({
        endpoint: '/feedback_forms',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  updateContact: (context, { id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/feedback_forms/${id}`,
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
