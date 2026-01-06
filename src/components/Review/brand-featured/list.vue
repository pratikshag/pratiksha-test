<template src="./list.html"></template>
<script>
import Axios from 'axios';
import Multiselect from 'vue-multiselect';
import { startCase } from 'lodash';
const Config = require('../../../../config/default.env');
const slugify = require('../../../../src/helper.js');
import featuredRow from './featuredRow';
import { mapActions } from 'vuex';

export default {
  name: 'brand-featured-list',
  components: { featuredRow, Multiselect },
  data() {
    return {
      data: [],
      featuredBrands: [],
      is_loading: false,
      limit: 10,
      platform: {
        selected: null,
        options: ['review-web', 'apps'],
      },
      category: {
        selected: null,
        options: [],
        loading: true,
      },
      startCase: (string) => startCase(string),
      categoryFields: [
        'name',
        'my_soco_sql_id',
        'my_sociolla_sql_id',
        'link_rewrite',
        'parents',
        'slug',
        'banner_for_sociolla',
        'logo',
        'is_featured',
      ],
    };
  },
  computed: {
    categoryFilter() {
      return {
        is_featured: true
      };
    },
  },
  watch: {
    'platform.selected'() {
      if (this.category.selected) {
        return Promise.all([this.getFeaturedBrands(), this.onCategorySearch()]);
      }
      return this.onCategorySearch();
    },
    'category.selected'() {
      return this.getFeaturedBrands();
    },
  },
  methods: {
    ...mapActions('categories/featured', ['getCategoryParents']),
    getFeaturedBrands: function () {
      this.featuredBrands = [];

      this.is_loading = true;
      return Axios.get(
        Config.default.MS_CATALOG_API_URL + `/v3/categories/${this.category.selected._id}/featured-brand`,
        {
          params: {
            filter: { platform: this.platform.selected },
            fields:
              'name logo total_reviews is_featured featured_position is_active_in_sociolla is_active_in_review my_soco_sql_id',
          },
        }
      )
        .then(({ data, status }) => {
          if (status == 200) {
            const brands = data.data;
            for (let i = 0; i < 10; i++) {
              this.featuredBrands[i] = brands[i] || {};
            }
            this.data = brands.map((_data) => {
              if (_data) {
                _data.url =
                  Config.default.REVIEW_WEB_URL +
                  `/brand/${_data.my_soco_sql_id}/${slugify.default.slugify(_data.name)}`;
              }
              return _data;
            });
          }
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          this.is_loading = false;
        });
    },
    onCategorySearch: function (_) {
      const filter = this.categoryFilter;
      this.category.loading = true;
      return this.getCategoryParents({ filter, fields: this.categoryFields.join(), skip: 0, limit: 10 })
        .then((result) => (this.category.options = result))
        .finally(() => (this.category.loading = false));
    },
  },
};
</script>

<style scoped>
select {
  min-width: 14% !important;
}
#post-query-submit {
  margin-left: 30px !important;
}
.loaderspin {
  height: 28px;
  width: 28px;
  margin-top: 0;
}
</style>
