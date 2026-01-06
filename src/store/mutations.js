import { get } from 'lodash';

export default {
  TOGGLE_WITHOUT_ANIMATION(state, value) {
    state.app.sidebar.withoutAnimation = value;
  },

  profileState(state, data) {
    state.userProfile = data;
    state.user_id = data.id;
    state.userimage = data.image;
    state.name = data.name;
    state.user_name = data.user_name;
    state.userrole = data.role;
    state.dashboardToken = get(data, 'clients.dashboard.token', '');
  },
  loggedin(state, data) {
    state.loggedin = data;
  },
  setLoading(state, data) {
    state.setLoading = data;
  },
};
