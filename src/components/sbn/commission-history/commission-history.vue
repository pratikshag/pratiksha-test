<template src="./commission-history.html"></template>
<script>
import Axios from 'axios';
import sortField from '../../ui/global/sortField';
import Modal from '../../../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
const Config = require('../../../../config/default.env');
export default {
  name: 'commission-history',
  components: { sortField, Modal },
  data() {
    return {
      totalCount: {
        pending: 0,
        rejected: 0,
        approved: 0,
      },
      selectedYear: new Date().getFullYear(),
      currentYear: new Date().getFullYear(),
      startDate: new Date(new Date().getFullYear(), 0, 1, 0, 0, 0),
      endDate: new Date(new Date().getFullYear(), 5, 30, 11, 59, 59),
      startYear: 2019,
      data: [],
      status: 1,
      is_loading: true,
      filter: {
        status: '',
        filter_by: '',
        username: '',
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
      criteria: {},
      sortParam: '-created_at',
      SOCO_WEB_URL: Config.default.SOCO_WEB_URL,
      userData: {},
      confirmationData: {},
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

  created() {
    this.filterData();
  },

  methods: {
    filterStatus(status) {
      this.status = status;
      if (status == 1) {
        this.startDate = new Date(this.selectedYear, 0, 1, 0, 0, 0);
        this.endDate = new Date(this.selectedYear, 5, 30, 11, 59, 59);
      } else {
        this.startDate = new Date(this.selectedYear, 6, 1, 0, 0, 0);
        this.endDate = new Date(this.selectedYear, 11, 31, 11, 59, 59);
      }
      this.filterData();
    },
    getFilters() {
      const criteria = { status: this.status, filter_by: 'sbn' };
      const criteria_date = {};
      if (this.filter.username) {
        if (this.filter.username.includes('@')) {
          criteria.email = this.filter.username.trim();
        } else {
          criteria.user_name = this.filter.username;
        }
      }
      if (this.filter.date_begin) {
        criteria.start_date = this.filter.date_begin;
      }
      if (this.filter.date_end) {
        criteria.end_date = this.filter.date_end;
      }
      if (Object.keys(criteria_date).length > 0) {
        criteria.created_at = criteria_date;
      }
      return criteria;
    },

    editUser(user) {
      this.userData = { ...user };
      this.$refs.edit_modal.open();
    },
    onChange() {
      this.filterStatus(this.status);
    },
    fetchData() {
      this.is_loading = true;
      this.data = [];
      this.criteria = this.getFilters();
      this.criteria.status = 'released';
      if (this.criteria.start_date === undefined) {
        this.criteria.start_date = this.startDate;
      }
      if (this.criteria.end_date === undefined) {
        this.criteria.end_date = this.endDate;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-transactions', {
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
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    fetchCount() {
      this.data = [];
      this.criteria = this.getFilters();
      this.criteria.status = 'released';
      if (this.criteria.start_date === undefined) {
        this.criteria.start_date = this.startDate;
      }
      if (this.criteria.end_date === undefined) {
        this.criteria.end_date = this.endDate;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-transactions/count', {
        params: {
          filter: this.criteria,
        },
      })
        .then((response) => {
          if (response.status == 200) {
            const count = response.data.data;
            this.pagination.currentTotalRecord = count;
            this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
            if (count < this.pagination.limit) {
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
    updateSbnUser(data) {
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-user/approve', data)
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.filterData();
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    filterData() {
      this.fetchData();
      this.fetchCount();
    },
    gotoPage(page) {
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

<style>
.wrap-text {
  word-wrap: break-word;
  max-width: 300px;
}
.info-container {
  padding: 10px;
  border-bottom: 1px solid #f6f6f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-container {
  background: #f6f6f6;
}
.sub-container {
  display: flex;
  align-self: flex-end;
  flex-direction: column;
}
</style>
