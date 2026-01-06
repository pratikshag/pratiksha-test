<template>
  <div class="soco-multiselect">
    <input v-model="keyword" class="form-control" type="text" placeholder="Tuliskan disini" @keyup="onSearch" />
    <div class="lists">
      <ul class="lists-container">
        <li v-for="(item, i) in options" :key="i" class="lists-item" @click.prevent="onSelect(item)">
          {{ item.name }}
        </li>
        <li
          v-if="has_load_more && options && options.length"
          class="lists-item load-more"
          @click.prevent="fetchOptionList(true)"
        >
          Load More
        </li>
        <li v-if="loading" class="lists-item load-more">
          <ball-pulse-loader color="#000000" size="10px"></ball-pulse-loader>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
const Config = require('../../../config/default.env');
import Axios from 'axios';
import { debounce } from '../../shared/util';

let CancelToken;
let source;

export default {
  name: 'soco-multi-select',
  props: {
    data: {
      type: String,
      required: false,
      default: '',
    },
    type: {
      type: String,
      required: false,
      default: '',
    },
    subType: {
      type: String,
      required: false,
      default: '',
    },
    forceFetch: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      result: '',
      keyword: '',
      options: [],
      has_load_more: false,
      loading: false,
      api_options: {
        filter: {},
        skip: 0,
        limit: 20,
        fields: '',
        sort: 'name',
      },
    };
  },
  watch: {
    data(newVal) {
      this.result = newVal;
    },
    result(newVal) {
      this.keyword = newVal;
    },
    type: {
      handler(val, old) {
        if (val != old) {
          this.result = '';
          this.keyword = '';
          this.options = [];
        }
      },
      deep: true,
    },
    subType: {
      handler(val, old) {
        if (val != old) {
          this.result = '';
          this.keyword = '';
          this.options = [];
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.api_options.skip = 0;
    if (this.forceFetch) {
      this.fetchOptionList();
    }
  },
  methods: {
    onSelect(data) {
      this.keyword = data.name;
      this.$emit('callback', data);
    },
    getParameters(load_more = false) {
      const params = this.api_options;

      if (!load_more) {
        params.skip = 0;
      }

      if (this.type == 'brand') {
        params.filter = {
          name: { $exists: true },
          is_active_in_sociolla: true,
        };
        params.fields =
          '_id,name,slug,logo,my_sociolla_sql_id,my_soco_sql_id,is_active_in_sociolla,is_active_in_sociolla_vn,is_active_in_lulla';
      } else if (this.type == 'product') {
        params.filter = {
          is_active_in_sociolla: true,
          combinations: { $exists: true, $ne: [] },
        };
        if (this.subType == 'egift') {
          params.filter.classification = 'egift';
        }
      } else if (this.type == 'category') {
        params.filter = {
          $or: [{ is_promotion: true }, { is_smart_saver: true }, { is_curated_mask_box: true }],
        };
        if (this.subType == 'main') {
          params.filter = {
            is_promotion: false,
            is_smart_saver: false,
            is_curated_mask_box: false,
          };
        }
        params.fields = 'name,slug,my_soco_sql_id,my_sociolla_sql_id,parents,is_active,is_active_in_lulla';
      } else if (this.type == 'campaign') {
        params.filter = params.fields = '_id,name,created_at,updated_at';
        params.sort = '-updated_at';
      }

      if (this.keyword) {
        if (['product', 'brand'].includes(this.type)) {
          if (this.type == 'product') {
            const array_filter = [];
            const field = ['name', 'brand.name', 'combinations.reference'];
            for (let i = 0; i < field.length; i++) {
              array_filter.push({
                [field[i]]: { $regex: this.keyword, $options: 'i' },
              });
            }
            if (array_filter && array_filter.length) {
              params.filter['$or'] = array_filter;
            }
          } else {
            params.filter.name = { $regex: this.keyword, $options: 'i' };
          }
        } else if (this.type == 'category') {
          const alphabet = this.keyword.match(/[a-zA-Z]+/g);
          const numeric = this.keyword.match(/[0-9]+/g);

          if (alphabet && alphabet.length) {
            params.filter['name'] = { $regex: alphabet[0], $options: 'i' };
          }

          if (numeric && numeric.length) {
            if (params.filter['name']) {
              params.filter = {
                ...params.filter,
                $or: [params.filter['name'], { my_sociolla_sql_id: numeric[0] }],
              };
            } else {
              params.filter['my_sociolla_sql_id'] = parseInt(numeric[0]);
            }
          }
        } else if (this.type == 'campaign') {
          params.filter['$or'] = [{ _id: this.keyword }, { name: { $regex: this.keyword, $options: 'i' } }];
        }
      }

      return params;
    },
    onSearch() {
      return debounce(() => {
        if (this.keyword.length < 3) {
          return;
        }
        this.fetchOptionList();
      }, 1000)();
    },
    async fetchOptionList(load_more = false) {
      this.loading = true;
      if (typeof source !== 'undefined') {
        source.cancel(false);
      }
      CancelToken = axios.CancelToken;
      source = CancelToken.source();

      const params = this.getParameters(load_more);

      let url = ``;
      if (this.type == 'brand') {
        url = `${Config.default.MS_CATALOG_API_URL}/v3/brands`;
      } else if (this.type == 'product') {
        url = `${Config.default.MS_CATALOG_API_URL}/v3/products`;
      } else if (this.type == 'category') {
        url = `${Config.default.MS_CATALOG_API_URL}/v3/categories`;
      } else if (this.type == 'campaign') {
        url = `${Config.default.MS_CATALOG_API_URL}/v3/promotions`;
      }

      this.has_load_more = false;
      await Axios.get(url, { params: params, cancelToken: source.token })
        .then((res) => {
          if (res.status == 200 && res.data.data && res.data.data.length) {
            const data = res.data.data;
            if (this.keyword && !load_more) {
              this.options = data;
            } else {
              this.options = this.options.concat(data);
            }
            if (data.length >= this.api_options.limit) {
              this.has_load_more = true;
            }
          }
          this.api_options.skip = this.api_options.skip + this.api_options.limit;
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
.soco-multiselect {
  position: relative;
  width: 100%;
  margin-left: 200px;
  .form-control {
    width: 100%;
    height: 36px;
  }
  .lists {
    width: 100%;
    background-color: #fff;
    border-radius: 4px;
    overflow: auto;
    max-height: 200px;
    margin-top: 10px;
    .lists-container {
      width: 100%;
      padding: 0;
      margin: 0;
      list-style: none;
      li {
        padding: 10px;
        border-bottom: 1px solid #e5e5e5;
        cursor: pointer;
        &:hover {
          opacity: 0.8;
        }
        &:last-child {
          border-bottom: none;
        }
        &.load-more {
          text-align: center;
        }
      }
    }
  }
}
</style>
