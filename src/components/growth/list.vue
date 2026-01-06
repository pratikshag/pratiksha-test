<template src="./list.html"></template>
<script>
import Axios from 'axios';
import Moment from 'moment';
const Config = require('../../../config/default.env');

export default {
  name: 'growth-list',
  components: {},

  data() {
    return {
      data: [],
      is_loading: true,

      filter: {
        date_start: '',
        date_end: '',
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

  mounted: function () {},

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
      this.is_loading = true;
      this.data = 'Data is loading';
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/jobs/data-growth', {
        date_start: Moment(this.filter.date_start).format('YYYY-MM-DD'),
        date_end: Moment(this.filter.date_end).format('YYYY-MM-DD'),
      })
        .then((response) => {
          this.is_loading = false;
          this.$toasted.global.show(
            'CSV has been generate, please contact pratiksha.goyal@sociolla.com for the results.'
          );

          if (response.status == 200) {
            //     results = response.data.data
            //     let csvContent = "data:text/csv;charset=utf-8,";
            //     results.forEach(item => {
            //        csvContent += item.join(',')+'\n'
            //     })
            //     const dataCsv = encodeURI(csvContent);
            //     const link = document.createElement("a");
            //     link.setAttribute("href", dataCsv);
            //     link.setAttribute("download", "export.csv");
            //     link.click();
            this.data = 'CSV has been generate, please contact pratiksha.goyal@sociolla.com for the results.';
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    formatDate(value, event) {
      return moment(value).format('YYYY-MM-DD');
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
