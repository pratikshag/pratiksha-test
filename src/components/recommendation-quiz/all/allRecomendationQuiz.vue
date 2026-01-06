<template src="./allRecomendationQuiz.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'recommendation-quiz-all',
  components: {},

  data() {
    return {
      data: [],

      is_loading: true,

      filter: {
        question: '',
      },
      criteria: {},

      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
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
    '$route.query': function () {
      this.extractFilters();
    },
  },

  mounted: function () {
    this.extractFilters();
    this.fetchData();
    this.getCount();
  },

  methods: {
    extractFilters() {
      const params = this.$route.query;
      console.log(`route params: `, params);

      if (params.page) {
        this.pagination.skip = Math.max((params.page - 1) * this.pagination.limit, 0);
        this.pagination.currentPage = Math.max(params.page, 1);
      } else {
        this.pagination.skip = 0;
        this.pagination.currentPage = 1;
      }

      if (params.sort) {
        this.sortPosts = params.sort;
      } else {
        this.sortPosts = '-created_at';
      }

      if (params.question) {
        this.filter.question = params.question;
        this.criteria.question = { $regex: params.question, $options: 'i' };
      } else if (this.criteria.question) {
        delete this.criteria.question;
      }

      if (params.status) {
        this.criteria.status = params.status;
      } else if (params.status) {
        delete this.criteria.status;
      }

      this.fetchData(this.criteria);
      this.getCount(this.criteria, true);
    },

    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }

      console.log(filter);
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/recommendation/quiz/count', {
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

      console.log(filter);

      this.is_loading = true;
      this.data = [];
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/recommendation/quiz', {
        params: {
          filter: this.criteria,
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

    gotoPage(page) {
      this.pagination.currentPage = page;
    },

    searchQuery(e) {
      if (e.keyCode === 13) {
        console.log('searchQuery');
        this.$router.push({
          query: {
            ...this.$route.query,
            page: 1,
            question: this.filter.question,
          },
        });
      }
    },

    trash(id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/recommendation/quiz/${id}`).then((response) => {
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
