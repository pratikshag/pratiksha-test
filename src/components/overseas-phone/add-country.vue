<template>
  <main class="add-country">
    <section class="sc-form">
      <h4 class="sc-form-title">{{ countryId ? 'Edit' : 'Add' }} Country</h4>
      <form class="sc-form-container">
        <div class="sc-form-group">
          <label for="country" class="sc-form-label">Country</label>
          <div class="form-field form-required">
            <input v-if="countryId" v-model="country.name.name" type="text" disabled style="padding: 24px 12px" />
            <multiselect
              v-else
              v-model="country.name"
              :multiple="false"
              :options="country.options"
              label="name"
              track-by="name"
              placeholder="-- Search country --"
              @search-change="onChange"
            ></multiselect>
          </div>
        </div>
        <div class="sc-form-group">
          <label for="flag" class="sc-form-label">Flag</label>
          <input
            id="flag"
            ref="flag"
            hidden
            type="file"
            name="flag"
            class="sc-form-input"
            accept="image/*"
            @change="selectFlag($event.target.files)"
          />
          <div class="sc-row-items" style="width: max-content">
            <button class="sc-btn sc-btn-rounded sc-btn-sm sc-mr-10" @click.prevent="$refs['flag'].click()">
              Browse
            </button>
            <img
              v-if="country.flag"
              :src="country.flag"
              :alt="country.name"
              height="36"
              width="auto"
              style="object-fit: cover"
            />
            <span v-else>No flag selected</span>
          </div>
        </div>
        <div class="sc-form-group">
          <label for="code" class="sc-form-label">Code</label>
          <div id="code" class="sc-form-input">
            <input id="code" v-model="country.code" type="text" name="code" />
          </div>
        </div>
        <div class="sc-form-group">
          <label for="active" class="sc-form-label">Active</label>
          <select id="status" v-model="country.is_active" class="sc-form-input" required="" name="status">
            <option :value="true" :selected="country.is_active">Active</option>
            <option :value="false" :selected="country.is_active">Not Active</option>
          </select>
        </div>
        <div class="sc-form-group">
          <label for="active_in_offline_store" class="sc-form-label">Active in Offline Store</label>
          <select
            id="status_offline_store"
            v-model="country.is_active_in_offline_store"
            class="sc-form-input"
            required=""
            name="status_offline_store"
          >
            <option :value="true" :selected="country.is_active_in_offline_store">Active</option>
            <option :value="false" :selected="country.is_active_in_offline_store">Not Active</option>
          </select>
        </div>
        <div class="sc-form-group">
          <label for="active_in_offline_store_vn" class="sc-form-label">Active in Offline Store VN</label>
          <select
            id="status_offline_store_vn"
            v-model="country.is_active_in_offline_store_vn"
            class="sc-form-input"
            required=""
            name="status_offline_store_vn"
          >
            <option :value="true" :selected="country.is_active_in_offline_store_vn">Active</option>
            <option :value="false" :selected="country.is_active_in_offline_store_vn">Not Active</option>
          </select>
        </div>
        <div v-if="submitLoading" class="loaderspin button-loader"></div>
        <div v-else class="sc-filter-button sc-mt-20 sc-align-right">
          <input
            type="submit"
            value="BACK"
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-secondary sc-mr-10"
            @click="back"
          />
          <input
            type="submit"
            :value="countryId ? 'UPDATE' : 'SUBMIT'"
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-primary"
            @click="submit"
          />
        </div>
      </form>
    </section>
  </main>
</template>

<script>
const Config = require('../../../config/default.env').default;
import { get } from 'lodash';
import Multiselect from 'vue-multiselect';

export default {
  name: 'AddCountry',
  components: { Multiselect },
  data() {
    return {
      country: {
        options: [],
        name: '',
        code: '',
        flag: '',
        loading: true,
      },
      endpoint: `${Config.MS_SOCO_ADMIN_API_URL}/countries`,
      submitLoading: false,
      limit: 3,
    };
  },
  computed: {
    countryId() {
      return this.$route.params.id;
    },
    filter() {
      const filter = {};
      if (this.country.name) {
        filter['name'] = { $regex: this.country.name, $options: 'i' };
      }
      return filter;
    },
  },
  watch: {
    countryId: {
      immediate: true,
      handler(id) {
        this.fetchCountries(id);
      },
    },
  },
  methods: {
    async fetchCountries(id) {
      return new Promise((resolve, reject) => {
        try {
          this.loading = true;
          const { endpoint, filter, limit } = this;
          resolve(
            !id
              ? axios.get(endpoint, {
                  params: {
                    filter,
                    limit,
                  },
                })
              : axios.get(`${endpoint}/${id}`)
          );
        } catch (error) {
          reject(error);
        }
      })
        .then((response) => {
          if (this.countryId) {
            const country = response.data?.data || {};
            this.country.name = country;
            this.country.code = country.phone_code;
            this.country.flag = country.flag;
            this.country.is_active = country.is_active ? country.is_active : false;
            this.country.is_active_in_offline_store = country.is_active_in_offline_store
              ? country.is_active_in_offline_store
              : false;
            this.country.is_active_in_offline_store_vn = country.is_active_in_offline_store_vn
              ? country.is_active_in_offline_store_vn
              : false;
          } else {
            this.country.options = response.data?.data || [];
          }
        })
        .finally(() => (this.loading = false));
    },
    async submit() {
      return new Promise((resolve, reject) => {
        try {
          const { endpoint, country, countryId } = this;
          const id = countryId || country.name._id;
          this.submitLoading = true;
          resolve(
            axios.put(`${endpoint}/${id}`, {
              is_active: country.is_active,
              is_active_in_offline_store: country.is_active_in_offline_store,
              is_active_in_offline_store_vn: country.is_active_in_offline_store_vn,
              flag: country.flag,
              phone_code: country.code,
            })
          );
        } catch (error) {
          reject(error);
        }
      })
        .then(() => {
          this.$toasted.global.show(`Country ${this.countryId ? 'edited' : 'added'}`);
          this.back();
        })
        .finally(() => (this.submitLoading = false));
    },
    back() {
      this.$router.push({ name: 'countries' });
    },
    onChange(value) {
      if (value) {
        this.country.name = value;
        this.fetchCountries();
      }
    },
    selectFlag(file) {
      if (file && file[0]) {
        const reader = new FileReader();
        reader.onload = function () {
          const fileName = get(file[0], 'name', '');
          this.$store
            .dispatch('files/putFile', {
              filename: fileName,
              blob: file[0],
            })
            .then(({ url }) => {
              this.country.flag = url;
            });
        }.bind(this);
        reader.readAsText(file[0]);
        reader.onerror = function (error) {
          console.error(error);
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sc-form-container {
  input[type='text'] {
    width: 100%;
  }
  input[type='radio'] {
    &::before,
    &::after {
      z-index: 0;
    }
  }
  .sc-form-radio {
    display: flex;
    gap: 30px;
    > div {
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}
.country-list {
  padding: 0;
  margin: 0;
  background: #fff;
  padding: 10px 16px;
  position: absolute;
  width: auto;
  z-index: 10;
  li {
    cursor: pointer;
    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }
}
</style>
