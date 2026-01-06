<template>
  <div v-if="product" class="product" :class="classModifier">
    <div class="product__thumb">
      <span :class="`link`">
        <img
          v-if="product.image"
          :src="product.image"
          class="product__img"
          :alt="`${product.name} || ${product.product_name}`"
          onerror="this.src='/assets/img/dummy_product.svg'"
        />
        <img
          v-else-if="product.product_images && product.product_images.length > 0"
          :src="product.product_images[0].url"
          class="product__img"
          :alt="`${product.name} || ${product.product_name}`"
          onerror="this.src='/assets/img/dummy_product.svg'"
        />
        <img v-else src="/assets/img/dummy_product.svg" class="product__img" />
      </span>

      <!-- <template v-if="!rightBtnReview">
          <a
            href
            class="btn btn-dark product__button-review"
            v-if="buttonReview && isLogin"
            @click.prevent="selectProduct(product)"
          >ADD REVIEW</a>
          <a
            href
            class="btn btn-dark product__button-review"
            @click.prevent="openLoginOtf"
            v-else
          >ADD REVIEW</a>
      </template>-->
    </div>

    <div class="product__info">
      <span
        v-if="product.manufacture"
        :class="`link`"
        :to="`/brand/${product.manufacture.id}/${brandNameSlug}`"
        class="product__brand"
        >{{ product.manufacture.name }}</span
      >
      <span
        v-if="product.brand"
        :class="`link`"
        :to="`/brand/${product.brand.id}/${brandNameSlug}`"
        class="product__brand"
        >{{ product.brand.name }}</span
      >
      <span :class="`link`" class="product__name">
        <strong>
          {{ product.name || product.product_name }}
        </strong>
      </span>
      <span v-if="product.variant" class="link">
        {{ product.variant }}
      </span>
      <!-- <gratinginline
        :averageRating="reviewAverageRating"
        :inlineReviewers="inlineReviewers"
        :starFillNumber="reviewStarFillNumber"
      /> -->
      <template v-if="!hideTotalReviews">
        <!-- <p class="product__total-review" v-if=" product.review_stats && product.counter_review_user">{{ product.counter_review_user }} Review{{ product.counter_review_user ? 's' : '' }}</p> -->
        <p class="product__total-review">{{ totalReview }} Review{{ totalReview ? 's' : '' }}</p>
      </template>
      <a v-if="buttonShop" href target="_blank" class="btn product__button-shop">SHOP NOW</a>
    </div>

    <!-- <template v-if="rightBtnReview">
        <a
          href
          class="btn btn-dark"
          v-if="isLogin"
          @click.prevent="selectProduct(product)"
        >ADD REVIEW</a>
        <a href class="btn btn-dark" @click.prevent="openLoginOtf" v-else>ADD REVIEW</a>
    </template>-->
  </div>
</template>

<script>
// import gratinginline from './gratinginline';
export default {
  name: 'product-card',
  components: {
    // gratinginline,
  },
  props: {
    hideTotalReviews: {
      type: Boolean,
      required: false,
      default: false,
    },
    hideAverageRating: {
      type: Boolean,
      required: false,
      default: false,
    },
    rightBtnReview: {
      type: Boolean,
      required: false,
      default: false,
    },
    buttonReview: {
      type: Boolean,
      required: false,
      default: false,
    },
    buttonShop: {
      type: Boolean,
      required: false,
      default: false,
    },
    product: {
      type: Object,
      required: false,
    },
    classModifier: {
      type: String,
      required: false,
      default: '',
    },
    inlineReviewers: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    totalReview() {
      if (this.product.counter_review_user) {
        return this.product.counter_review_user ? this.product.counter_review_user : 0;
      } else {
        return this.product.total_reviews ? this.product.total_reviews : 0;
      }
    },
    brandNameSlug() {
      return this.product && this.product.manufacture ? this.$options.filters.slug(this.product.manufacture.name) : '';
    },
    isLogin() {
      // return this.$store.state.$_Auth.loggedin;
      return true;
    },
    productNameSlug() {
      return this.$options.filters.slug(this.product.name);
    },
    reviewAverageRating() {
      if (!this.hideAverageRating) {
        if (this.product.counter_review_rating) {
          return Number(this.product.counter_review_rating).toFixed(1);
        } else {
          return Number(this.product.count_of_ratings).toFixed(1);
        }
      } else {
        return null;
      }
    },
    //     reviewStarFillNumber() {
    //       if (this.product.review_stats && this.product.counter_review_rating) {
    //         return this.$options.filters.rating(this.product.counter_review_rating);
    //       } else {
    //         return this.$options.filters.rating(this.product.count_of_ratings);
    //       }
    //     }
  },
  methods: {
    openLoginOtf() {
      this.$store.dispatch('loginOtf');
    },
    selectProduct(product) {
      const notInReviewPage = !/review[/]add/.test(this.$route.path);
      this.$store.dispatch('setDataSelectedProduct', {
        dataSelectedProduct: product,
        component: this,
      });
      if (notInReviewPage) {
        this.$router.push(`/review/add/${product['id']}`);
      }
    },
  },
};
</script>

<style lang="scss">
.product {
  width: 139px;
  &:hover {
    .product__button-review {
      opacity: 1;
    }
  }
}

.product__brand {
  font: 12px/17px 'Lato-Bold', sans-serif;
  letter-spacing: 0.5px;
  color: #000;
  margin: 0 0 4px 0;
  text-transform: uppercase;
  display: block;
}

.product__button-review {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  width: 100%;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product__button-shop {
  width: 124px;
  height: 24px;
  background-color: #da2a52;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font: 11px/16px 'Lato-Bold', sans-serif;
  letter-spacing: 1px;
  padding: 0;
  margin: 0 auto;
  border-radius: 4px;
  margin-top: 4px;
  &:hover {
    color: #ffffff;
  }
}

.product__info {
  text-align: center;
}

.product__img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  position: relative;
  overflow: hidden;
  max-width: 100%;
}

.product__name {
  font: 12px/14px 'Lato-Regular', sans-serif;
  margin: 0 0 6px 0;
  display: block;
}

.product__thumb {
  position: relative;
  width: 130px;
  margin: 0 auto;
  margin-bottom: 16px;
}

.product__total-review {
  margin: 6px 0 0 0;
  font: 13px/16px 'lato-regular', sans-serif;
  letter-spacing: 0.32px;
  color: #9b9b9b;
}

@media (max-width: 991px) {
  .product {
    width: 140px;
    padding: 16px 8px 16px 8px;
    min-height: 263px;
    .rating--uniform.timeline-review {
      margin-bottom: 0;
    }
  }

  .product__button-review {
    display: none;
  }

  .product__brand {
    line-height: 14px;
  }

  .product__img {
    height: 100px;
  }

  .product__name {
    margin-bottom: 10px;
  }

  .product__thumb {
    width: 100px;
  }

  .product__total-review {
    margin-top: 2px;
  }
}

.product--inline {
  width: 100%;
  background-color: #ffffff;
  border-radius: 4px;
  padding: 11px 22px 14px 12px;

  &:before,
  &:after {
    content: ' ';
    display: table;
    zoom: 1;
  }

  &:after {
    clear: both;
  }

  .card-rating {
    .rating--uniform {
      &.timeline-review {
        justify-content: flex-start;
      }
    }
  }

  .product__button-review {
    display: none;
  }

  .product__img {
    height: auto;
  }

  .product__info {
    padding-left: 84px;
    text-align: left;
  }

  .product__thumb {
    float: left;
    width: 72px;
    height: 72px;
    margin-bottom: 0;
  }
}

.product--inline-minimalist {
  border-radius: 4px;
  border: 1px solid #e5e5e5;
  padding: 16px;

  .product__info {
    padding-left: 106px;
  }

  .product__thumb {
    width: 90px;
    height: 90px;
  }
}

.product--minimalist {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 8px 9px;
  .product__brand {
    font: 10px/10px 'Lato-Bold', sans-serif;
    color: #000;
  }

  .product__name {
    font: 13px/18px 'Lato-Regular', sans-serif;
    margin-bottom: 4px;
  }

  .product__thumb {
    margin-bottom: 4px;
  }
}
</style>
