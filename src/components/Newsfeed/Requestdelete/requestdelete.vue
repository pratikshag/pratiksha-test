<template src="./requestdelete.html"></template>
<script>
import Axios from 'axios';
import sortField from '../../ui/global/sortField';
const Config = require('../../../../config/default.env');

export default {
  name: 'request-delete',
  components: { sortField },

  data() {
    return {
      data: [],
      socoWebUrl: Config.default.SOCO_WEB_URL,
      reviewWebUrl: Config.default.REVIEW_WEB_URL,
      journalWebUrl: Config.default.BJ_WEB_URL,
      is_loading: true,

      filter: {
        id: '',
        name: '',
        title: '',
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
      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },

      criteria: {
        delete_request: true,
        $or: [{ is_deleted: true }, { deleted_at: { $exists: true } }],
      },

      sortParam: '-delete_request_at',
      checkedIds: [],
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
        .confirm('Please confirm to continue deletion')
        .then((dialog) => {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/reports/bulk', {
            data: {
              newsfeedIds: this.checkedIds,
            },
          }).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              this.pagination.skip = 0;
              this.pagination.currentPage = 1;
              self.$toasted.global.show('Request delete successed');
              this.checkedIds = [];
              self.fetchData();
              self.getCount();
              setTimeout(() => {
                self.is_loading = false;
              }, 1000);
            }
          });
        })
        .catch(() => {
          self.is_loading = false;
          console.log('Clicked on cancel');
        });
    },
    getCount: function (filter) {
      delete this.criteria.object_type;
      if (!filter) {
        filter = this.filter;
      }

      if (this.filter.name) {
        this.criteria.username = this.filter.name;
      }

      if (this.filter.title) {
        this.criteria.object_type = 'add-review';
        this.criteria.productName = this.filter.title;
      }

      if (this.filter.country_source) {
        this.criteria.acquisition_source = { $in: this.filter.country_source };
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

    fetchData: function (filter) {
      delete this.criteria.object_type;

      if (!filter) {
        filter = this.filter;
      }
      this.is_loading = true;
      this.data = [];

      if (this.filter.name) {
        this.criteria.username = this.filter.name;
      }

      if (this.filter.id) {
        if (this.filter.id.length === 24) {
          this.criteria._id = this.filter.id;
        } else {
          this.$toasted.global.show('Id search not valid');
          this.filter.id = '';
          delete this.criteria._id;
        }
      }

      if (this.filter.title) {
        this.criteria.object_type = 'add-review';
        this.criteria.productName = this.filter.title;
      }

      if (this.filter.country_source) {
        this.criteria.acquisition_source = { $in: this.filter.country_source };
      }

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds', {
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
            is_undo_delete_request: true,
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
      } else {
        this.pagination.currentPage = 1;
      }
    },

    reset() {
      this.filter.name = '';
      this.filter.title = '';
      this.filter.country_source = '';
      this.fetchData();
    },
  },
};
</script>

<style>
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
</style>
