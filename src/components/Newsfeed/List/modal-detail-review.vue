<template>
  <modalv2 class="custom-modal modal-mask modal--review-detail">
    <div slot="body">
      <div class="modal-header">
        <button type="button" class="close" aria-label="Close">
          <img src="/assets/img/icon-close-white.svg" alt="icon-close-modal" @click.prevent="closeModal" />
        </button>
        <span class="modal-heading">{{
          reviewData && Object.keys(reviewData).length && reviewData.actor.name
            ? `PRODUCT REVIEW - ${reviewData.actor.name}`
            : 'PRODUCT REVIEW'
        }}</span>
      </div>
      <div v-if="reviewData" class="product-preview">
        <figure
          v-if="
            reviewData.review &&
            reviewData.review.product &&
            reviewData.review.product.product_images &&
            reviewData.review.product.product_images[0]
          "
        >
          <img :src="reviewData.review.product.product_images[0].url" />
        </figure>

        <div class="product-content">
          <div class="name">
            {{ [reviewData.review.product.id] }}
            {{ 'name' in reviewData.review.product ? reviewData.review.product.name : '-' }}
          </div>
        </div>
        <div class="review-content">
          <div class="rating rating_size-bigger">
            <div class="rs" :class="'rs-' + productCounterReviewRating * 10">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <span class="rating__average">{{ productCounterReviewRating }}</span>
          </div>

          <div>
            <div class="row-rate-detail">
              <div v-if="reviewData.review.star_packaging" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_packaging.toFixed()}/5` }}</span>
                  <span class="text-rate">Packaging</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_eficiency" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_eficiency.toFixed()}/5` }}</span>
                  <span class="text-rate">Efficiency</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_durability" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_durability.toFixed()}/5` }}</span>
                  <span class="text-rate">Durability</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_pigmentation" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_pigmentation.toFixed()}/5` }}</span>
                  <span class="text-rate">Pigmentation</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_long_wear" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_long_wear.toFixed()}/5` }}</span>
                  <span class="text-rate">Long Wear</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_effectiveness" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_effectiveness.toFixed()}/5` }}</span>
                  <span class="text-rate">Effectiveness</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_texture" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_texture.toFixed()}/5` }}</span>
                  <span class="text-rate">Texture</span>
                </p>
              </div>
              <div v-if="reviewData.review.star_value_for_money" class="rate-col">
                <p>
                  <span class="rate-pink">{{ `${reviewData.review.star_value_for_money.toFixed()}/5` }}</span>
                  <span class="text-rate">Value for Money</span>
                </p>
              </div>
            </div>
          </div>

          <div
            v-if="
              reviewData.review.product.variant ||
              (reviewData.review.product.combination && Object.keys(reviewData.review.product.combination).length)
            "
          >
            <p v-if="reviewData.review.product.variant" class="review-variant-pro">
              {{ reviewData.review.product.variant }}
            </p>
            <p
              v-else-if="
                reviewData.review.product.combinations && Object.keys(reviewData.review.product.combination).length
              "
              class="review-variant-pro"
              v-html="showProductDetail(reviewData.review.product.combination)"
            ></p>
          </div>

          <div>
            <p class="desc">{{ reviewData.review.details | trimRecentReviewContent }}</p>
          </div>

          <div>
            <ul class="list list-inline card__review-list-text">
              <li class="card__review-text">
                Recommend <br />
                <span class="card__review-text--primary">{{ recommendText }}</span>
              </li>
              <li class="card__review-text">
                Repurchase <br />
                <span class="card__review-text--primary">{{ repurchasedText }}</span>
              </li>
              <li class="card__review-text">
                Usage Period <br />
                <span class="card__review-text--primary">{{ reviewData.review.duration_of_used }}</span>
              </li>
              <li class="card__review-text">
                Source <br />
                <span class="card__review-text--primary">{{ reviewData.review.source }}</span>
              </li>
            </ul>
          </div>

          <div>
            <ul v-if="reviewData.review.images" class="list list-inline list-review-images">
              <li v-for="(image, index) in reviewData.review.images" :key="index">
                <figure>
                  <img :src="image.name" class="list-review-images__item" />
                </figure>
              </li>
            </ul>
          </div>
          <div>
            <p class="review-variant-pro">
              Source Language: {{ reviewData.review.lang || 'id'}}
              <span title="Edit" aria-hidden="true" class="fa fa-pencil btn_edit" @click="openEditModal"></span>
            </p>
            <modal-edit-translation
              v-if="isModalOpen"
              :id="currentReviewId"
              :source-language="reviewData.review.lang"
              :vietnamese-translation="reviewData.review.translate.vi.translation"
              @close="closeEditModal"
            />
          </div>
          <div>
            <p class="desc">{{ reviewData.review.translate.vi.translation }}</p>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <div class="create-review-text">
          <button type="button" class="btn btn-black" @click.prevent="showRelocate">RELOCATE</button>
        </div>
      </div>
    </div>
  </modalv2>
</template>

<script>
import modalv2 from '../../ui/global/modal';
import ModalEditTranslation from './modal-edit-translation.vue';
export default {
  name: 'ModalDetailReview',
  components: { modalv2, ModalEditTranslation },
  data() {
    return {
      url: '',
      isModalOpen: false,
      currentReviewId: null,
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
    productCounterReviewRating() {
      if (
        this.$store.state.modal.reviewData.review.product &&
        (this.$store.state.modal.reviewData.review.product.counter_review_rating !== undefined &&
          this.$store.state.modal.reviewData.review.product.counter_review_rating !== null) ||
        (this.$store.state.modal.reviewData.average_rating !== undefined &&
          this.$store.state.modal.reviewData.average_rating !== null)
      ) {
        const rating =
          this.$store.state.modal.reviewData.review.product.counter_review_rating ||
          this.$store.state.modal.reviewData.review.average_rating;
        return rating.toFixed(1);
      }
      return 0;
    },
    repurchasedText() {
      if (this.reviewData.review.is_repurchase == 'yes') {
        return 'Yes';
      } else if (this.reviewData.review.is_repurchase == 'no') {
        return 'No';
      } else {
        return 'Maybe';
      }
    },
    recommendText() {
      if (this.reviewData.review.is_recommended == 'yes') {
        return 'Yes';
      } else {
        return 'No';
      }
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
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalDetailReview' });
    },
    openEditModal() {
      this.currentReviewId = this.reviewData.review._id;
      this.isModalOpen = true;
    },
    closeEditModal() {
      this.isModalOpen = false;
    },
    showRelocate() {
      this.closeModal();
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalRelocate' });
    },
    isImage(value) {
      if (value && value.search('#') !== -1 && value.length <= 7) {
        return false;
      } else {
        return true;
      }
    },
    showProductDetail(combination) {
      let variant = '';
      const style = 'width:18px;height:18px;border-radius:50%;margin-top:-3px;';
      if (combination.attribute) {
        Object.keys(combination.attribute)
          .sort()
          .map((attr, index) => {
            if (attr !== 'non_specify') {
              const value = combination.attribute[attr].value || '';
              // add comma to string, except if only one, or last one
              if (index > 0 && index < Object.keys(combination.attribute).length) {
                variant = `${variant} - `;
              } else if (Object.keys(combination.attribute).length < 2) {
                variant = `${attr}: `;
                const lower = variant.toLowerCase();
                variant = variant.charAt(0).toUpperCase() + lower.slice(1);
              }
              if (attr === 'shade' && value) {
                let img = '';
                if (this.isImage(value)) {
                  img = `<img src="${value}" style="${style}" />`;
                } else {
                  img = `<button style="${style}border:none;background:${value}"></button>`;
                }
                variant = variant + `${img} ${combination.attribute[attr].name}`;
              } else if (attr !== 'non_specify') {
                variant = variant + `${combination.attribute[attr].name}`;
              }
            }
          });
      }
      return variant;
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/modal-detail-review';
</style>
