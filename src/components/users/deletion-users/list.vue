<template src="./list.html"></template>
<script>
import Axios from 'axios';
import Moment from 'moment';
const Config = require('../../../../config/default.env');

export default {
  name: 'account-deletion',
  components: {},

  data() {
    return {
      data: [],
      header: ['Date Deletion', 'Sociolla', 'Lilla', 'VN'],
      is_loading: true,
      filter: {
        date_start: new Moment().startOf('month').format('YYYY-MM-DD'),
        date_end: new Moment().endOf('month').format('YYYY-MM-DD'),
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
    fetchData: function () {
      this.is_loading = true;
      this.data = [];
      const promises = [
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/user-deletion-histories', {
          params: {
            filter: {
              created_at: {
                $gte: Moment(this.filter.date_start).startOf('day').toDate(),
                $lte: Moment(this.filter.date_end).endOf('day').toDate(),
              },
            },
            skip: this.pagination.skip,
            limit: this.pagination.limit,
          },
        }),
      ];

      if (this.pagination.skip == 0) {
        promises.push(
          Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/user-deletion-histories/count', {
            params: {
              filter: {
                created_at: {
                  $gte: Moment(this.filter.date_start).startOf('day').toDate(),
                  $lte: Moment(this.filter.date_end).endOf('day').toDate(),
                },
              },
              skip: this.pagination.skip,
              limit: this.pagination.limit,
            },
          })
        );
      } else {
        promises.push(null);
      }
      Promise.all(promises)
        .then(([response, count]) => {
          this.is_loading = false;
          if (count?.data?.data) {
            this.pagination.totalPage = Math.ceil(count.data.data / this.pagination.limit);
          }

          if (response.status == 200 && response?.data?.data?.length) {
            this.data = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    formatDate(value, isTable = false) {
      return moment(value).format(isTable ? 'DD MMM YYYY' : 'YYYY-MM');
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
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },
  },
};
</script>
