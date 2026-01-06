import Api from '@/api/Api';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_SOCO_ADMIN_API_URL' });

// initial state
const state = () => ({
  actions: [],
  $in: [
    'invite-new-member',
    'create-add-review',
    'create-vote',
    'comment-vote',
    'upvote-vote',
    'create-collection',
    'create-photo-tagging',
    'verified-add-review',
    'comment-article',
    'comment-collection',
    'comment-add-review',
    'comment-photo-tagging',
    'comment-video',
    'comment-freebies',
    'comment-pid_quiz',
    'get-member',
    'create-general-review-or-verified-review',
  ],
});

const getters = {};

const actions = {
  getActions: (context, { payload = {} } = {}) =>
    api
      .getData({
        endpoint: '/actions',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  getFreebies: (context, { id, payload = {} } = {}) =>
    api
      .getData({
        endpoint: `/freebies/${id}`,
        params: payload,
      })
      .then(({ data: { data } }) => data),

  getSubscriber: (context, { id, payload = {} } = {}) =>
    api
      .getData({
        endpoint: `/freebies/${id}/subscriber`,
        params: payload,
      })
      .then(({ data: { data } }) => data),

  bulkWinners: (context, { id, payload }) =>
    api
      .postData({
        endpoint: `/freebies/${id}/winners`,
        payload,
      })
      .then(({ data: { data } }) => data),
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
