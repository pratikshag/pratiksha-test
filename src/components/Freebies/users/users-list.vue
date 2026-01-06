<template>
  <div>
    <router-link :to="to" class="sc-btn sc-btn-primary sc-btn-md sc-btn-rounded">
      <span class="fa fa-angle-left"></span> Back
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <div class="sc-filter">
      <div class="sc-filter-item">
        <label class="sc-filter-label">Search Voucher: </label>
        <input v-model="search" class="sc-filter-input" type="input" @keyup="searchQuery" />
      </div>
      <div class="sc-filter-item">
        <label class="sc-filter-label">Select Status: </label>
        <select v-model="status" name="cat" class="sc-filter-input">
          <option value="" selected>-- Select Status --</option>
          <option v-for="(item, index) in options.filters" :key="index" :value="item.value" v-text="item.text"></option>
        </select>
      </div>
      <div class="sc-filter-item sc-filter-date">
        <label class="sc-filter-label">Registration Date: </label>
        <div class="d-flex between">
          <input
            v-model="start_date"
            placeholder="From"
            :formatter="formatDate"
            type="date"
            name="start_date"
            class="sc-filter-input sc-filter-input-date"
          />
          <input
            v-model="end_date"
            placeholder="To"
            :formatter="formatDate"
            type="date"
            name="end_date"
            class="sc-filter-input sc-filter-input-date"
          />
        </div>
      </div>
      <div class="sc-filter-item sc-filter-button">
        <input
          type="submit"
          value="Filter"
          class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
          @click="filterBystatus"
        />
      </div>
    </div>

    <div class="sc-filter">
      <div class="sc-filter-item sc-filter-button">
        <vue-json-to-csv :json-data="exportData" :labels="exportLabels" csv-title="Subscriber">
          <button
            class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-uppercase sc-mr-10"
            @click="getExportData()"
          >
            Export data
          </button>
        </vue-json-to-csv>
        <button
          class="sc-btn sc-btn-primary sc-btn-md sc-btn-rounded sc-uppercase sc-mr-10"
          :disabled="!isChecked"
          @click="onBulkWinners"
        >
          Set bulk winners
          <span v-if="isChecked" class="badge badge-info" v-text="checked.length"></span>
        </button>
        <button class="sc-btn sc-btn-primary sc-btn-md sc-btn-rounded sc-uppercase" @click="onBulkWinnersCsv">
          Set bulk winners from csv
        </button>
      </div>
    </div>

    <div class="sc-filter">
      <div class="sc-filter-item sc-filter-button">
        <router-link
          :to="{ name: 'freebies-participant-survey', params: { id: id } }"
          class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-uppercase sc-mr-10"
        >
          View user survey
        </router-link>
      </div>
    </div>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>
              <input v-if="showCheckAll" v-model="checkAll" type="checkbox" name="check-all" />
            </th>
            <th>Registration Date</th>
            <th>User ID</th>
            <TableSort :field="sort.userName" @sort="onSort" />
            <TableSort :field="sort.firstName" @sort="onSort" />
            <TableSort :field="sort.lastName" @sort="onSort" />
            <TableSort :field="sort.email" @sort="onSort" />
            <th>Win Count</th>
            <th>Missions</th>
            <th>User Survey</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(subscriber && subscriber.length)" :cols="10" />

          <TableRow
            v-for="item in subscriber"
            :key="item._id"
            v-model="checked"
            :item="item"
            :available-quota="available_quota"
            @set-winner="onSetWinner"
          />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />

    <vuestic-modal
      ref="modal-confirm"
      cancel-class="btn btn-outline"
      ok-class="btn btn-danger"
      ok-text="YES"
      :ok-disabled="is_from_csv ? !payload.users.length : false"
      :cancel-disabled="is_from_csv ? !payload.users.length : false"
      @ok="onOk"
      @cancel="onCancel"
    >
      <template #title>Confirm winners</template>
      <ul>
        <li v-if="is_from_csv" class="csv-form">
          <h5>Upload CSV:</h5>
          <input id="file" ref="file" type="file" @change="onHandleCsv" />
        </li>
        <li v-for="(item, index) in payload.users" :key="item.user_id">
          <a href="javascript:">
            <span class="number">{{ index + 1 }}.</span> {{ item.name }}
            <span class="email" v-text="item.email"></span>
          </a>
        </li>
      </ul>
    </vuestic-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Axios from 'axios';
import VueJsonToCsv from 'vue-json-to-csv';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/Freebies/users/partial/TableRow';
import paginate from 'mixins/paginate';
import { get } from 'lodash';

const Config = require('../../../../config/default.env');

export default {
  name: 'user-list',

  components: {
    VueJsonToCsv,
    TableSort,
    TableRow,
  },

  mixins: [paginate],

  props: {
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      subscriber: [],
      search: '',
      status: '',
      start_date: '',
      end_date: '',
      checked: [],
      payload: {
        users: [],
      },
      available_quota: 0,
      //
      loading: false,
      is_from_csv: false,
      params: {},
      sort: {
        userName: {
          text: 'Username',
          key: 'user_name',
        },
        firstName: {
          text: 'First Name',
          key: 'first_name',
        },
        lastName: {
          text: 'Last Name',
          key: 'last_name',
        },
        email: {
          text: 'Email Address',
          key: 'email',
        },
      },
      exportDataJson: [],
      options: {
        filters: [
          { value: 'joined', text: 'Joined' },
          { value: 'waiting_for_winner_announcement', text: 'Set Winner' },
          { value: 'won', text: 'Won' },
          { value: 'lose', text: 'Lose' },
          { value: 'ordered-by-admin', text: 'Ordered By Admin' },
          // { value: 'product_accepted_by_user', text: 'Product Accepted By User' }, // SOC-61184
          { value: 'delivered', text: 'Delivered' },
          { value: 'waiting-review', text: 'Waiting Review' },
          { value: 'reviewed', text: 'Reviewed' },
        ],
      },
    };
  },

  computed: {
    ...mapState('freebies', ['$in']),

    initParams() {
      const { sort } = this.$route.query;

      return {
        // filter: {},
        sort: sort || '-updated_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },

    waitingWinnerCount() {
      return this.available_quota
        ? this.subscriber.filter(({ current_state }) => current_state == 'waiting_for_winner_announcement').length
        : 0;
    },

    checkAll: {
      get() {
        return this.checked.length ? this.checked.length == this.waitingWinnerCount : false;
      },
      set(value) {
        if (value) {
          this.checked = []; // reset

          this.subscriber.forEach(({ current_state, user: { id: user_id, user_name, name, email } }) => {
            if (current_state == 'waiting_for_winner_announcement') {
              this.checked.push({ user_id, user_name, name, email });
            } // check all
          });
        } else {
          this.checked = [];
        } // uncheck all
      },
    },
    //
    isChecked() {
      return this.checked.length > 0;
    },

    showCheckAll() {
      return this.waitingWinnerCount > 0;
    },

    to() {
      return {
        name: 'edit-freebies',
        params: {
          id: this.id,
        },
      };
    },

    exportData() {
      return this.exportDataJson.map((item) => ({
        username: item.user_name,
        // firstname: item.first_name,
        // lastname: item.last_name,
        email: item.email,
        // wincount: Object.keys(item).indexOf('win') > -1
        //     ? item.win
        //     : 0,
        state: item.current_state,
      }));
    },

    exportLabels() {
      return {
        username: { title: 'Username' },
        // 'firstname': {title: 'First Name'},
        // 'lastname': {title: 'Last Name'},
        email: { title: 'Email' },
        // 'wincount': {title: 'Wins Count'},
        state: { title: 'State' },
      };
    },
  },

  watch: {
    $route: 'init',
  },

  created() {
    this.getExportData();
    this.init();
  },

  methods: {
    formatDate(value, event) {
      return moment(value).format('YYYY-MM');
    },
    ...mapActions('freebies', ['getActions', 'getFreebies', 'getSubscriber', 'bulkWinners']),

    searchQuery(e) {
      if (e.keyCode === 13) {
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${this.id}/subscriber`, {
          params: {
            filter: {
              $or: [
                { user_name: { $regex: this.search, $options: 'i' } },
                { email: { $regex: this.search, $options: 'i' } },
              ],
            },
            skip: 0,
            limit: 10,
            sort: this.sortingParam,
          },
        })
          .then((response) => {
            this.is_loading = false;
            if (response.status === 200) {
              this.subscriber = response.data.data.data;
              this.params = {
                filter: {
                  $or: [
                    { user_name: { $regex: this.search, $options: 'i' } },
                    { email: { $regex: this.search, $options: 'i' } },
                  ],
                },
                skip: 0,
                limit: 10,
                sort: this.sortingParam,
              };
              this.getExportData(this.params);
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    filterBystatus: function (status) {
      const new_filter = {
        ...(this.status ? { current_state: this.status } : false),
        ...(this.search
          ? {
              $or: [
                { user_name: { $regex: this.search, $options: 'i' } },
                { email: { $regex: this.search, $options: 'i' } },
              ],
            }
          : false),
        ...(this.start_date
          ? {
              user_registration_date: { $gte: this.start_date },
            }
          : false),
        ...(this.end_date
          ? {
              user_registration_date: { $lte: this.end_date },
            }
          : false),
      };
      if (this.start_date && this.end_date) {
        new_filter['$and'] = [
          { user_registration_date: { $gte: this.start_date } },
          { user_registration_date: { $lte: this.end_date } },
        ];
        delete new_filter.user_registration_date;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${this.id}/subscriber`, {
        params: {
          filter: new_filter,
          skip: 0,
          limit: 10,
          sort: this.sortingParam,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status === 200) {
            this.subscriber = response.data.data.data;
            this.params = {
              filter: new_filter,
              skip: 0,
              limit: 10,
              sort: this.sortingParam,
            };
            this.getExportData(this.params);
            this.$_updateCount(get(response.data.data, 'pagination.total', 0));
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    onOk() {
      this.bulkWinners({
        id: this.id,
        payload: this.payload,
      })
        .then(() => {
          this.checked = [];
          this.payload.users = [];
          this.is_from_csv = false;
          this.init();
        })
        .catch(console.log);
    },

    onCancel() {
      this.payload.users = [];
      this.is_from_csv = false;
    },

    // multiple updates
    onBulkWinners() {
      this.is_from_csv = false;
      this.payload.users = this.checked;
      this.$refs['modal-confirm'].open();
    },

    // update from csv
    onBulkWinnersCsv() {
      this.is_from_csv = true;
      this.$refs['modal-confirm'].open();
    },

    onHandleCsv(e) {
      const file = this.$refs.file.files[0];
      const context = this;
      const list_users = [];

      window.Papa.parse(file, {
        complete: function (results) {
          results.data.forEach((result, idx) => {
            if (idx > 0 && result[0]) {
              const [user_id, user_name, name, email] = result;

              if (result.length > 1) {
                const output = {
                  user_id,
                  user_name,
                  name,
                  email,
                };
                list_users.push(output);
              }
            }
          });

          if (list_users.length) {
            context.payload.users = list_users;
          } else {
            context.$toasted.global.error('CSV file empty');
          }
        },
        error(err) {
          console.log(err);
          context.$toasted.global.show('Failed upload CSV');
        },
      });
    },

    // single update
    onSetWinner(payload) {
      this.is_from_csv = false;
      this.payload.users = [payload];
      this.$refs['modal-confirm'].open();
    },

    onSort(payload) {
      this.$data.$_recount = false;

      this.$router.replace(
        {
          query: {
            ...this.$route.query,
            sort: payload,
          },
        },
        () => {}
      );
    },

    getExportData(params) {
      this.$Progress.start();
      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${this.id}/export`, {
        params: params,
      })
        .then((data) => {
          this.is_loading = false;
          this.exportDataJson = data.data.data;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    async init() {
      this.loading = true;

      await this.getActions({
        payload: {
          filter: { name: this.$in },
          limit: this.$in.length,
        },
      }).then((data) => this.$store.commit('freebies/setState', ['actions', data]));

      this.getFreebies({ id: this.id })
        .then(({ available_quota }) => {
          this.available_quota = available_quota;

          return this.getSubscriber({ id: this.id, payload: this.initParams });
        })

        .then((data) => {
          this.subscriber = data.data;
          this.$data.$_count = data.pagination.total;
          this.$data.$_lastPage = data.pagination.last_page;

          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/user-list';
</style>
