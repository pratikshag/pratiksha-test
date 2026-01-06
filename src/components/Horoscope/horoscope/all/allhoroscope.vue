<template src="./allhoroscope.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import sortField from '../../../ui/global/sortField';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'horoscope-all',
  components: {
    sortField,
    DisplayPerPage,
    Pagination,
  },
  data() {
    return {
      data: [],
      dataZodiac: [],
      is_loading: true,
      date_today: '',

      filter: {
        zodiac: '',
        status: '',
        date_begin: '',
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
      all: 0,

      criteria: {},
      sortParam: '-created_at',
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
    'filter.zodiac': function () {
      this.filterData();
    },
    'filter.status': function () {
      this.filterData();
    },
  },

  mounted: function () {
    this.fetchDataZodiac();
    this.fetchData();
    this.getCount();

    this.date_today = this.dateFormat_Ymd(null, '/');
  },

  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.pagination.skip / this.pagination.limit) + 1;
      this.loadInitialData(this.pagination.skip);
    },
    display(newLimit) {
      this.is_loading = true;
      this.pagination.limit = newLimit || 10;
      this.$nextTick(() => {
        this.loadInitialData().then(() => {
          this.is_loading = false;
        });
      });
    },
    fetchDataZodiac: function () {
      this.dataZodiac = [];

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscopes', {
        params: { limit: 50 },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data.length > 0) {
            this.dataZodiac = response.data.data;
          }
        })
        .catch((err) => {
          throw err;
        });
    },

    getCount: function (filter, filtered) {
      if (!filter) {
        filter = this.filter;
      }

      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscope-posts/count', {
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscope-posts', {
        params: {
          filter: this.criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortParam,
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
          throw err;
        });
    },

    filterData() {
      const criteria_date = {};
      delete this.criteria['horoscope.name'];
      delete this.criteria.status;

      switch (this.filter.status) {
        case 'draft':
          this.criteria.status = false;
          break;

        case 'scheduled':
          const date_begin = this.dateFormat_Ymd(null, '-');
          this.filter.date_begin = date_begin;
          break;

        case 'published':
          const date_end = this.dateFormat_Ymd(null, '-');
          this.criteria.status = true;
          if (!this.filter.date_end) {
            this.filter.date_end = date_end;
          }
          break;
      }

      if (this.filter.date_begin) {
        criteria_date['$gte'] = this.filter.date_begin;
      }
      if (this.filter.date_end) {
        criteria_date['$lte'] = this.filter.date_end;
      }
      if (Object.keys(criteria_date).length > 0) {
        this.criteria.publish_at = criteria_date;
      } else if (this.criteria.publish_at) {
        delete this.criteria.publish_at;
      }
      if (this.filter.zodiac) {
        this.criteria['horoscope.name'] = this.filter.zodiac;
      }

      this.pagination.skip = 0;
      this.pagination.currentPage = 1;
      this.fetchData();
      this.getCount();
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },

    sort(sort) {
      this.sortParam = sort;

      if (this.pagination.currentPage == 1) {
        this.pagination.skip = 0;
        this.pagination.currentPage = 1;
        this.fetchData();
      } else {
        this.pagination.currentPage = 1;
      }
    },
  },
};
</script>
