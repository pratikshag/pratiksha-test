<template src="./list.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import CustomForm from './CustomForm';
import featuredRow from './featuredRow';

export default {
  name: 'product-featured-list',
  components: {
    CustomForm,
    featuredRow,
  },
  data() {
    return {
      type: [
        {
          label: 'Our Curated Selections',
          name: 'trending',
          default_name: 'default-trending',
          config: { limit: 20 },
          title: '',
        },
        {
          label: 'Trending in SOCO',
          name: 'have-you-tried',
          default_name: 'default-have-you-tried',
          config: { limit: 10 },
          title: '',
        },
        // {
        //   label: 'Featured Popular Category Products',
        //   name: 'popular-category',
        //   default_name: 'default-popular-category',
        //   category: {
        //     name: 'Makeup',
        //     slug: 'makeup',
        //   },
        //   config: { limit: 4 },
        // },
        {
          label: 'You Might Love These',
          name: 'you-might-love-these',
          default_name: 'you-might-love-these',
          config: { limit: 10 },
          title: '',
        },
      ],
      selectedLocation: {},
      currentLocation: {},
      selectedCategory: {},
      filterCategory: {},
      categories: [
        {
          id: '',
          name: 'Makeup',
          slug: 'makeup',
          link_rewrite: 'makeup',
        },
      ],
      is_loading: false,

      lastMapedPosition: new Date(),
      featuredProducts: [],
      featuredProductsSet: [],
      defaultFeaturedProducts: [],
      customForm: false,
    };
  },
  computed: {
    showSubmit: function () {
      if (this.selectedLocation.name === 'popular-category') {
        if (!this.selectedCategory) {
          // subcat not yet selected
          return false;
        }
        if (this.currentLocation.category && this.currentLocation.category.slug == this.selectedCategory.slug) {
          // if on same subcategory
          return false;
        }
      } else if (this.selectedLocation.name === this.currentLocation.name) {
        return false;
      }
      return true;
    },
    currentLimit: function () {
      if (this.currentLocation.config && this.currentLocation.config.limit) {
        return this.currentLocation.config.limit;
      }

      return 0;
    },

    // showCustomButton() {
    //   return this.currentLocation.name == 'trending' && this.selectedLocation.name == 'trending';
    // },

    showCustomForm: {
      get() {
        return this.customForm && this.selectedLocation.name == 'trending';
      },
      set(value) {
        this.customForm = value;
      },
    },

    textCustom() {
      return this.customForm ? 'Close Settings' : 'Custom Settings';
    },
  },
  created: function () {
    this.getPopularCategories();
  },
  methods: {
    getPopularCategories() {
      return Axios.get(Config.default.MS_CATALOG_API_URL + `/categories`, {
        params: {
          section: 'getPopularCategories',
          filter: { is_popular: true },
          fields: 'name slug link_rewrite',
          sort: 'position',
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data) {
            this.categories = (response.data.data || []).map((el) => {
              el.id = el._id;
              delete el._id;
              return el;
            });
          }
        })
        .catch((err) => {
          throw err;
        });
    },

    submitLocation() {
      if (this.selectedLocation.name != 'popular-category') {
        this.selectedCategory = {};
        this.filterCategory = {};
        this.showCustomForm = false;
      }

      if (this.selectedCategory && this.selectedCategory.slug) {
        this.filterCategory = {
          'product_category.link_rewrite': this.selectedCategory.link_rewrite,
        };
        this.showCustomForm = false;
      }

      this.currentLocation = {
        ...this.selectedLocation,
        category: this.selectedCategory,
      };

      if (['trending', 'you-might-love-these'].includes(this.currentLocation.name)) {
        this.defaultFeaturedProducts = [];
        this.getFeaturedProducts();
      } else {
        this.getDefaultFeaturedProducts().then(() => this.getFeaturedProducts());
      }
    },

    getFeaturedProducts: function () {
      this.featuredProductsSet = [];

      this.is_loading = true;
      const limit = this.currentLocation.name === 'trending' ? 21 : 11;

      // fill all the large spots
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products`, {
        params: {
          section: 'getFeaturedProducts',
          filter: {
            type: this.currentLocation.name,
            ...this.filterCategory,
          },
          sort: 'position',
          limit: limit,
        },
      })
        .then((response) => {
          if (response.status == 200) {
            this.featuredProductsSet = response.data.data;
            this.rowMapingPosition();
          }
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          this.is_loading = false;
        });
    },

    getDefaultFeaturedProducts: function () {
      this.defaultFeaturedProducts = [];

      // fill all the large spots
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products`, {
        params: {
          section: 'getDefaultFeaturedProducts',
          filter: {
            type: this.currentLocation.default_name,
            platform: 'id',
            ...this.filterCategory,
          },
          sort: 'position',
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data) {
            this.defaultFeaturedProducts = response.data.data;
          }
        })
        .catch((err) => {
          throw err;
        });
    },

    rowMapingPosition() {
      let default_i = 0;
      this.featuredProducts = [];

      const titleData = this.featuredProductsSet.find((product) => product.position === 0);
      if (titleData && titleData.title) {
        this.currentLocation.title = titleData.title;
      }

      while (this.featuredProducts.length < this.currentLimit) {
        const arrayPosition = this.featuredProducts.length;
        const databasePosition = arrayPosition + 1;

        const foundFeatured = this.featuredProductsSet.find((product) => product.position === databasePosition);

        if (foundFeatured) {
          this.featuredProducts.push({
            is_default: false,
            ...foundFeatured,
            position: arrayPosition,
          });
        } else {
          if (default_i < this.defaultFeaturedProducts.length) {
            this.featuredProducts.push({
              ...this.defaultFeaturedProducts[default_i],
              is_default: true,
              position: arrayPosition,
            });
            default_i++;
          } else {
            this.featuredProducts.push({
              is_default: true,
              position: arrayPosition,
              product_id: null,
              product: null,
            });
          }
        }
      }

      this.lastMapedPosition = new Date();
      // console.log('rowMapingPosition finish', this.lastMapedPosition , this.featuredProducts)
    },

    onSubmitCustom(params) {
      this.submitLocation();
      this.showCustomForm = false;
      this.$toasted.global.show('Config was successfully updated!', { icon: 'check' });
    },
    onSaveTitle() {
      if (!this.currentLocation.title) {
        return this.$toasted.global.error('Title cannot be empty!');
      } else if (!this.featuredProductsSet?.length) {
        return this.$toasted.global.error('At least one product should be set!');
      } else {
        return new Promise((resolve, reject) => {
          try {
            const titleEntry = this.featuredProductsSet.find((product) => product.position === 0);
            const targetId = titleEntry ? titleEntry._id : this.featuredProductsSet[0]._id;

            resolve(
              Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products/` + targetId, {
                title: String(this.currentLocation.title).trim(),
                position: 0,
                product_id: null,
              })
            );
          } catch (error) {
            reject(error);
          }
        })
          .then(() => this.$toasted.global.show('Title was successfully saved!', { icon: 'check' }))
          .catch(() => this.$toasted.global.error('Please try again later'));
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/sass/partial/help-reset';
.table100.ver1 {
  overflow: visible;
}
</style>
