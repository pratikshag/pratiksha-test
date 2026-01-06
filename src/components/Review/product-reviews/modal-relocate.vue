<template>
  <modalv2 class="custom-modal modal-mask modal--relocate">
    <div slot="body">
      <div class="modal-header">
        <button type="button" class="close" aria-label="Close">
          <img src="/assets/img/icon-close-white.svg" alt="icon-close-modal" @click.prevent="closeModal" />
        </button>
        <span class="modal-heading">RELOCATE REVIEW</span>
      </div>
      <div class="product-preview">
        <div class="relocate-content">
          <div class="d-flex field from-content">
            <label for="brand-name">From</label>
            <multiselect
              id="ajax1"
              v-model="relocateProduct.source"
              placeholder=""
              open-direction="bottom"
              :options="options.products.data"
              disabled
              :show-no-results="true"
              :hide-selected="true"
              :show-labels="false"
              track-by="_id"
              :custom-label="sourcename"
            >
              <template slot="clear">
                <div
                  v-if="options.products.data.length === 0"
                  class="multiselect__clear"
                  @mousedown.prevent.stop="clearAll"
                ></div>
              </template>
              <span slot="noResult"> Oops! No products found. Consider changing your query. </span>
              <span slot="caret" class="hidden"></span>
            </multiselect>
          </div>

          <div class="d-flex field to-content">
            <label for="brand-name">To</label>
            <multiselect
              id="ajax2"
              v-model="relocateProduct.target"
              placeholder=""
              open-direction="bottom"
              label="name"
              :options="options.products.data"
              :searchable="true"
              :loading="options.products.is_loading"
              :internal-search="false"
              :disabled="options.products.disabled"
              :clear-on-select="true"
              :close-on-select="true"
              :show-no-results="true"
              :hide-selected="true"
              :show-labels="false"
              track-by="id"
              :custom-label="sourcename"
              @search-change="findProducts"
            >
              <!-- <template slot="clear" slot-scope="props">
                                <div class="multiselect__clear"
                                    v-if="options.products.data.length === 0"
                                    @mousedown.prevent.stop="clearAll">
                                </div>
                            </template> -->
              <span slot="noResult"> Oops! No products found. Consider changing your query. </span>
            </multiselect>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="create-review-text">
          <button
            type="button"
            class="btn btn-red"
            :class="{ disabled: !Object.keys(relocateProduct.target).length }"
            :disabled="!Object.keys(relocateProduct.target).length"
            @click.prevent="showConfirmation"
          >
            SUBMIT
          </button>
        </div>
      </div>
    </div>
  </modalv2>
</template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import Multiselect from 'vue-multiselect';
import modalv2 from '../../ui/global/modal';

let cancelSearchResource;
export default {
  name: 'ModalRelocate',
  components: { modalv2, Multiselect },
  data() {
    return {
      url: '',
      relocateProduct: {
        source: {},
        target: {},
      },
      options: {
        products: {
          data: [],
          is_loading: false,
          disabled: false,
        },
      },
    };
  },
  computed: {
    reviewData() {
      let result = {};
      if (this.$store.state.modal.reviewData && Object.keys(this.$store.state.modal.reviewData).length) {
        result = this.$store.state.modal.reviewData;
      }
      return result;
    },
  },
  mounted() {
    document.documentElement.classList.add('noscroll');
    if (Object.keys(this.reviewData).length) {
      this.toggleModalRelocate(this.reviewData);
    }
  },
  beforeDestroy() {
    document.documentElement.classList.remove('noscroll');
  },
  methods: {
    closeModal() {
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalRelocate' });
    },
    showConfirmation() {
      this.closeModal();
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalConfirmation' });
    },
    sourcename(product) {
      if (product.id) {
        return `[${product.id}] ${product.name}`;
      }
      return '';
    },
    findProducts(query) {
      if (query) {
        this.options.products.is_loading = true;

        if (typeof cancelSearchResource === 'object') {
          cancelSearchResource.cancel();
        }
        const CancelToken = Axios.CancelToken;
        cancelSearchResource = CancelToken.source();

        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/products`, {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              is_deleted: false,
              id: { $ne: this.relocateProduct.source.id },
              name: {
                $regex: '^' + query,
                $options: 'i',
              },
            },
            fields: '_id id name',
            skip: 0,
            limit: 10,
          },
        })
          .then((response) => {
            this.options.products.is_loading = false;
            if (response.status === 200 && response.data.data) {
              this.options.products.data = response.data.data;
            }
          })
          .catch((error) => {
            if (Axios.isCancel(error)) {
              return 'cancel';
            }
            this.options.products.is_loading = false;
            console.log('Error: ' + error);
          });
      }
    },
    toggleModalRelocate(reviewData) {
      this.relocateProduct.target = {};

      if (reviewData) {
        this.relocateProduct.source = {
          id: reviewData.review.product.id,
          _id: reviewData.review.product._id,
          name: reviewData.review.product.name,
          review_id: reviewData.review._id,
        };
      } else {
        this.relocateProduct.source = {};
      }
      this.$store.commit('setRelocateProduct', this.relocateProduct);
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/modal-relocate';
</style>
