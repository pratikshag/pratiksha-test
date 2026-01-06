<template src="./listReported.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'reported-comment',
  components: { sortField, DisplayPerPage, Pagination },

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
      all: 0,

      criteria: {},
      sortParam: '-reported_date',
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

  created: function () {
    this.fetchData();
    this.getCount();
  },
  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.skip / this.limit) + 1;
      this.display(this.skip);
    },
    display(newSkip, newLimit) {
      this.is_loading = true;
      this.pagination.skip = newSkip || 0;
      this.paginationlimit = newLimit || 10;
      this.$nextTick(() => {
        this.fetchData().then(() => {
          this.is_loading = false;
        });
      });
    },
    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/comment/reported/count', {
        params: {
          filter: this.criteria,
        },
      })
        .then((response) => {
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/comment/reported', {
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
          console.log(err);
          throw err;
        });
    },

    filterData() {
      if (this.filter.name) {
        this.criteria = {
          'user.user_name': { $regex: this.filter.name, $options: 'i' },
        };
      } else {
        delete this.criteria;
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
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/comments/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    undo: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to undo comment')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/comment/report/undo/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
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
