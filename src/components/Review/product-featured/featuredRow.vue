<template>
  <tr>
    <td class="text-bold">{{ position + 1 }}</td>
    <td>
      <div class="fieldarea fieldselect">
        <multiselect
          v-model="product"
          name="post0"
          :options="searchResults"
          :searchable="true"
          :show-labels="true"
          :disabled="false"
          track-by="id"
          :custom-label="pname"
          open-direction="top"
          :loading="isLoading"
          @search-change="searchQuery"
        ></multiselect>
        <input v-validate="'required'" type="hidden" name="post0" />
      </div>
    </td>
    <td class="text-bold">
      {{ product && product.brand ? product.brand.name : '-' }}
    </td>
    <td>
      {{ product && product.review_stats ? Number(product.review_stats.average_rating).toPrecision(2) : 0 }}
    </td>
    <td>
      {{ product && product.review_stats ? product.review_stats.total_reviews : 0 }}
    </td>
    <td>
      <div v-if="!data.is_default" class="row date-container">
        <input v-model="start_date" type="date" />
        <span>s.d.</span>
        <input v-model="end_date" type="date" />
        <span v-if="isDateChanged" class="action" @click.prevent="setFeaturedDate"><i class="fa fa-save"></i></span>
        <span v-else-if="data.start_date || data.end_date" class="action" @click.prevent="cancelFeaturedDate">x</span>
      </div>
      <div v-else>default</div>
    </td>
    <td align="center">
      <span
        v-if="!data.is_default"
        title="Trash"
        aria-hidden="true"
        class="fa fa-trash btn_delete"
        @click="deleteHighlight"
      >
      </span>
    </td>
  </tr>
</template>

<script>
import Multiselect from 'vue-multiselect';
import Axios from 'axios';
import { isEmpty } from 'lodash';
const Config = require('../../../../config/default.env');

let cancelResource;

export default {
  name: 'featured-row',
  components: {
    Multiselect,
  },
  props: ['data', 'selectedLocation', 'selectedCategory', 'position'],
  data() {
    return {
      tempProduct: false,
      searchResults: [],
      isLoading: false,
      isDateChanged: false,
      temp: {
        end_date: null,
        start_date: null,
      },
    };
  },
  computed: {
    product: {
      get() {
        return this.data?.product && !isEmpty(this.data.product) ? this.data.product : this.tempProduct;
      },
      set(value) {
        this.tempProduct = value;
      },
    },
    start_date: {
      get() {
        return this.temp.start_date || this.data.start_date;
      },
      set(value) {
        this.isDateChanged = true;
        this.temp.start_date = value;
      },
    },
    end_date: {
      get() {
        return this.temp.end_date || this.data.end_date;
      },
      set(value) {
        this.isDateChanged = true;
        this.temp.end_date = value;
      },
    },
  },
  watch: {
    tempProduct(newVal, oldVal) {
      const self = this;
      if (typeof oldVal == 'object' || (oldVal._id != '' && oldVal._id != newVal._id)) {
        const category = newVal.categories && newVal.categories[0] ? newVal.categories[0] : {};
        const featured = {
          product_id: newVal._id,
          product_category: {
            id: category.id,
            name: category.name,
            slug: (this.selectedCategory && this.selectedCategory.slug) || category.name,
            link_rewrite: (this.selectedCategory && this.selectedCategory.link_rewrite) || category.link_rewrite,
          },
          type: self.selectedLocation.name.toLowerCase(),
          title: self.selectedLocation.title.toLowerCase(),
          position: (this.position || 0) + 1,
          start_date: null,
          end_date: null,
          platform: 'id',
        };

        self.isLoading = true;
        const criteria = {
          type: self.selectedLocation.name.toLowerCase(),
          position: (this.position || 0) + 1,
          start_date: null,
          end_date: null,
        };

        if (this.selectedCategory && this.selectedCategory.slug) {
          criteria['product_category.slug'] = this.selectedCategory.slug;
        }

        return self
          .deleteOldFeatured(criteria)
          .then(() => Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products`, featured))
          .then(() => {
            self.$emit('createAction');
            self.$toasted.global.show('Sucessfully change featured product.');
            self.isLoading = false;
          });
      }
    },
  },
  mounted() {
    this.temp.start_date = this.formateDate(this.data.start_date);
    this.temp.end_date = this.formateDate(this.data.end_date);
  },
  methods: {
    searchQuery: function (query) {
      this.$Progress.start();
      this.isLoading = true;
      if (typeof cancelResource === 'object') {
        cancelResource.cancel();
      }
      const CancelToken = Axios.CancelToken;
      cancelResource = CancelToken.source();

      const additionalFilter = {};
      if (this.selectedCategory && this.selectedCategory.name) {
        additionalFilter['categories.name'] = this.selectedCategory.name;
      }

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/products', {
        cancelToken: cancelResource.token,
        params: {
          filter: {
            ...additionalFilter,
            ...(query && { keyword: query }),
            is_active_in_review: true,
            is_deleted: false,
            is_in_stock: true,
            use_is_in_stock_filter: true,
          },
          fields:
            '_id id name images brand default_combination status categories review_stats is_active_in_review is_active_in_sociolla is_deleted',
        },
      })
        .then((response) => {
          if (response && response.status == 200) {
            this.searchResults = response.data.data;
            // console.log('query', query, this.searchResults)
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        })
        .finally(() => {
          this.isLoading = false;
          this.$Progress.finish();
        });
    },

    deleteOldFeatured(criteria) {
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products`, {
        params: {
          section: 'dataWillBeDelete',
          filter: criteria,
          fields: '_id title highlight',
        },
      }).then((result) => {
        if (result.data.success && result.data.data) {
          const data = result.data.data;
          const promises = [];
          data.forEach((it) => {
            promises.push(Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products/${it._id}`));
          });
          return Promise.all(promises);
        }
      });
    },

    deleteHighlight() {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          return self.deleteOldFeatured({
            type: self.selectedLocation.name.toLowerCase(),
            position: (self.position || 0) + 1,
          });
        })
        .then((response) => {
          self.$emit('deleteAction');
          self.$toasted.global.show('Sucessfully delete the highlight.');
        })
        .catch((err) => {
          console.log('Clicked on cancel');
          throw err;
        });
    },

    setFeaturedDate() {
      const self = this;
      const data = {
        end_date: new Date(self.end_date + ' 00:00:00').toISOString(),
        start_date: new Date(self.start_date + ' 23:59:59').toISOString(),
      };

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products/` + self.data._id, data);
        })
        .then((response) => {
          self.$emit('deleteAction');
          self.$toasted.global.show('Sucessfully set date featured.');
        })
        .catch((err) => {
          console.log('Clicked on cancel');
          throw err;
        });
    },

    cancelFeaturedDate() {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/featured/products/` + self.data._id, {
            end_date: null,
            start_date: null,
          });
        })
        .then((response) => {
          self.$emit('deleteAction');
          self.$toasted.global.show('Sucessfully set date featured.');
        })
        .catch((err) => {
          console.log('Clicked on cancel');
          throw err;
        });
    },

    formateDate(isoString) {
      const dateObj = new Date(isoString);
      const year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      let date = dateObj.getDate();

      month = String(month).length == 1 ? '0' + month : month;
      date = String(date).length == 1 ? '0' + date : date;

      return isoString ? `${year}-${month}-${date}` : null;
    },
    pname({ name, brand }) {
      return `${name ? name : ''} (${brand ? brand.name : ''})`;
    },
  },
};
</script>

<style lang="scss" scoped>
td {
  text-align: center !important;
}
.text-bold {
  font-weight: bold;
}
.margin-above {
  margin-top: 50px;
}

.row.date-container {
  width: 100%;
  padding-left: 30px;

  span {
    padding-top: 5px;
    width: 7%;

    &.action {
      cursor: pointer;
      color: red;
    }
  }

  input {
    width: 43%;
    border: 1px solid #000;
  }
}
</style>
