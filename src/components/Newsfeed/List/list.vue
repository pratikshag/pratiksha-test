<template src="./list.html"></template>
<script>
import Axios from 'axios';
import sortField from '../../ui/global/sortField';
import ModalDetailReview from './modal-detail-review';
import ModalRelocate from './modal-relocate';
import ModalConfirmation from './modal-confirmation';
import Multiselect from 'vue-multiselect';
import moment from 'moment';
const Config = require('../../../../config/default.env');
let cancelSearchResource;
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

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
      is_loading: true,
      is_loading_count: true,
      totalReshares: 0,
      totalComments: 0,
      totalReports: 0,
      totalBookmarks: 0,
      totallikes: 0,
      totalDislike: 0,
      filter: {
        object_type: '',
        verb: '',
        date_begin: '',
        date_end: '',
        username: '',
        email: '',
        brand: '',
        product: '',
        acquisition_source: '',
        country_source: '',
      },
      source_id: [
        'review-web-desktop',
        'review-web-mobile',
        'review-ios',
        'review-android',
        'sociolla-web-desktop',
        'sociolla-web-mobile',
        'soco-web-desktop',
        'soco-web-mobile',
        'bj-web-desktop',
        'bj-web-mobile',
        'android',
        'ios',
      ],
      source_vn: [
        'sociolla-web-vn-desktop',
        'sociolla-web-vn-mobile',
        'sociolla-vn-android',
        'sociolla-vn-ios',
        'sociolla-vn',
      ],
      filterChanged: false,

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
      options: {
        brands: {
          data: [],
          is_loading: false,
          disabled: false,
        },
      },

      sortParam: '-created_at',
      SOCO_WEB_URL: Config.default.SOCO_WEB_URL,

      checkedIds: [],
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
      this.fetchData();
    },
    filter: {
      handler: function (b, a) {
        if (['video', 'article', 'glossary', 'horoscope'].indexOf(b.object_type) >= 0) {
          b.brand = '';
          b.product = '';
        }
        this.filterChanged = true;
      },
      deep: true,
    },
    'filter.object_type': function () {
      if (this.filter.object_type != 'add-review' || this.filter.object_type != '') {
        this.filter.country_source = '';
      }
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
    selectAll() {
      if (this.checkedIds.length >= 5) {
        this.checkedIds = [];
      } else {
        this.checkedIds = this.data.map((data) => data._id);
      }
    },

    bulkDelete() {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then((dialog) => {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/list/bulk', {
            data: {
              newsfeedIds: this.checkedIds,
            },
          }).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              this.pagination.skip = 0;
              this.pagination.currentPage = 1;
              self.$toasted.global.show('Review relocated success');
              this.checkedIds = [];
              self.getCount();
            }
          });
        })
        .catch(() => {
          console.log('Clicked on cancel');
        });
    },

    getCount: function (filter) {
      this.is_loading_count = true;
      if (!filter) {
        filter = this.filter;
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/count', {
        params: {
          filter: {
            ...this.criteria,
            is_deleted: false,
          },
        },
      })
        .then((response) => {
          this.is_loading_count = false;
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
      if (filter?.date_end && filter?.date_begin) {
        const dateBegin = new Date(filter.date_begin).getTime();
        const dateEnd = new Date(filter.date_end).getTime();
        if (dateEnd < dateBegin) {
          this.$toasted.global.error('To date should not less than from date');
          return;
        }
      }
      this.is_loading = true;
      this.data = [];

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds', {
        params: {
          filter: {
            ...this.criteria,
            is_deleted: false,
          },
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortParam,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;
            this.totalReshares = 0;
            this.totalComments = 0;
            this.totalReports = 0;
            this.totalBookmarks = 0;
            this.totallikes = 0;
            this.totalDislike = 0;
            for (const total in this.data) {
              this.totalReshares += this.data[total].total_reshares;
              this.totalComments += this.data[total].total_comments;
              this.totalReports += this.data[total].total_reports;
              this.totalBookmarks += this.data[total].total_bookmarks;
              this.totallikes += this.data[total].total_likes;
              this.totalDislike += this.data[total].total_dislikes;
            }

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
          console.log('Clicked on cancel');
        });
    },

    sort(sort) {
      this.sortParam = sort;

      if (this.pagination.currentPage == 1) {
        this.pagination.skip = 0;
        this.pagination.currentPage = 1;
        this.fetchData();
        this.getCount();
      } else {
        this.pagination.currentPage = 1;
      }
    },

    showModalDetail(newsfeed) {
      this.$store.commit('setReviewData', newsfeed);
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalDetailReview' });
    },
    filterData() {
      if (
        (this.filter.product ||
          this.filter.brand._id ||
          this.filter.acquisition_source ||
          this.filter.country_source) &&
        this.filter.object_type === ''
      ) {
        alert('Please select type first');
      } else {
        this.criteria = {};
        const criteria_date = {};
        if (this.filter.object_type !== '') {
          this.criteria.object_type = this.filter.object_type;
        }
        if (this.filter.username !== '') {
          this.criteria.username = this.filter.username;
        }
        if (this.filter.verb !== '') {
          this.criteria.verb = this.filter.verb;
        }
        // if(this.filter.product !== "") this.criteria.product = { "$regex": '^'+this.filter.product, "$options": "i"}
        // if(this.filter.brand !== "") this.criteria.brand = { "$regex": '^'+this.filter.brand._id, "$options": "i"}
        if (this.filter.product !== '') {
          this.criteria.productName = this.filter.product;
        }
        if (this.filter.brand !== '') {
          this.criteria.brandId = this.filter.brand._id;
        }
        if (this.filter.date_begin) {
          criteria_date['$gte'] = this.filter.date_begin;
        }
        if (this.filter.date_end) {
          criteria_date['$lte'] = this.filter.date_end;
        }
        if (this.filter.acquisition_source) {
          this.criteria.acquisition_source = this.filter.acquisition_source;
        }
        if (this.filter.country_source) {
          this.criteria.acquisition_source = { $in: this.filter.country_source };
        }
        if (Object.keys(criteria_date).length > 0) {
          this.criteria.created_at = criteria_date;
        }
        if (this.filterChanged && this.pagination.currentPage !== 1) {
          this.filterChanged = false;
          this.pagination.currentPage = 1;
          this.getCount();
        } else {
          this.fetchData();
          this.getCount();
        }
      }
    },
    findBrands(query) {
      if (query) {
        this.options.brands.is_loading = true;

        if (typeof cancelSearchResource === 'object') {
          cancelSearchResource.cancel();
        }
        const CancelToken = Axios.CancelToken;
        cancelSearchResource = CancelToken.source();

        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/brands`, {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              is_deleted: { $ne: true },
              name: {
                $regex: '^' + query,
                $options: 'i',
              },
            },
            fields: '_id name total_products my_soco_sql_id',
            skip: 0,
            limit: 10,
          },
        })
          .then((response) => {
            this.options.brands.is_loading = false;
            if (response.status === 200 && response.data.data) {
              this.options.brands.data = response.data.data;
            }
          })
          .catch((error) => {
            if (Axios.isCancel(error)) {
              return 'cancel';
            }
            this.options.brands.is_loading = false;
            console.log('Error: ' + error);
          });
      }
    },
    sourcename(brand) {
      if (brand._id) {
        return `${brand.name}`;
      }
      return '';
    },
    convertDate(data) {
      return moment(data).format('DD-MM-YYYY HH:mm:ss');
    },
    resetFilter() {
      this.filter = {
        object_type: '',
        verb: '',
        date_begin: '',
        date_end: '',
        username: '',
        email: '',
        brand: '',
        product: '',
        acquisition_source: '',
        country_source: '',
      };
      this.filterData();
    },
    loadInitialData() {
      this.fetchData();
      this.getCount();
    },
    productCombinationName(arg) {
      const combination = arg?.combination || null;
      if (!combination) {
        return '';
      }
      const attribute = combination.attribute || {};
      if (Object.keys(attribute).length > 0) {
        const combiName = [];
        Object.keys(attribute).forEach((el) => {
          combiName.push(`${el}: ${attribute[el].name}`);
        });
        return combiName.join(' - ');
      }
      return '';
    },
  },
};
</script>

<style lang="scss" scoped>
.wrap-text {
  word-wrap: break-word;
  max-width: 300px;
}
input[type='checkbox']:checked {
  background: darkcyan;
}
input[type='checkbox']:after {
  background-color: transparent;
}
.sc-table {
  .newsfeed-th {
    width: 20px !important;
  }
}
.combination-name {
  color: red;
  font-weight: 700;
}
</style>
