<template>
  <div>
    <router-link :to="to" class="sc-btn sc-btn-primary sc-btn-md sc-btn-rounded">
      <span class="fa fa-angle-left"></span> Back
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <div class="sc-filter">
      <div class="sc-filter-item sc-filter-button">
        <vue-json-to-csv :json-data="exportData" :labels="exportLabels" csv-title="Subscriber">
          <button
            class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-uppercase sc-mt-10"
            @click="getExportData()"
          >
            Export data
          </button>
        </vue-json-to-csv>
      </div>
    </div>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>
              Question 1
              <button
                v-tooltip.top-center="{
                  content: 'How satisfied are you with the product curation?',
                  placement: 'top',
                  trigger: 'hover',
                }"
                class="is-tooltip-danger"
              >
                <i class="fa fa-info-circle"></i>
              </button>
            </th>
            <th>
              Question 2
              <button
                v-tooltip.top-center="{
                  content: 'How interactive are the missions for you?',
                  placement: 'top',
                  trigger: 'hover',
                }"
                class="is-tooltip-danger"
              >
                <i class="fa fa-info-circle"></i>
              </button>
            </th>
            <th>
              Question 3
              <button
                v-tooltip.top-center="{
                  content: 'How would you rate the overall quality?',
                  placement: 'top',
                  trigger: 'hover',
                }"
                class="is-tooltip-danger"
              >
                <i class="fa fa-info-circle"></i>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(subscriber && subscriber.length)" :cols="10" />

          <TableRow v-for="item in subscriber" :key="item._id" :item="item" />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Axios from 'axios';
import VueJsonToCsv from 'vue-json-to-csv';
import TableRow from 'components/Freebies/users/partial/TableRowSurvey';
import paginate from 'mixins/paginate';
import Vue from 'vue';
import VTooltip from 'v-tooltip';

Vue.use(VTooltip);

const Config = require('../../../../config/default.env');

export default {
  name: 'user-list',

  components: {
    VueJsonToCsv,
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
      checked: [],
      payload: {
        users: [],
      },
      available_quota: 0,
      //
      loading: false,
      is_from_csv: false,
      params: {},
      exportDataJson: [],
    };
  },

  computed: {
    ...mapState('freebies', ['$in']),

    initParams() {
      const { sort } = this.$route.query;

      return {
        filter: { 'survey_answers.0': { $exists: true } },
        sort: sort || '-updated_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },

    to() {
      return {
        name: 'freebies-participant',
        params: {
          id: this.id,
        },
      };
    },

    exportData() {
      return this.exportDataJson.map((item) => ({
        username: item.user_name,
        email: item.email,
        question_1: item.question_1.answer,
        question_2: item.question_2.answer,
        question_3: item.question_3.answer,
        // state: item.current_state
      }));
    },

    exportLabels() {
      return {
        username: { title: 'Username' },
        email: { title: 'Email' },
        question_1: { title: 'Survey Answer 1' },
        question_2: { title: 'Survey Answer 2' },
        question_3: { title: 'Survey Answer 3' },
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
    ...mapActions('freebies', ['getFreebies', 'getSubscriber']),

    getExportData(params) {
      this.$Progress.start();
      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${this.id}/export`, {
        params: params,
      })
        .then((data) => {
          this.is_loading = false;
          const res = data.data.data.map((obj) => {
            obj.question_1 = '';
            obj.question_2 = '';
            obj.question_3 = '';
            if (obj.survey_answers && obj.survey_answers.length) {
              obj.survey_answers.map((child, key) => {
                obj[`question_${key + 1}`] = child;
                return child;
              });
            }
            return obj;
          });
          this.exportDataJson = res;
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    async init() {
      this.loading = true;

      this.getFreebies({ id: this.id })
        .then(({ available_quota }) => {
          this.available_quota = available_quota;

          return this.getSubscriber({ id: this.id, payload: this.initParams });
        })

        .then((data) => {
          const res = data.data.map((obj) => {
            obj.question_1 = '';
            obj.question_2 = '';
            obj.question_3 = '';
            if (obj.survey_answers && obj.survey_answers.length) {
              obj.survey_answers.map((child, key) => {
                obj[`question_${key + 1}`] = child;
                return child;
              });
            }
            return obj;
          });

          this.subscriber = res;
          this.$data.$_count = data.pagination.total;
          this.$data.$_lastPage = data.pagination.last_page;

          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
@import 'scss/user-list';
</style>
