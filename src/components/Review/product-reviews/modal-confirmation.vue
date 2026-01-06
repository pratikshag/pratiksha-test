<template>
  <modalv2 class="custom-modal modal-mask modal--confirmation">
    <div slot="body">
      <div class="product-preview">
        <div class="confirmation-content">
          <p>Are you sure want to pinned this review?</p>
          {{ pinnedReview }}
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-white" @click.prevent="closeModal()">CANCEL</button>
        <template v-if="is_loading_pinned">
          <div class="loader" style="text-align: center">
            <ball-pulse-loader color="#000000" size="20px"> </ball-pulse-loader>
          </div>
        </template>
        <template v-else-if="relocateProduct.source.review_id && relocateProduct.target.id">
          <button type="button" class="btn btn-red" @click.prevent="processPinned()">SUBMIT</button>
        </template>
      </div>
    </div>
  </modalv2>
</template>

<script>
// import Axios from 'axios';
// const Config = require('../../../../config/default.env');
import modalv2 from '../../ui/global/modal';
export default {
  name: 'ModalPinned',
  components: { modalv2 },
  data() {
    return {
      url: '',
      is_loading_pinned: false,
    };
  },
  computed: {
    pinnedReview() {
      let result = {};
      if (this.$store.state.modal.pinnedReview && Object.keys(this.$store.state.modal.pinnedReview).length) {
        result = this.$store.state.modal.pinnedReview;
      }
      return result;
    },
  },
  mounted() {
    document.documentElement.classList.add('noscroll');
  },
  beforeDestroy() {
    document.documentElement.classList.remove('noscroll');
  },
  methods: {
    closeModal() {
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalConfirmation' });
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalPinnedReview' });
    },
    processPinned() {
      // const self = this;

      // if (self.relocateProduct.target && self.relocateProduct.target._id) {
      //   self.is_loading_pinned = true;

      //   Axios.put(
      //     Config.default.MS_SOCO_ADMIN_API_URL +
      //       `/newsfeeds/${self.relocateProduct.source.review_id}/relocate/${self.relocateProduct.target.id}`
      //   )
      //     .then((response) => {
      //       if (response.status === 200) {
      //         self.is_loading_pinned = false;
      //         this.$store.commit('toggleModalGlobalState', { modalName: 'modalConfirmation' });
      //         self.$toasted.global.show('Review pinned success');
      //         this.$emit('reloadTable');
      //       }
      //     })
      //     .catch((err) => {
      //       self.is_loading_pinned = false;
      //       this.$store.commit('toggleModalGlobalState', { modalName: 'modalConfirmation' });
      //       self.$toasted.global.error('Pinned fail. Please try again');
      //       this.$emit('reloadTable');
      //     });
      // }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/modal-confirmation';
</style>
