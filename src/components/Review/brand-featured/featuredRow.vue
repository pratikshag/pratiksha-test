<template>
  <tr>
    <td class="text-bold">{{ position + 1 }}</td>
    <td class="text-bold">
      <img class="img-fluid" onerror="this.src = '/assets/img/dummy_product.svg'" :src="brand.logo" alt width="150px" />
    </td>
    <td>
      <div class="fieldarea fieldselect">
        <multiselect
          v-model="brand"
          name="post0"
          :options="searchResults"
          :searchable="true"
          :show-labels="true"
          :disabled="false"
          track-by="_id"
          label="name"
          open-direction="bottom"
          class="sc-form-input"
          :loading="isLoading"
          @search-change="searchQuery"
        ></multiselect>
        <input v-validate="'required'" type="hidden" name="post0" />
      </div>
    </td>
    <td>{{ brand.total_reviews }}</td>

    <td>
      <a :href="brand.url">{{ brand.name }}</a>
    </td>
    <td align="center">
      <span v-if="brand._id" title="Trash" aria-hidden="true" class="fa fa-trash btn_delete" @click="deleteHighlight">
      </span>
    </td>
  </tr>
</template>

<script>
import Multiselect from 'vue-multiselect';
import Axios from 'axios';
const Config = require('../../../../config/default.env');

let cancelResource;

export default {
  name: 'featured-row',
  components: {
    Multiselect,
  },
  props: ['data', 'position', 'category', 'platform', 'featuredBrands'],
  data() {
    return {
      tempBrand: false,
      searchResults: [],
      isLoading: false,
    };
  },
  computed: {
    brand: {
      get() {
        return this.data ? this.data : {};
      },
      set(value) {
        this.tempBrand = value;
      },
    },
    key() {
      return this.platform === 'apps' ? 'featured_brands_apps' : 'featured_brands';
    },
  },
  watch: {
    tempBrand(newVal, oldVal) {
      const self = this;

      if (typeof oldVal == 'object' || (oldVal._id != '' && oldVal._id != newVal._id)) {
        self.isLoading = true;

        const payload = JSON.parse(JSON.stringify(self.featuredBrands));
        payload[self.position] = newVal;

        return Promise.all([
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/brands/${newVal._id}`, {
            is_featured: true,
          }),
          Axios.put(Config.default.MS_CATALOG_API_URL + `/v3/categories/${self.category._id}/featured-brand`, {
            [self.key]: payload.map((dt) => dt._id || null),
          }),
        ]).then(function () {
          self.$emit('createAction');
          self.$toasted.global.show('Sucessfully change featured product.');
          self.isLoading = false;
        });
      }
    },
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/brands', {
        cancelToken: cancelResource.token,
        params: {
          filter: {
            name: { $exists: true, $regex: '^' + query, $options: 'i' },
            is_active_in_review: true,
          },
          fields: 'id name is_active_in_sociolla is_active_in_review total_reviews',
        },
      })
        .then((response) => {
          if (response && response.status == 200) {
            this.searchResults = response.data.data;
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

    deleteFeaturedBrand() {
      const self = this;
      const payload = JSON.parse(JSON.stringify(self.featuredBrands));
      payload.splice(self.position, 1, {});

      return Promise.all([
        Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/brands/${self.brand._id}`, {
          is_featured: false,
        }),
        Axios.put(Config.default.MS_CATALOG_API_URL + `/v3/categories/${self.category._id}/featured-brand`, {
          [self.key]: payload.map((dt) => dt._id || null),
        }),
      ]);
    },

    deleteHighlight() {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          return self.deleteFeaturedBrand();
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
  },
};
</script>

<style scoped>
td {
  text-align: center !important;
}
.text-bold {
  font-weight: bold;
}
.margin-above {
  margin-top: 50px;
}
</style>
