import Api from '@/api/Api';
import featured from 'vuex-store/modules/categories/featured';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_BJ_ADMIN_API_URL' });

const state = () => ({
  data: [],

  edit: -1,
});

const getters = {
  getEditCategory: ({ data, edit }, getters) => (edit.length > -1 ? data[edit] : false),
};

const actions = {
  getCount: (context, { filter }) =>
    api
      .getData({
        endpoint: '/categories/count',
        params: { filter },
      })
      .then(({ data }) => data.count),

  getCategories: (context, payload) =>
    api
      .getData({
        endpoint: '/categories',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  postCategories: (context, payload) =>
    api
      .postData({
        endpoint: '/categories',
        payload,
      })
      .then(({ data: { data } }) => data),

  putCategories: (context, { id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/categories/${id}`,
      payload,
    }),

  deleteCategories: (context, { id = '' }) =>
    api.deleteData({
      endpoint: `/categories/${id}`,
    }),

  getSubCategory: ({ dispatch }, { id = '' }) =>
    dispatch('getCategories', {
      filter: {
        _id: id,
      },
    }).then(([{ sub_categories }]) => sub_categories),

  postSubCategory: (context, { id = '', payload = {} } = {}) =>
    api
      .postData({
        endpoint: `/category/${id}/subcategory`,
        payload,
      })
      .then(({ data: { data } }) => data),

  putSubCategory: (context, { id = [], payload = {} } = {}) =>
    api.putData({
      endpoint: `/category/${id[0]}/subcategories/${id[1]}`,
      payload,
    }),

  deleteSubCategory: (context, { id = '' }) =>
    api.deleteData({
      endpoint: `/subcategory/${id}`,
    }),

  checkSlugExists: ({ dispatch }, { slug = '', category_id = '', subcategory_id = '' }) => {
    let filter = {};

    if (subcategory_id) {
      filter = {
        $or: [
          { slug },
          {
            sub_categories: {
              $elemMatch: {
                $and: [{ slug }, { _id: { $ne: subcategory_id } }],
              },
            },
          },
        ],
      };
    } else if (category_id) {
      filter = {
        $or: [
          {
            $and: [{ slug }, { _id: { $ne: category_id } }],
          },
          {
            sub_categories: {
              $elemMatch: { slug },
            },
          },
        ],
      };
    } else {
      filter = {
        $or: [
          { slug },
          {
            sub_categories: {
              $elemMatch: { slug },
            },
          },
        ],
      };
    }

    return dispatch('getCategories', { filter }).then((data) => data.length > 0);
  },
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

  modules: {
    featured,
  },
};
