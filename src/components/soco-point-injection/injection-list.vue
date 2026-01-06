<template>
  <div class="soco-point-injection-report">
    <div class="soco-point-injection-report__heading">
      <h4>Injection List</h4>
      <router-link
        router-link
        :to="{ name: 'soco-point-injection-add' }"
        class="sc-btn sc-btn-rounded sc-btn-lg sc-btn-primary"
      >
        + ADD
      </router-link>
    </div>
    <div class="soco-point-injection-report__filter sc-mt-20">
      <div class="sc-filter">
        <div class="sc-filter-item">
          <div class="sc-filter-label">Project Name</div>
          <input v-model="filter.name" type="text" class="sc-filter-input" />
        </div>
        <div class="sc-filter-item">
          <div class="sc-filter-label">Username/ Email</div>
          <input v-model="filter.user" type="text" class="sc-filter-input" />
        </div>
        <div class="sc-filter-item">
          <div class="sc-filter-label">From date</div>
          <vuestic-date-picker
            id="date-picker-basic"
            v-model="filter.from_date"
            class="sc-filter-input"
            :config="{ dateFormat: 'd M Y' }"
          />
        </div>
        <div class="sc-filter-item">
          <div class="sc-filter-label">To date</div>
          <vuestic-date-picker
            id="date-picker-basic"
            v-model="filter.to_date"
            class="sc-filter-input"
            :config="{ dateFormat: 'd M Y' }"
          />
        </div>
        <div class="sc-filter-item">
          <div class="sc-filter-label">By</div>
          <input v-model="filter.created_by" type="text" class="sc-filter-input" />
        </div>
        <div class="sc-filter-item sc-filter-button">
          <input
            type="submit"
            value="Filter"
            class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
            @click="fetchData"
          />
          <input
            type="submit"
            value="Reset"
            class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
            @click="resetFilter"
          />
        </div>
      </div>
    </div>
    <div class="soco-point-injection-report__table sc-mt-20">
      <div class="sc-table-responsive">
        <table class="sc-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Date of Injection</th>
              <th>Username / Email</th>
              <th>By</th>
              <th>Total SOCO Points</th>
              <th>Enabled</th>
              <th>Last Updated By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="is_loading">
              <td colspan="7">
                <div class="loaderspin"></div>
              </td>
            </tr>
            <template v-else>
              <TableEmpty v-if="!(data && data.length)" :cols="7" />
              <tr v-for="(project, index) in data" :key="index">
                <td>{{ project.name }}</td>
                <td>{{ $options.filters.formatDate(project.insert_date) }}</td>
                <td>
                  <template v-if="project.campaign_injection && project.campaign_injection.user">
                    <span>{{ project.campaign_injection.user.name || '-' }}</span>
                    <br />
                    <span>{{ project.campaign_injection.user.email || '-' }}</span>
                    <br />
                    <span>{{ project.campaign_injection.user.phone_number || '-' }}</span>
                  </template>
                  <template v-else> - </template>
                </td>
                <td>{{ project.created_by ? project.created_by.email : '-' }}</td>
                <td>{{ project.total_point }}</td>
                <td>
                  <button
                    v-if="project.is_enable"
                    class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded"
                    @click="isEnableToggle(project)"
                  >
                    <img src="@/img/checked-white.svg" height="16" width="16" />
                  </button>
                  <button v-else class="sc-table-btn-item sc-btn sc-btn-rounded" @click="isEnableToggle(project)">
                    <img src="/assets/img/icon-close-white.svg" height="16" width="16" />
                  </button>
                </td>
                <td>
                  <p>
                    {{
                      project.updated_by
                        ? project.updated_by.email
                        : project.created_by
                        ? project.created_by.email
                        : '-'
                    }}
                  </p>
                  <p>{{ $options.filters.formatDate(project.updated_at) }}</p>
                </td>
                <td>
                  <div class="sc-table-btn column-btn">
                    <button
                      class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded sc-btn-sm"
                      @click="$router.push(`/soco-point-injection/edit/${project._id}`)"
                    >
                      Edit
                    </button>
                    <button
                      v-if="isCanDelete"
                      class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded sc-btn-sm"
                      @click="deleteList(project._id)"
                    >
                      DELETE
                    </button>
                    <button
                      class="sc-table-btn-item sc-btn sc-btn-primary sc-btn-rounded sc-btn-sm"
                      :disabled="project.report_link || project.is_in_progress"
                      @click="ManualExecute(project._id)"
                    >
                      Manual Execute
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="sc-pagination-row between">
        <div class="sc-pagination-page">
          <div class="sc-pagination-text">Page: {{ pagination.currentPage }} out of {{ pagination.totalPage }}</div>
          <div class="sc-pagination-text">Total Record: {{ pagination.currentTotalRecord }}</div>
        </div>
        <div class="sc-pagination">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const Config = require('../../../config/default.env').default;
import { get } from 'lodash';
export default {
  name: 'SocoPointInjectionList',
  data() {
    return {
      filter: {
        name: '',
        insert_date: '',
        created_by: '',
        from_date: '',
        to_date: '',
      },
      data: [],
      is_loading: true,
      endpoint: `${Config.MS_SOCO_ADMIN_API_URL}/soco-point-injection`,
      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        currentPage: 1,
        currentTotalRecord: 10,
      },
    };
  },
  computed: {
    filterBy() {
      const $key = {
        created_by: 'created_by.email',
      };
      return Object.keys(this.filter).reduce((result, key) => {
        if (this.filter[key]) {
          if (key !== 'from_date' && key !== 'to_date') {
            result[$key[key] || key] = { $regex: this.filter[key], $options: 'i' };
          } else {
            if (!result.insert_date) {
              result.insert_date = {};
            }
            if (key === 'from_date') {
              result.insert_date['$gte'] = moment(this.filter[key]).startOf('day').format();
            }
            if (key === 'to_date') {
              result.insert_date['$lte'] = moment(this.filter[key]).endOf('day').format();
            }
          }
        }
        return result;
      }, {});
    },
    userRole() {
      return this.$store.state.userrole;
    },
    isCanDelete() {
      return !['community,soco_cs_team'].includes(this.userRole);
    },
  },
  watch: {
    'pagination.currentPage': {
      immediate: true,
      handler() {
        this.fetchData();
      },
    },
  },
  created() {
    this.fetchData();
    this.fetchDataCount();
  },
  methods: {
    gotoPage(page) {
      this.pagination.skip = this.pagination.limit * (page - 1);
      this.pagination.currentPage = page;
    },
    async isEnableToggle({ _id, is_enable }) {
      return new Promise((resolve, reject) => {
        try {
          resolve(
            axios.put(`${this.endpoint}/${_id}`, {
              is_enable: !is_enable,
            })
          );
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        this.fetchData();
      });
    },
    async fetchData() {
      if (moment(this.filter.from_date).isAfter(this.filter.to_date)) {
        this.$toasted.global.error('From date should not be greater than to date');
        this.filter.from_date = '';
        this.filter.to_date = '';
        return false;
      }

      this.data = [];
      if (this.filterBy && Object.keys(this.filterBy).length) {
        this.captionBtn = 'filtered';
      } else {
        this.captionBtn = 'filter';
      }

      if (this.filterBy?.user) {
        const searchUser = this.filterBy.user;
        delete this.filterBy.user;

        this.filterBy['$or'] = [
          { 'campaign_injection.user.name': searchUser },
          { 'campaign_injection.user.email': searchUser },
        ];
      }

      return new Promise((resolve, reject) => {
        try {
          this.is_loading = true;
          resolve(
            axios.get(this.endpoint, {
              params: {
                filter: {
                  is_deleted: false,
                  ...this.filterBy,
                },
                sort: '-updated_at',
                skip: this.pagination.skip,
                limit: this.pagination.limit,
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      })
        .then((response) => {
          if (response.status == 200) {
            this.data = get(response, 'data.data', []);
          }
        })
        .finally(() => {
          this.is_loading = false;
        });
    },
    async fetchDataCount() {
      return new Promise((resolve, reject) => {
        try {
          resolve(
            axios.get(this.endpoint + '/count', {
              params: {
                filter: {
                  is_deleted: false,
                  ...this.filterBy,
                },
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
    async deleteList(id) {
      if (this.isCanDelete) {
        return new Promise((resolve, reject) => {
          try {
            resolve(axios.delete(`${this.endpoint}/${id}`));
          } catch (error) {
            reject(error);
          }
        }).then(() => {
          this.$toasted.global.show('Successfully deleted');
          this.fetchData();
        });
      }
    },
    async ManualExecute(id) {
      return new Promise((resolve, reject) => {
        try {
          resolve(axios.put(`${this.endpoint}/${id}/execute`));
        } catch (error) {
          reject(error);
        }
      })
        .then(() => {
          this.$toasted.global.show('Successfully executed');
          this.fetchData();
        })
        .catch(({ response }) => {
          if (response?.data?.message) {
            this.$toasted.global.error(response.data.message);
          }
        });
    },
    resetFilter() {
      this.filter = {
        name: '',
        from_date: '',
        to_date: '',
        created_by: '',
      };
      this.fetchData();
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/sass/_mixin';
.soco-point-injection-report {
  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    h4 {
      font-size: 20px;
      font-family: 'Lato-Bold', sans-serif;
    }
  }
}
.loaderspin {
  margin-bottom: 24px;
}
</style>
