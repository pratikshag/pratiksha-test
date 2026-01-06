const state = () => ({
  selectedSbnUsers: [],
});

const getters = {};

const actions = {
  setSelectedSbnUsers({ commit }, user) {
    commit('setSelectedSbnUsers', user);
  },
  clearSelectedSbnUsers({ commit }) {
    commit('clearSelectedSbnUsers');
  },
};

const mutations = {
  setSelectedSbnUsers(state, user) {
    const exists = state.selectedSbnUsers.some((u) => u._id === user._id);
    if (exists) {
      state.selectedSbnUsers = state.selectedSbnUsers.filter((u) => u._id !== user._id);
    } else {
      state.selectedSbnUsers.push(user);
    }
  },
  clearSelectedSbnUsers(state) {
    state.selectedSbnUsers = [];
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
