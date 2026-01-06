<template src="./allContents.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'content-all',
  components: {},

  data() {
    return {
      data: [],
      is_loading: true,

      filter: {
        _id: this.$route.params.id,
      },

      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },

      criteria: {
        filter: this.filter,
      },
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
  },
  methods: {
    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/levels/count', {
        params: {
          filter: this.filter,
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/levels', {
        params: {
          filter: this.filter,
          fields: 'benefits,name',
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data[0];
            let count = parseInt(this.data.benefits.length);
            if (isNaN(count)) {
              count = 0;
            }
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

    trash: function (id, title) {
      const self = this;
      self.$dialog
        .confirm(`Do you sure want to delete ${title}`)
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/benefits/' + id).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
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
