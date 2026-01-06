<template>
  <main class="countries">
    <section class="countries__header">
      <h4>All Countries</h4>
      <router-link router-link :to="{ name: 'add-countries' }" class="sc-btn sc-btn-rounded sc-btn-lg sc-btn-primary">
        + ADD
      </router-link>
    </section>
    <section class="countries__filter sc-mt-20">
      <ul class="sc-filter">
        <li class="sc-filter-item">
          <div class="sc-filter-label">Name</div>
          <input v-model="filter.name" type="text" class="sc-filter-input" @keyup.enter="fetchData" />
        </li>
        <li class="sc-filter-item">
          <div class="sc-filter-label">Code</div>
          <input v-model="filter.code" type="text" class="sc-filter-input" @keyup.enter="fetchData" />
        </li>
        <li class="sc-filter-item sc-filter-button">
          <input
            type="submit"
            value="Filter"
            class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded"
            @click="fetchData"
          />
        </li>
      </ul>
    </section>
    <section class="countries__table">
      <section class="sc-table-responsive">
        <table class="sc-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Flag</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5">
                <div class="loaderspin"></div>
              </td>
            </tr>
            <template v-else>
              <TableEmpty v-if="!(countries && countries.length)" :cols="5" />
              <tr v-for="(country, index) in countries" :key="index">
                <td>{{ country.name }}</td>
                <td>{{ country.phone_code }}</td>
                <td>
                  <img height="36" width="auto" :src="country.flag" :alt="country.name" />
                </td>
                <td>{{ country.is_active ? 'Active' : 'Not Active' }}</td>
                <td style="width: 125px">
                  <div class="sc-table-btn column-btn">
                    <button
                      class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded sc-btn-sm"
                      @click="$router.push({ name: 'edit-countries', params: { id: country._id } })"
                    >
                      Edit
                    </button>
                    <!-- <button
                      class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded sc-btn-sm"
                      @click="deleteCountry(country._id)"
                    >
                      DELETE
                    </button> -->
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>
      <section class="sc-pagination-row between">
        <section class="sc-pagination-page">
          <div class="sc-pagination-text">Page: {{ pagination.currentPage }} out of {{ pagination.totalPage }}</div>
          <div class="sc-pagination-text">Total Record: {{ pagination.currentTotalRecord }}</div>
        </section>
        <section class="sc-pagination">
          <h1 class="sc-pagination-label">Pagination</h1>
          <div class="sc-pagination-form">
            <input
              v-if="pagination.currentPage > 1"
              class="sc-btn sc-btn-secondary sc-pagination-btn"
              type="submit"
              value="Prev"
              @click="gotoPage(pagination.currentPage - 1)"
            />
            <input
              v-model="pagination.currentPage"
              class="sc-pagination-input"
              type="number"
              min="1"
              :max="pagination.totalPage"
              name=""
              disabled
              @keyup.enter.prevent="gotoPage(pagination.currentPage)"
            />
            <input
              v-if="pagination.totalPage > pagination.currentPage"
              class="sc-btn sc-btn-secondary sc-pagination-btn"
              type="submit"
              value="Next"
              @click="gotoPage(pagination.currentPage + 1)"
            />
          </div>
        </section>
      </section>
    </section>
  </main>
</template>

<script>
const Config = require('../../../config/default.env').default;
import { get } from 'lodash';
export default {
  name: 'Countries',
  data() {
    return {
      filter: {
        name: '',
        code: '',
      },
      loading: true,
      countries: [],
      endpoint: `${Config.MS_SOCO_ADMIN_API_URL}/countries`,
      pagination: {
        skip: 0,
        limit: 15,
        totalPage: 0,
        currentPage: 1,
        currentTotalRecord: 15,
      },
    };
  },
  computed: {
    dashboardToken() {
      return this.$store.state.dashboardToken;
    },
    filterPayload() {
      const { filter } = this;
      const result = {};
      if (filter.name) {
        result['name'] = { $regex: filter.name, $options: 'i' };
      }
      if (filter.code) {
        result['phone_code'] = { $regex: filter.code, $options: 'i' };
      }
      return result;
    },
  },
  watch: {
    dashboardToken: {
      immediate: true,
      handler(token) {
        if (token) {
          this.fetchData();
        }
      },
    },
    'pagination.currentPage'() {
      this.fetchData();
    },
  },
  methods: {
    async fetchData() {
      this.loading = true;
      return Promise.all([this.fetchCountries(), this.fetchCountriesCount()]).finally(() => (this.loading = false));
    },
    async fetchCountries() {
      return new Promise((resolve, reject) => {
        try {
          const {
            endpoint,
            filterPayload: filter,
            pagination: { skip, limit },
          } = this;
          resolve(
            axios.get(endpoint, {
              params: {
                filter,
                skip,
                limit,
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      }).then((response) => {
        this.countries = get(response.data, 'data', []);
      });
    },
    async fetchCountriesCount() {
      return new Promise((resolve, reject) => {
        try {
          const {
            endpoint,
            filterPayload: filter,
            pagination: { skip, limit },
          } = this;
          resolve(
            axios.get(`${endpoint}/count`, {
              params: {
                filter,
                skip,
                limit,
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      }).then((response) => {
        const $count = parseInt(response.data.data);
        const count = isNaN($count) ? 0 : $count;
        this.pagination.currentTotalRecord = count;
        this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
      });
    },
    async deleteCountry(id) {
      return new Promise((resolve, reject) => {
        try {
          this.loading = true;
          resolve(axios.delete(`${this.endpoint}/${id}`));
        } catch (error) {
          reject(error);
        }
      })
        .then(() => {
          this.fetchData();
        })
        .catch(() => {
          this.loading = false;
        });
    },
    gotoPage(page) {
      this.pagination.skip = this.pagination.limit * (page - 1);
      this.pagination.currentPage = page;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/sass/_mixin';
.countries {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h4 {
      font-size: 20px;
      font-family: 'Lato-Bold', sans-serif;
    }
  }
  &__filter {
    margin-top: 20px;
    > ul {
      padding: 0;
      margin: 0;
    }
  }
  &__table {
    margin-top: 20px;
  }
  .loaderspin {
    margin-bottom: 24px;
  }
}
</style>
