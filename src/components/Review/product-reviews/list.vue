<template src="./list.html"></template>
<script>
import Axios from 'axios';
import sortField from '../../ui/global/sortField';
import ModalDetailReview from './modal-detail-review';
import ModalRelocate from './modal-relocate';
import ModalConfirmation from './modal-confirmation';
import Multiselect from 'vue-multiselect';
const Config = require('../../../../config/default.env');
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';
// let cancelSearchResource;

export default {
  name: 'list',
  components: {
    sortField,
    Multiselect,
    ModalDetailReview,
    ModalRelocate,
    ModalConfirmation,
    DisplayPerPage,
    Pagination,
  },

  data() {
    return {
      data: [],
      productDetail: null,
      isMaxPinnedReview: '',
      is_loading: true,
      filter: {
        date_begin: '',
        date_end: '',
        username: '',
        acquisition_source: '',
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
        product_id: this.$route.params.id,
        deleted_at: null,
        object_type: 'add-review',
        getPinned: true,
      },
      all: 0,

      sortParam: '-created_at',
      SOCO_WEB_URL: Config.default.SOCO_WEB_URL,
    };
  },

  computed: {
    showModalDetailReview() {
      return this.$store.state.modal.isModalShow.modalDetailReview;
    },
    showModalRelocate() {
      return this.$store.state.modal.isModalShow.modalRelocate;
    },
    showModalConfirmation() {
      return this.$store.state.modal.isModalShow.modalConfirmation;
    },
  },

  watch: {
    'filter.date_end': function () {
      if (this.filter.date_begin && new Date(this.filter.date_end) < new Date(this.filter.date_begin)) {
        this.filter.date_end = this.filter.date_begin;
      }
    },
    'filter.date_begin': function () {
      if (this.filter.date_end && new Date(this.filter.date_begin) > new Date(this.filter.date_end)) {
        this.filter.date_begin = this.filter.date_end;
      }
    },
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
    this.getProduct();
    this.fetchData();
    this.getCount();
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
    getProduct() {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/products', {
        params: {
          filter: {
            id: this.$route.params.id,
          },
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data.length > 0) {
            this.productDetail = response.data.data[0];
          }
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
    },
    getCount: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/count', {
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

    fetchData: function (filter, setPinnedReview = true) {
      if (!filter) {
        filter = this.filter;
      }
      this.is_loading = true;
      this.data = [];

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds', {
        params: {
          filter: this.criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: `-is_pinned,${this.sortParam}`,
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

          if (setPinnedReview && !this.isMaxPinnedReview) {
            this.isMaxPinnedReview = this.data.filter((item) => {
              return item.is_pinned;
            }).length;
          }
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },

    trash: function (id) {
      const self = this;
      self.$dialog
        .confirm('Are you sure want to delete this newsfeed?')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${id}/reports`).then((response) => {
            self.is_loading = true;
            self.isMaxPinnedReview = '';
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
            }
          });
        })
        .catch(function () {
          // console.log('Clicked on cancel');
        });
    },

    updateReview(id, current_pinned) {
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/reviews/${id}`, {
        is_pinned: current_pinned ? false : true,
      });
    },

    pinned(id, current_pinned, review) {
      if (this.isMaxPinnedReview > 2 && !current_pinned) {
        return false;
      }
      this.$dialog
        .confirm(`Are you sure want to ${current_pinned ? 'unpinned' : 'pinned'} this newsfeed?`)
        .then((dialog) => {
          this.is_loading = true;
          return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${id}`, {
            is_pinned: current_pinned ? false : true,
          }).then((response) => {
            this.is_loading = true;
            current_pinned ? this.isMaxPinnedReview-- : this.isMaxPinnedReview++;
            if (response.status == 200) {
              this.fetchData(null, false);
              this.getCount();
            }
            if (review && review._id) {
              this.updateReview(review._id, current_pinned);
            }
          });
        })
        .catch((err) => {
          // console.log('Clicked on cancel');
          // throw err;
        });
    },

    undo: function (id) {
      const self = this;
      self.$dialog
        .confirm('Are you sure want to undo this newsfeed?')
        .then(function (dialog) {
          self.is_loading = true;
          return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${id}`, {
            delete_request: null,
            deleted_reason: null,
          }).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
            }
          });
        })
        .catch(function () {
          // console.log('Clicked on cancel');
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

    showModalDetail(newsfeed) {
      this.$store.commit('setReviewData', newsfeed);
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalDetailReview' });
    },
    filterData() {
      this.criteria = {
        product_id: this.$route.params.id,
        deleted_at: null,
        getPinned: true,
        object_type: 'add-review',
      };
      const criteria_date = {};
      if (this.filter.username !== '') {
        this.criteria.username = this.filter.username;
      }
      if (this.filter.acquisition_source !== '') {
        this.criteria.acquisition_source = this.filter.acquisition_source;
      }
      if (this.filter.date_begin) {
        criteria_date['$gte'] = this.filter.date_begin;
      }
      if (this.filter.date_end) {
        criteria_date['$lte'] = this.filter.date_end;
      }
      if (Object.keys(criteria_date).length > 0) {
        this.criteria.created_at = criteria_date;
      }
      if (this.pagination.currentPage !== 1) {
        this.pagination.currentPage = 1;
        this.getCount();
      } else {
        this.fetchData();
        this.getCount();
      }
    },
    reset() {
      this.filter.date_begin = '';
      this.filter.date_end = '';
      this.filter.username = '';
      this.filter.acquisition_source = '';
      this.filterData();
    },
  },
};
</script>

<style>
.wrap-text {
  word-wrap: break-word;
  max-width: 300px;
}
.btn-pinned {
  font-size: 16px !important;
  margin-left: 4px;
  cursor: pointer;
  padding: 3px;
  color: #999;
}
.btn-pinned.active {
  color: #ce5880;
}
.sc-table-overflow {
  overflow-x: auto;
}
</style>
