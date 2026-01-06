import Api from '@/api/Api';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_CATALOG_API_URL' });
const socoAdminApi = new Api({ name: 'MS_SOCO_ADMIN_API_URL' });

const state = () => ({});

const getters = {};

const actions = {
  getCategories: (context, payload) =>
    api
      .getData({
        endpoint: '/categories',
        params: payload,
      })
      .then(({ data: { data } }) => data),
  generatePopularProductCategory: (context) =>
    socoAdminApi
      .getData({
        endpoint: '/product/popular/sync',
      })
      .then(({ data: { data } }) => data),
  getCategoryParents: (context, payload) =>
    api
      .getData({
        endpoint: '/v3/categories',
        params: payload,
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
