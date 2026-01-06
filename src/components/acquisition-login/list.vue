<template src="./list.html"></template>
<script>
import Axios from 'axios';
import Moment from 'moment';
const Config = require('../../../config/default.env');

export default {
  name: 'acquisition-login-list',
  components: {},

  data() {
    return {
      data: [],
      header: [],
      bodyRow: [],
      is_loading: true,
      filter: {
        date_start: new Moment().subtract(2, 'M').format('YYYY-MM-DD'),
        date_end: new Moment().format('YYYY-MM-DD'),
      },

      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },

      criteria: {},
    };
  },

  watch: {
    'pagination.currentPage': function () {
      let page = this.pagination.currentPage;
      if (page > this.pagination.totalPage || page < 0) {
        return;
      }
      page = parseInt(page);
      if (isNaN(page)) {
        page = 1;
      }
      this.pagination.skip = this.pagination.limit * (page - 1);
      this.pagination.currentPage = page;
      this.fetchData();
    },
  },

  mounted: function () {
    this.fetchData();
  },

  methods: {
    getCount: function (filter, filtered) {
      if (!filter) {
        filter = this.filter;
      }
    },

    fetchData: function (filter) {
      let results;
      this.is_loading = true;
      this.data = 'Data is loading';
      this.bodyRow = [];
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/acquisition/login', {
        params: {
          date_start: this.filter.date_start,
          date_end: this.filter.date_end,
        },
      })
        .then((response) => {
          this.is_loading = false;

          if (response.status == 200) {
            results = response.data.data;
            this.data = '';
            this.header = results[0];
            results.shift();
            this.bodyRow = results;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    exportData() {
      let results;
      this.is_loading = true;
      this.data = 'Data is loading';
      this.bodyRow = [];
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/acquisition/login', {
        params: {
          date_start: this.filter.date_start,
          date_end: this.filter.date_end,
        },
      })
        .then((response) => {
          this.is_loading = false;

          if (response.status == 200) {
            results = response.data.data;
            this.data = '';
            this.header = results[0];
            results.shift();
            this.bodyRow = results;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    formatDate(value, event) {
      return moment(value).format('YYYY-MM');
    },
    filterData() {
      if (this.filter.name) {
        this.criteria.name = { $regex: this.filter.name, $options: 'i' };
      } else {
        delete this.criteria.name;
      }

      this.pagination.skip = 0;
      this.pagination.currentPage = 1;
      this.fetchData();
      this.getCount();
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },

    searchQuery(e) {
      if (e.keyCode === 13) {
        this.filterData();
      }
    },

    trash: function (id) {
      const self = this;
      this.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words/' + id).then((response) => {
            self.fetchData();
            self.getCount();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },
  },
};
</script>
