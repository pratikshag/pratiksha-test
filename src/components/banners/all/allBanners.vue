<template src="./allBanners.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'banner-all',
  components: { DisplayPerPage, Pagination },

  data() {
    return {
      data: [],
      is_loading: true,

      filter: {
        name: '',
        created_from: '',
        mobile_locations: '',
        location: '',
        created_date_begin: '',
        created_date_end: '',
        updated_date_begin: '',
        updated_date_end: '',
        created_by: '',
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
    };
  },
  computed: {
    totalPage() {
      return Math.ceil(this.pagination.totalPage / this.pagination.limit);
    },
  },
  watch: {
    'filter.locale': function () {
      this.searchQuery(null, true);
    },
  },

  created: function () {
    this.fetchData();
    this.getCount();
  },
  methods: {
    async loadInitialData() {
      this.is_loading = true;
      return Promise.all([this.fetchData(), this.getCount()]).catch((error) => {
        console.error('Error loading initial data:', error);
        this.is_loading = false;
      });
    },
    setSkip(data) {
      this.pagination.skip = Number(data || 0);
      this.pagination.currentPage = Math.floor(this.pagination.skip / this.pagination.limit) + 1;
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
    toggleStatus(banner) {
      banner.status = banner.status === 'active' ? 'inactive' : 'active';

      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/banner/' + banner._id, banner)
        .then((response) => {
          if (response.status === 200) {
            this.fetchData();
          }
        })
        .catch((err) => {
          throw err;
        });
    },
    dateFormat: (payload) => moment(payload).tz('Asia/Jakarta').format('YYYY-MM-DD hh:mm:ss'),
    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banners/count', {
        params: {
          filter: this.setFilter(),
        },
      })
        .then((response) => {
          if (response.status == 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }

            this.pagination.currentTotalRecord = count;
            this.pagination.totalPage = count;
          }
        })
        .catch((err) => {
          this.$Progress.finish();
          throw err;
        });
    },

    setFilter() {
      const result = {};
      const filter = JSON.parse(JSON.stringify(this.filter));
      const obj = Object.keys(filter);
      const created_date = {};
      const updated_date = {};
      for (let i = 0; i < obj.length; i++) {
        const key = obj[i];
        if (filter[key]) {
          if (key == 'name') {
            result[key] = { $regex: filter[key], $options: 'i' };
          } else if (key == 'created_date_begin') {
            created_date['$gte'] = filter[key];
          } else if (key == 'created_date_end') {
            created_date['$lte'] = filter[key];
          } else if (key == 'updated_date_begin') {
            updated_date['$gte'] = filter[key];
          } else if (key == 'updated_date_end') {
            updated_date['$lte'] = filter[key];
          } else if (key == 'created_by') {
            result[`${key}.email`] = { $regex: filter[key], $options: 'i' };
          } else {
            result[key] = filter[key];
          }
        }
      }
      if (Object.keys(created_date).length > 0) {
        result['created_at'] = created_date;
      }
      if (Object.keys(updated_date).length > 0) {
        result['updated_at'] = updated_date;
      }
      return result;
    },

    fetchData: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      this.is_loading = true;
      this.data = [];

      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banners', {
        params: {
          filter: this.setFilter(),
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
            this.getCount();
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

      if (this.filter.created_from) {
        this.criteria.created_from = this.filter.created_from;
      } else {
        delete this.criteria.created_from;
      }

      this.pagination.skip = 0;
      this.pagination.currentPage = 1;
      this.fetchData();
      this.getCount();
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },

    searchQuery(e, forceSearch) {
      if ((e && e.keyCode === 13) || forceSearch) {
        this.filterData();
      }
    },

    trash: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/banner/${id}`).then((response) => {
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
  },
};
</script>
<style lang="scss" scoped>
.w-20 {
  width: 20%;
}
.sc-filter {
  .sc-filter-item {
    .sc-filter-input {
      max-width: 250px;
    }
  }
}
</style>
