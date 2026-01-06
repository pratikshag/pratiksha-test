<template>
  <div v-if="product" class="product" :class="classModifier">
    <div class="product__thumb">
      <span :class="`link`" :to="$options.filters.productUrlReview(product)">
        <img
          v-if="product.image"
          :src="product.image"
          class="product__img"
          :alt="`${product.name}-${product.manufacture.name}`"
          onerror="this.src='/assets/img/dummy_product.svg'"
        />
        <img
          v-else-if="product.product_images && product.product_images.length > 0"
          :src="product.product_images[0].url"
          class="product__img"
          :alt="`${product.name}-${product.manufacture.name}`"
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
      <span :class="`link`" :to="$options.filters.productUrlReview(product)" class="product__name">
        <strong>
          {{ product.name }}
        </strong>
      </span>
      <span v-if="product.variant" class="link">
        {{ product.variant }}
      </span>
      <span v-text="attributes.join(', ')"></span>
      <br />
      <span v-if="combination.reference">Ref: {{ combination.reference }}</span>
      <span v-else>Ref: {{ product.sku }}</span>
      <gratinginline
        :average-rating="reviewAverageRating"
        :inline-reviewers="inlineReviewers"
        :star-fill-number="reviewStarFillNumber"
      />
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
import gratinginline from './gratinginline';
export default {
  name: 'product-card',
  components: {
    gratinginline,
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
  data() {
    return {
      // product: {
      //   brand: {
      //     id: "5ce61ee7c7758a561bf61c85",
      //     name: "Garnier",
      //     logo:
      //       "https://s3-ap-southeast-1.amazonaws.com/soc-newplatform/brand/jbY9Z9jShnLJmJ9gbqv204wu4xNKNTziDbxWURwx.jpeg"
      //   },
      //   default_category: {
      //     rating_types: [
      //       "is_star_effectiveness",
      //       "is_star_packaging",
      //       "is_star_texture",
      //       "is_star_value_for_money"
      //     ],
      //     id: "5ce668fd0ae5b6e40f265ab2",
      //     name: "Skin Care"
      //   },
      //   review_stats: {
      //     total_reviews: 9171,
      //     average_rating: 4.4782579256351545,
      //     total_recommended_count: 5,
      //     total_repurchase_maybe_count: 1,
      //     total_repurchase_no_count: 2,
      //     total_repurchase_yes_count: 4
      //   },
      //   max_limit_per_order: 0,
      //   is_dangerous: false,
      //   is_liquid: false,
      //   available_for_order: true,
      //   product_ticket: false,
      //   exclude_from_senka_page: true,
      //   hide_pack_content: false,
      //   is_sociolla_sync: false,
      //   is_offline_store: false,
      //   is_active: true,
      //   is_deleted: false,
      //   status: "approved",
      //   _id: "5d21bf752dc3161053af7c6d",
      //   my_sociolla_sql_id: 8871,
      //   id: 19471,
      //   name: "Micellar Water",
      //   description: null,
      //   content:
      //     "<ul><li><strong>Garnier Micellar Water Pink</strong></li>\r\n</ul><p>Efektif untuk membersihkan makeup, mengangkat kotoran, serta menyegarkan wajah. Formulanya tidak lengket di wajah, tanpa alkohol dan parfum, sehingga sangat cocok untuk semua jenis kulit termasuk kulit sensitif.</p>\r\n<p> </p>\r\n<p> </p>\r\n<ul><li><strong>Garnier Micellar Water Biru</strong></li>\r\n</ul><p>Efektif untuk membersihkan makeup, mengangkat kotoran, serta minyak. Formulanya menyegarkan, tanpa parfum. Dapat mengurangi minyak berlebih tanpa menyebabkan kulit kering maupun iritasi.</p>",
      //   how_to_use: null,
      //   ingredients: null,
      //   images: [
      //     {
      //       is_cover: true,
      //       _id: "5d21bf752dc3161053af7c71",
      //       url: "https://www.sociolla.com/16919-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c70",
      //       url: "https://www.sociolla.com/16920-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c6f",
      //       url: "https://www.sociolla.com/16921-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c6e",
      //       url: "https://www.sociolla.com/16922-large_default/8871.jpg",
      //       deleted_at: null
      //     }
      //   ],
      //   deleted_at: null,
      //   created_at: "2018-01-19T05:00:06.000Z",
      //   updated_at: "2019-07-09T06:13:11.639Z",
      //   categories: [
      //     {
      //       _id: "5d21bf752dc3161053af7c74",
      //       id: "5ce668fd0ae5b6e40f265ab2",
      //       name: "Skin Care"
      //     },
      //     {
      //       _id: "5d21bf752dc3161053af7c73",
      //       id: "5ce78792e3195861f1dd0544",
      //       name: "Cleanser"
      //     },
      //     {
      //       _id: "5d21bf752dc3161053af7c72",
      //       id: "5ce78793e3195861f1dd0546",
      //       name: "Makeup Remover"
      //     }
      //   ],
      //   combinations: [
      //     {
      //       attribute: {
      //         size: { id: "5d210d3d59547d087b6accb1", name: "125 ml" },
      //         shade: { id: "5ce61fd37e319a57d4b4eb25", name: "Pink" }
      //       },
      //       is_discounted: false,
      //       is_active: false,
      //       is_deleted: false,
      //       images: [
      //         {
      //           is_cover: false,
      //           _id: "5d21bf752dc3161053af7c7c",
      //           url:
      //             "https://s3-ap-southeast-1.amazonaws.com/img-sociolla/img/p/1/6/9/2/0/16920-large_default.jpg"
      //         }
      //       ],
      //       discounts: [],
      //       _id: "5d21bf752dc3161053af7c7b",
      //       ean_no: "6928820029572"
      //     },
      //     {
      //       attribute: {
      //         size: { id: "5d210d3d59547d087b6accb1", name: "125 ml" },
      //         shade: { id: "5ce61fd37e319a57d4b4eb21", name: "Blue" }
      //       },
      //       is_discounted: false,
      //       is_active: false,
      //       is_deleted: false,
      //       images: [
      //         {
      //           is_cover: false,
      //           _id: "5d21bf752dc3161053af7c7a",
      //           url:
      //             "https://s3-ap-southeast-1.amazonaws.com/img-sociolla/img/p/1/6/9/1/9/16919-large_default.jpg"
      //         }
      //       ],
      //       discounts: [],
      //       _id: "5d21bf752dc3161053af7c79",
      //       ean_no: "6928820029558"
      //     },
      //     {
      //       attribute: {
      //         size: { id: "5d210d3d59547d087b6acc94", name: "400 ML" },
      //         shade: { id: "5ce61fd37e319a57d4b4eb25", name: "Pink" }
      //       },
      //       is_discounted: false,
      //       is_active: false,
      //       is_deleted: false,
      //       images: [
      //         {
      //           is_cover: false,
      //           _id: "5d21bf752dc3161053af7c78",
      //           url:
      //             "https://s3-ap-southeast-1.amazonaws.com/img-sociolla/img/p/1/6/9/2/1/16921-large_default.jpg"
      //         }
      //       ],
      //       discounts: [],
      //       _id: "5d21bf752dc3161053af7c77",
      //       ean_no: "6928820029589"
      //     },
      //     {
      //       attribute: {
      //         size: { id: "5d210d3d59547d087b6acc94", name: "400 ML" },
      //         shade: { id: "5ce61fd37e319a57d4b4eb21", name: "Blue" }
      //       },
      //       is_discounted: false,
      //       is_active: false,
      //       is_deleted: false,
      //       images: [
      //         {
      //           is_cover: false,
      //           _id: "5d21bf752dc3161053af7c76",
      //           url:
      //             "https://s3-ap-southeast-1.amazonaws.com/img-sociolla/img/p/1/6/9/2/2/16922-large_default.jpg"
      //         }
      //       ],
      //       discounts: [],
      //       _id: "5d21bf752dc3161053af7c75",
      //       ean_no: "6928820029565"
      //     }
      //   ],
      //   tags: [],
      //   url_sociolla:
      //     "https://review-revamp-sociolla.sociolabs.io/skin-care/8871-micellar-water.html",
      //   pack_detail: [],
      //   __v: 0,
      //   active: true,
      //   price: 26500,
      //   stock: "4298",
      //   price_after_discount: 0,
      //   is_wishlist: false,
      //   id_wishlist_product: null,
      //   wishlist_product: false,
      //   discount: 0,
      //   discount_type: null,
      //   id_default_product_attribute: "7449",
      //   has_bookmarked: false,
      //   manufacture: {
      //     id: "5ce61ee7c7758a561bf61c85",
      //     name: "Garnier",
      //     logo:
      //       "https://s3-ap-southeast-1.amazonaws.com/soc-newplatform/brand/jbY9Z9jShnLJmJ9gbqv204wu4xNKNTziDbxWURwx.jpeg"
      //   },
      //   counter_review_rating: 4.4782579256351545,
      //   counter_review_user: 9171,
      //   category: {
      //     rating_types: [
      //       "is_star_effectiveness",
      //       "is_star_packaging",
      //       "is_star_texture",
      //       "is_star_value_for_money"
      //     ],
      //     id: "5ce668fd0ae5b6e40f265ab2",
      //     name: "Skin Care"
      //   },
      //   la_ps_product_id_product: 8871,
      //   product_images: [
      //     {
      //       is_cover: true,
      //       _id: "5d21bf752dc3161053af7c71",
      //       url: "https://www.sociolla.com/16919-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c70",
      //       url: "https://www.sociolla.com/16920-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c6f",
      //       url: "https://www.sociolla.com/16921-large_default/8871.jpg",
      //       deleted_at: null
      //     },
      //     {
      //       is_cover: false,
      //       _id: "5d21bf752dc3161053af7c6e",
      //       url: "https://www.sociolla.com/16922-large_default/8871.jpg",
      //       deleted_at: null
      //     }
      //   ]
      // }
    };
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
    reviewStarFillNumber() {
      if (this.product.review_stats && this.product.counter_review_rating) {
        return this.$options.filters.rating(this.product.counter_review_rating);
      } else {
        return this.$options.filters.rating(this.product.count_of_ratings);
      }
    },

    combination() {
      return this.product.combinations.find(({ _id }) => _id == this.product.combination_id);
    },

    attributes() {
      const { attributes } = this.combination;
      return Object.keys(attributes).map((key) => `${key}: ${attributes[key].name}`);
    },
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
