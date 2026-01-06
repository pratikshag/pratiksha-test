export default {
  state: {
    width: '',
    height: '',
    isDesktop: '',
  },
  mutations: {
    setScreenWidth(state, windowWidth) {
      state.width = windowWidth;
    },
    setScreenHeight(state, windowHeight) {
      state.height = windowHeight;
    },
    setInfoScreen(state, windowWidth) {
      if (windowWidth > 1100) {
        state.isDesktop = true;
      } else {
        state.isDesktop = false;
      }
    },
  },
  actions: {
    setScreenSize({ commit, state }, dataScreen) {
      commit('setScreenWidth', dataScreen.width);
      commit('setScreenHeight', dataScreen.height);
      commit('setInfoScreen', dataScreen.width);
    },
  },
  getters: {},
};
