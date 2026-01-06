<template src="./blocked-users.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';

export default {
  name: 'blocked-users',
  components: { sortField },
  data() {
    return {
      status: 'all',
      users: [],
      allUsers: '',
      email: '',
      user_name: '',
      id: '',
      name: '',
      limit: 10,
      skip: 0,
      numPages: 0,
      page: 1,
      all: 0,
      totalPage: 1,
      currentPage: 1,
      currentTotalRecord: 0,
      is_loading: false,
      sortParam: '-updated_at',
      filter: {},
    };
  },
  created: function () {
    this.getUsers();
    this.getCount();
  },
  methods: {
    resetAll() {
      this.filter = {};
      this.getUsers();
      this.getCount();
    },
    async validateFilter() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) {
        const firstError = this.errors.items[0];
        const errMsg = `Error in "${firstError.field}": ${firstError.msg}`;
        this.$toasted.global.error(errMsg);
        throw new Error(errMsg);
      }
    },
    getUsers: function () {
      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
        params: {
          filter: {
            password_failure_count: { $gte: 5 },
            account_locked: true,
          },
          fields: '_id email user_name name is_verified_phone password_failure_count',
          limit: this.limit,
          skip: this.skip,
          sort: this.sortParam,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.users = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },
    getCount: function (params = {}) {
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/count', {
        params: {
          filter: {
            password_failure_count: { $gte: 5 },
            account_locked: true,
          },
        },
      }).then((response) => {
        this.is_loading = false;
        if (response.status == 200) {
          let count = parseInt(response.data.data);
          if (isNaN(count)) {
            count = 0;
          }

          this.currentTotalRecord = count;
          this.totalPage = Math.ceil(count / this.limit);
          return count;
        }
      });
    },
    searchQuery: function (params = {}) {
      this.$Progress.start();
      this.is_loading = true;

      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
        params: {
          fields: '_id email user_name name is_verified_phone password_failure_count',
          sort: this.sortParam,
          filter: params,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.users = response.data.data;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },
    async filterData(callApi = true) {
      let filter = {
        $or: [],
        password_failure_count: { $gte: 5 },
        account_locked: true,
      };
      if (this.email) {
        filter['$or'].push({ email: this.email });
      }
      if (this.user_name) {
        filter['$or'].push({ user_name: this.user_name });
      }
      if (this.id) {
        filter['$or'].push({ _id: this.id });
      }
      if (this.name) {
        filter['$or'].push({ name: this.name });
      }
      filter = filter['$or'].length ? filter : { password_failure_count: { $gte: 5 }, account_locked: true };
      const params = filter;
      this.filter = filter;
      if (callApi) {
        await this.validateFilter();
        this.searchQuery(params);
        this.getCount({ filter: params });
      }
    },
    filterStatus(status) {
      this.user_name = '';
      this.name = '';
      this.email = '';
      this.status = status;
      this.id = '';
      this.filterData();
    },
    pagination: function (page) {
      this.$Progress.start();
      page = parseInt(page);
      const skip = this.limit * (page - 1);
      this.posts = {};
      this.filterData(false);
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
        params: {
          filter: this.filter,
          sort: this.sortParam,
          skip: skip,
          limit: 10,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.users = response.data.data;
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    changeToUnblock(status, userId, index) {
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/user/${userId}/status`, {
        status: status,
        password_failure_count: 0,
        account_locked: false,
      });
    },
    gotoPage(page) {
      this.pagination(page);
    },

    sort(sort) {
      this.sortParam = sort;
      this.pagination(1);
    },
  },
};
</script>
