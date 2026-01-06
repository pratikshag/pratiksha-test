import Api from '@/api/Api';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_BJ_ADMIN_API_URL' });

// initial state
const state = () => ({});

const getters = {};

const actions = {
  getCount: (context, { filter }) =>
    api
      .getData({
        endpoint: '/posts/count',
        params: { filter },
      })
      .then(({ data }) => data.count),

  getPosts: (context, payload) =>
    api
      .getData({
        endpoint: '/posts',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  createPost: (context, payload) =>
    api
      .postData({
        endpoint: '/posts',
        payload,
      })
      .then(({ data: { data } }) => data),

  updatePost: (context, { id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/posts/${id}`,
      payload,
    }),

  deletePost: (context, { id = '' }) =>
    api.deleteData({
      endpoint: `/posts/${id}/unpublish`,
    }),
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
