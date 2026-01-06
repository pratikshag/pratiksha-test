export default {
  dashboardToken: (state) => state.dashboardToken,
  toggleWithoutAnimation: (state) => state.app.sidebar.withoutAnimation,
  config: (state) => state.app.config,
  palette: (state) => state.app.config.palette,
  isLoading: (state) => state.app.isLoading,
  userImage: (state) => state.userimage,
  name: (state) => state.name,
  userName: (state) => state.userProfile.user_name,
  userRole: (state) => state.userProfile.role,
  isAdmin: (state) => state.userProfile.is_admin_soco,
  uriParams: () => (callback, params) => callback(params),
  menuPermission: (state) => state.menu_permission,
};
