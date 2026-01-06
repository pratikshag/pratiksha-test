export default {
  state: {
    isModalShow: {
      modalDetailReview: false,
      modalRelocate: false,
      modalPinnedReview: false,
      modalConfirmation: false,
      modalSpam: false,
    },
    reviewData: '',
    relocateProduct: '',
    pinnedReview: '',
    showMessageLimit: false,
    messageLimitCount: '',
    sourceClick: '',
  },
  mutations: {
    setReviewData(state, data) {
      state.reviewData = data;
    },
    setSourceClick(state, data) {
      state.sourceClick = data;
    },
    setRelocateProduct(state, data) {
      state.relocateProduct = data;
    },
    setPinnedReview(state, data) {
      state.pinnedReview = data;
    },
    toggleModalGlobalState(state, { modalName }) {
      if (state.isModalShow[modalName]) {
        state.isModalShow[modalName] = false;
        document.body.classList.remove('no-scroll');
      } else {
        state.isModalShow[modalName] = true;
        document.body.classList.add('no-scroll');
      }
    },
    setMessageLimit(state, data) {
      state.showMessageLimit = data;
    },
    setMessageLimitCount(state, data) {
      state.messageLimitCount = data;
    },
  },
  actions: {},
  getters: {},
};
