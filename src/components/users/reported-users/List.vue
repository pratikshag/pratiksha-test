<template src="./List.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import { exportCsv } from '../../mixins/exportData';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'reported-users-list',
  components: { sortField, DisplayPerPage, Pagination },
  mixins: [exportCsv],
  data() {
    return {
      criteria: {
        deleted_at: { $exists: false },
      },
      criteriaStatus: {
        all: {
          deleted_at: { $exists: false },
        },
        more_than_5: {
          deleted_at: { $exists: false },
          count_total: { $gt: 5 },
        },
        less_than_5: {
          deleted_at: { $exists: false },
          count_total: { $lt: 5 },
        },
        is_deleted: {
          deleted_at: { $exists: true },
        },
      },
      filter: {
        email: '',
        user_name: '',
        id: '',
        status: '',
        date: {
          from: '',
          to: '',
        },
        total_count_from: '',
        total_count_to: '',
        status: '',
      },

      users: [],
      is_loading: false,
      sortParam: '-created_at',
      status: '',
      pagination: {
        skip: 0,
        limit: 5,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },
      all: 0,
      totalCount: {
        all: 0,
        more_than_5: 0,
        less_than_5: 0,
        suspended: 0,
        unsuspended: 0,
        deleted: 0,
      },
      is_loading_export_data: false,
    };
  },
  computed: {
    queryString() {
      return this.$route.query;
    },
  },
  watch: {
    queryString: function (oldVal, newVal) {
      this.extractFilters();
    },
  },
  created: function () {
    // this.getUsers();
    // this.getCount();
    // this.getAllWidgetCount();
    this.extractFilters();
    this.getAllWidgetCount();
  },
  methods: {
    async validateFilter() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) {
        const firstError = this.errors.items[0];
        const errMsg = `Error in "${firstError.field}": ${firstError.msg}`;
        this.$toasted.global.error(errMsg);
        throw new Error(errMsg);
      }
    },
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
    resetAll() {
      this.filter.email = '';
      this.filter.user_name = '';
      this.filter.id = '';
      this.filter.status = '';
      this.filter.date.from = '';
      this.filter.date.to = '';
      this.filter.total_count_from = '';
      this.filter.total_count_to = '';
      this.pagination.skip = 0;
      this.filterAction();
    },
    async getAllWidgetCount() {
      const self = this;

      // countAll
      self.getCount(self.criteriaStatus.all, 'countAll').then((count) => {
        self.totalCount.all = count;
      });

      // countMoreThan5
      self.getCount(self.criteriaStatus.more_than_5, 'countMoreThan5').then((count) => {
        self.totalCount.more_than_5 = count;
      });

      // countLessThan5
      self.getCount(self.criteriaStatus.less_than_5, 'countLessThan5').then((count) => {
        self.totalCount.less_than_5 = count;
      });

      // countWaitingApproval
      self.getCount(self.criteriaStatus.is_deleted, 'countDeleted').then((count) => {
        self.totalCount.deleted = count;
      });
    },
    reportCount(object) {
      let total = 0;
      for (const property in object) {
        total += object[property];
      }
      return total;
    },
    filterDate(date) {
      const filtered = new moment(date).tz('Asia/Jakarta').format('DD - MM - YYYY h:mm:ss');
      return filtered;
    },
    fetchData: function (criteria) {
      if (!criteria) {
        criteria = this.criteria;
      }
      this.is_loading = true;
      this.users = [];

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/report', {
        params: {
          filter: criteria,
          limit: this.pagination.limit,
          skip: this.pagination.skip,
          sort: this.sortField,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.users = response.data.data;
            if (response.data.data.length < this.pagination.limit) {
              this.pagination.showNextPage = false;
            } else {
              this.pagination.showNextPage = true;
            }
          }
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
    },
    async filterAction(pagination = false) {
      const query = this.queryString || {};
      if (this.filter.email) {
        query.email = this.filter.email;
      } else {
        delete query.email;
      }

      if (this.filter.user_name) {
        query.user_name = this.filter.user_name;
      } else {
        delete query.user_name;
      }
      if (this.filter.id) {
        query.id = this.filter.id;
      } else {
        delete query.id;
      }
      if (this.filter.total_count_from) {
        query.total_count_from = this.filter.total_count_from;
      } else {
        delete query.total_count_from;
      }

      if (this.filter.total_count_to) {
        query.total_count_to = this.filter.total_count_to;
      } else {
        delete query.total_count_to;
      }

      if (this.filter.date.from) {
        query.from = this.filter.date.from;
      } else {
        delete query.from;
      }

      if (this.filter.date.to) {
        query.to = this.filter.date.to;
      } else {
        delete query.to;
      }

      if (this.filter.status) {
        query.status = this.filter.status;
      } else {
        delete query.status;
      }

      if (pagination) {
        if (this.pagination.currentPage) {
          query.page = this.pagination.currentPage;
        } else {
          delete query.page;
        }
      } else {
        query.page = 1;
      }

      if (this.sortField) {
        query.sort = this.sortField;
      } else {
        delete query.sort;
      }

      if (this.filter.id) {
        query.id = this.filter.id;
      } else {
        delete query.id;
      }

      await this.validateFilter();
      this.$router.push({ query });

      // else {
      // force call extractFilters, because queryString in browser url can not update
      this.extractFilters();
      // }
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
      this.filterAction(true);
    },
    changeStatus(status, userId, index) {
      // alert("In Progress")
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/user/${userId}/status`, {
        status: status,
      })
        .then((response) => {
          if (response.status == 200) {
            this.$toasted.global.show('Succesfully suspend user');
            this.users[index].status = response.data.data.status;
            this.users[index].suspended_count = response.data.data.suspended_count;
          }
        })
        .catch((err) => {
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
    deleteUser: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/users/report/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              // self.getCount();
              self.extractFilters();
              self.getAllWidgetCount();
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },
    extractFilters() {
      const params = this.queryString;

      this.criteria = {
        deleted_at: { $exists: false },
      };
      this.filter.email = params.email;
      this.filter.user_name = params.user_name;
      this.filter.id = params.id;
      this.filter.status = params.status;
      this.sortField = '-updated_at';
      this.filter.total_count_from = params.total_count_from;
      this.filter.total_count_to = params.total_count_to;

      if (params.email) {
        this.criteria['user.email'] = params.email;
      }
      if (params.user_name) {
        this.criteria['user.user_name'] = params.user_name;
      }
      if (params.id) {
        this.criteria['user.id'] = params.id;
      }

      this.criteria.count_total = {};
      if (params.total_count_from) {
        this.criteria.count_total['$gte'] = params.total_count_from;
      }
      if (params.total_count_to) {
        this.criteria.count_total['$lte'] = params.total_count_to;
      }
      if (!params.total_count_from && !params.total_count_to) {
        delete this.criteria.count_total;
      }

      if (params.status) {
        this.criteria.status = params.status;
      }
      if (params.sort) {
        this.sortField = params.sort;
      }
      const criteria_date = {};
      if (params.from) {
        criteria_date['$gte'] = `${params.from} 00:00:00`;
        this.filter.date.from = params.from;
      } else {
        this.filter.date.from = null;
      }
      if (params.to) {
        criteria_date['$lte'] = `${params.to} 23:59:59`;
        this.filter.date.to = params.to;
      } else {
        this.filter.date.to = null;
      }
      if (params.page) {
        this.pagination.currentPage = params.page;
      }
      if (Object.keys(criteria_date).length > 0) {
        this.criteria.created_at = criteria_date;
      }

      if (this.criteriaStatus[params.status]) {
        this.criteria = {
          ...this.criteria,
          ...this.criteriaStatus[params.status],
        };
      } else {
        this.criteria = {
          ...this.criteria,
          ...this.criteriaStatus.all,
        };
      }

      this.calculatePage();
      this.fetchData(this.criteria);
      this.getCount(this.criteria, 'table');
    },
    filterStatus(status) {
      this.user_name = '';
      this.email = '';
      this.id = '';
      this.filterData();
    },
    calculatePage() {
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
    },

    sort(sort) {
      this.sortField = sort;
      this.filterAction();
    },

    exportDatatoCSV(user) {
      this.is_loading_export_data = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/report/${user.id}/histories`, {
        params: {
          limit: this.limitActivity,
          skip: this.skipActivity,
          sort: this.sortParam,
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data) {
            const mapedData = this.exportMapFields(response.data.data);
            const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
            this.exportCsv(mapedData, `[${today}] - Detail Report Suspend user ${user.name}`);
            this.is_loading_export_data = false;
          } else {
            this.is_loading_export_data = false;
          }
        })
        .catch((err) => {
          this.is_loading_export_data = false;
          console.log(err);
          throw err;
        });
    },

    exportMapFields(data) {
      return (data || []).map((el, index) => {
        const row = {
          no: index,
          User_Report: el.reporter.name,
          Type: el.type ? el.type : '',
          Reason: el.others ? el.others : '',
        };
        return row;
      });
    },

    getCount: function (criteria, section) {
      if (criteria == null) {
        criteria = this.criteria;
      }

      this.is_loading = true;

      const api_url = `${Config.default.MS_SOCO_ADMIN_API_URL}/users/report/count`;

      return Axios.get(api_url, {
        params: {
          filter: criteria,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }
            if (section == 'table') {
              this.pagination.currentTotalRecord = count;
              this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
              return count;
            } else {
              return count;
            }
          } else {
            return 0;
          }
        })
        .catch((err) => {
          this.$Progress.finish();
          throw err;
        });
    },

    loadInitialData() {
      this.extractFilters();
      this.getAllWidgetCount();
    },
  },
};
</script>
