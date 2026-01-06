<template src="./all-rewards.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'rewards',
  components: { DisplayPerPage, Pagination },

  data() {
    return {
      data: [],
      is_loading: true,

      filter: {
        name: '',
      },
      all: 0,

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

  created: function () {
    this.fetchData();
    this.getCount();
  },
  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.pagination.skip / this.pagination.limit) + 1;
      this.loadInitialData(this.skip);
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
    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/mgm-rewards/count', {
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
            this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
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
      for (let i = 0; i < obj.length; i++) {
        const key = obj[i];
        if (filter[key]) {
          if (key == 'name') {
            result[key] = { $regex: filter[key], $options: 'i' };
          } else {
            result[key] = filter[key];
          }
        }
      }
      return result;
    },

    fetchData: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      this.is_loading = true;
      this.data = [];

      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/mgm-rewards', {
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
          Axios.delete(Config.default.MS_SOCO_PUBLIC_API_URL + `/mgm-rewards/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.$toasted.global.show('Sucessfully delete data.');
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
</style>
