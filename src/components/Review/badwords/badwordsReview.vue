<template src="./badwordsReview.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'badwords-review',
  components: {},

  data() {
    return {
      data: [],
      is_loading: true,

      filter: {
        name: '',
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
    this.getCount();
  },

  methods: {
    getCount: function (filter, filtered) {
      if (!filter) {
        filter = this.filter;
      }

      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words/count', {
        params: {
          filter: this.criteria,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }

            this.pagination.currentTotalRecord = count;
            this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
          }
        })
        .catch((err) => {
          this.$Progress.finish();
          throw err;
        });
    },

    fetchData: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      this.is_loading = true;
      this.data = [];

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words', {
        params: {
          filter: this.criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: '-created_at',
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;

            if (response.data.data.length < this.pagination.limit) {
              this.pagination.showNextPage = false;
            } else {
              this.pagination.showNextPage = true;
            }
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
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
