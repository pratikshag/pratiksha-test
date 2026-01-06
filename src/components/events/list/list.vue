<template src="./list.html"></template>
<script>
import Axios from 'axios';
import VueJsonToCsv from 'vue-json-to-csv';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
const ApiUrl = Config.default.MS_SOCO_ADMIN_API_URL + `/events/`;
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';
export default {
  name: 'event-list',
  components: {
    sortField,
    VueJsonToCsv,
    DisplayPerPage,
    Pagination,
  },
  data() {
    return {
      list: [],
      event_type: ['free', 'paid', 'exclusive'],
      event_category: ['beauty_class', 'atrium', 'soiree', 'other'],
      event_status: ['draft', 'pending', 'publish', 'deleted'],
      event_classification: ['online', 'offline'],
      filter: {
        status: '',
        classification: '',
        title: '',
        category: '',
        type: '',
      },
      limit: 10,
      skip: 0,
      numPages: 0,
      page: 1,
      all: 0,
      editorial: 0,
      admin: 0,
      author: 0,
      community: 0,
      noedit: true,
      role: '',
      show: true,
      totalPage: 1,
      currentPage: 1,
      currentTotalRecord: 0,
      is_loading: false,
      sortParam: '-created_at',
    };
  },
  watch: {
    currentPage: {
      handler(newVal) {
        if (newVal) {
          this.pagination(newVal);
        }
      },
      immediate: true,
    },
  },
  created: function () {
    this.getList();
    this.getCount();
  },
  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.skip / this.limit) + 1;
      this.loadInitialData(this.skip);
    },
    display(newLimit) {
      this.is_loading = true;
      this.limit = isNaN(Number(newLimit)) ? 10 : Number(newLimit);
      this.$nextTick(() => {
        this.loadInitialData().then(() => {
          this.is_loading = false;
        });
      });
    },
    resetAll() {
      this.filter = {
        status: '',
        classification: '',
        title: '',
        category: '',
        type: '',
        _id: '',
      };
      this.filterData();
    },
    getList: function () {
      this.is_loading = true;
      Axios.get(ApiUrl, {
        params: {
          limit: this.limit,
          skip: this.skip,
          sort: this.sortParam,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.list = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },

    getCount: function (params = {}) {
      Axios.get(ApiUrl + 'count', {
        params: params,
      }).then((response) => {
        this.is_loading = false;
        if (response.status == 200) {
          let count = parseInt(response.data.data);
          if (isNaN(count)) {
            count = 0;
          }
          this.currentTotalRecord = count;
          this.totalPage = Math.ceil(count / this.limit);
        }
      });
    },

    searchQuery: function (params = {}) {
      this.$Progress.start();
      this.is_loading = true;

      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/events', {
        params: {
          sort: this.sortParam,
          filter: params,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.list = response.data.data;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },
    getFilters() {
      const filter = {};
      for (const property in this.filter) {
        if (this.filter.hasOwnProperty(property) && this.filter[property].length) {
          filter[property] = this.filter[property];
        }
      }
      return filter;
    },
    filterData: function () {
      const params = this.getFilters();
      this.searchQuery(params);
      this.getCount({ filter: params });
    },
    pagination: function (page) {
      this.$Progress.start();
      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      const filter = this.getFilters();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/events', {
        params: {
          filter: filter,
          sort: this.sortParam,
          skip: skip,
          limit: 10,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.list = response.data.data;
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    gotoPage(page) {
      this.currentPage = page;
    },
    remove(id, key) {
      Axios.put(ApiUrl + id, { is_deleted: true })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$toasted.global.success('Delete status changed');
            this.list[key].is_deleted = true;
          }
        })
        .catch((err) => {
          self.$Progress.fail();
          this.$toasted.global.error(err);
          throw err;
        });
    },

    sort(sort) {
      this.sortParam = sort;
      this.pagination(1);
    },
  },
};
</script>
