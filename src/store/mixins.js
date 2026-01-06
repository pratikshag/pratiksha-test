export default {
  getters: {
    concatPath:
      () =>
      (payload = []) =>
        ''.concat(...payload.map((item) => ['/' + item])),
  },

  // actions: {},

  mutations: {
    setState(state, payload) {
      Vue.set(state, ...payload);
    },

    setData(state, payload) {
      Vue.set(state.data, ...payload);
    },

    setLoading(state, payload) {
      Vue.set(state.loading, ...payload);
    },

    concatData: (state, payload) => {
      state.data = state.data.concat(payload);
    },
  },
};
