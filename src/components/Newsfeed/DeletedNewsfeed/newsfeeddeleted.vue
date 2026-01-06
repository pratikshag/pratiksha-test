<template src="./newsfeeddeleted.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';

export default {
  name: 'newsfeed-report',
  components: { sortField },

  data() {
    return {
      checkedIds: [],
      data: [],
      tempdelete: '',
      is_loading: true,
      socoAdminUrl: Config.default.SOCO_ADMIN_URL,
      socoWebUrl: Config.default.SOCO_WEB_URL,
      reviewWebUrl: Config.default.REVIEW_WEB_URL,
      journalWebUrl: Config.default.BJ_WEB_URL,
      filter: {
        object_type: '',
        category: '',
        date_begin: '',
        date_end: '',
        deleted_by: '',
        username: '',
        actor: '',
        last_reported_date_begin: '',
        last_reported_date_end: '',
        spam_criteria: '',
        deleted_date_begin: '',
        deleted_date_end: '',
        add_review: false,
        violation_counter: '',
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

      current_object_type: 'all',
      total_data: {
        all: 0,
        article: 0,
        video: 0,
        ['photo-tagging']: 0,
        collection: 0,
        vote: 0,
        ['add-review']: 0,
      },
      categories: [],
      userNameLink: (username) => `${Config.default.SOCO_WEB_URL}/${username}`,
    };
  },

  computed: {
    // this is for filter product_id and product.name, if this set in backend for populate much document the query will be much heavier and slower
    paginationCustomize() {
      return {
        totalRecord:
          this.filter.product_id || this.filter.product_name ? this.data.length : this.pagination.currentTotalRecord,
        totalPage: Math.ceil(
          (this.filter.product_id || this.filter.product_name ? this.data.length : this.pagination.currentTotalRecord) /
            this.pagination.limit
        ),
      };
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
      this.pagination.currentPage = page;
      this.fetchData();
    },
  },

  mounted: function () {
    this.getCount();
    this.fetchData();
    this.getCountPerType();
  },

  methods: {
    getCountPerType() {
      const object_type = ['article', 'video', 'photo-tagging', 'collection', 'vote', 'add-review', 'all'];
      for (let i = 0; i < object_type.length; i++) {
        const type = object_type[i];
        const filter = {
          params: {
            filter: {
              ...(type !== 'all' ? { object_type: type } : {}),
              is_deleted: true,
            },
          },
        };
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/count', filter)
          .then((response) => {
            if (response.status == 200) {
              this.total_data[type] = parseInt(response.data.data);
            }
          })
          .catch((err) => {
            throw err;
          });
      }
    },

    getCount: function (filter, filtered) {
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

    fetchData: function (filter) {
      if (!filter) {
        filter = this.filter;
      }
      if (filter?.date_end && filter?.date_begin) {
        const dateBegin = new Date(filter.date_begin).getTime();
        const dateEnd = new Date(filter.date_end).getTime();
        if (dateEnd < dateBegin) {
          this.$toasted.global.error('Date end should not less than date begin');
          return;
        }
      }
      this.is_loading = true;
      this.data = [];
      // console.log("---",filter)

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds', {
        params: {
          filter: this.criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortParam ? this.sortParam : '-created_at',
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

    searchQuery(e) {
      if (e.keyCode === 13) {
        this.filterData();
      }
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

    changeObjectType(type) {
      this.current_object_type = type;

      // Update filter based on selected type
      if (type === 'all') {
        this.filter.object_type = '';
      } else {
        this.filter.object_type = type;
      }

      this.filterData();
    },

    filterData(fetching = true) {
      if ((this.filter.product_id || this.filter.product_name) && this.filter.object_type === '') {
        alert('Please select type first');
      } else {
        this.criteria = this.criteria;
        this.pagination.currentPage = 1;

        const {
          actor,
          username,
          deleted_by,
          object_type,
          category,
          date_begin,
          date_end,
          spam_criteria,
          deleted_date_begin,
          deleted_date_end,
          user_id,
          product_id,
          product_name,
        } = this.filter;

        this.criteria = {
          ...(deleted_by ? { deleted_by } : {}),
          ...(actor ? { username: actor } : {}),
          ...(username ? { 'owner.user_name': { $regex: username, $options: 'i' } } : {}),
          ...(product_name ? { productName: product_name } : {}),
          ...(user_id ? { 'owner.id': user_id } : {}),
          ...(product_id ? { product_id } : {}),
          ...(object_type ? { object_type } : {}),
          ...(category ? { category } : {}),
          ...(date_begin || date_end
            ? {
                created_at: {
                  ...(date_begin ? { $gte: date_begin } : {}),
                  ...(date_end ? { $lte: date_end } : {}),
                },
              }
            : {}),
          ...(spam_criteria ? { spam_criteria } : {}),
          ...(deleted_date_begin || deleted_date_end
            ? {
                deleted_at: {
                  ...(deleted_date_begin ? { $gte: deleted_date_begin } : {}),
                  ...(deleted_date_end ? { $lte: deleted_date_end } : {}),
                },
              }
            : {}),
          is_deleted: true,
        };
        if (this.criteria?.total_reports || this.criteria?.last_reported_at) {
          Object.assign(this.criteria, { add_review: true });
        }

        if (fetching) {
          this.fetchData();
        }
        this.getCount();
      }
    },

    resetFilter() {
      this.filter = {
        object_type: '',
        category: '',
        date_begin: '',
        date_end: '',
        deleted_by: '',
        last_reported_date_begin: '',
        last_reported_date_end: '',
        spam_criteria: '',
        deleted_date_begin: '',
        deleted_date_end: '',
        violation_counter: '',
      };
      this.current_object_type = 'all';
      delete this.criteria?.add_review;
      this.filterData();
    },
    filterDate(date) {
      const filtered = new moment(date).tz('Asia/Jakarta').format('DD - MM - YYYY h:mm:ss');
      return filtered;
    },
    unreport(id) {
      if (id !== '') {
        this.tempdelete = id;
      }
      const self = this;
      self.is_loading = true;
      Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${self.tempdelete}/reports?is_delete_spam=true`)
        .then((response) => {
          self.is_loading = true;
          if (response.status == 200) {
            this.tempdelete = '';
            this.$store.commit('setSourceClick', '');
            self.fetchData();
            self.getCount();
            self.getCountPerType();
          }
        })
        .catch((error) => {
          if (error) {
            if (error.response.status === 500) {
              this.tempdelete = '';
              this.$store.commit('setSourceClick', '');
              self.fetchData();
              self.getCount();
              self.getCountPerType();
            }
          }
        });
    },
    bulkUnreported() {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then((dialog) => {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-reports/bulk', {
            data: {
              reportIds: this.checkedIds,
            },
          }).then((response) => {
            this.checkedIds = [];
            self.fetchData();
            self.getCount();
            self.getCountPerType();
          });
        })
        .catch(() => {
          console.log('Clicked on cancel');
        });
    },
    selectAll() {
      if (this.checkedIds.length >= 5) {
        this.checkedIds = [];
      } else {
        this.checkedIds = this.data.map((data) => data._id);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/modal-confirm';
input[type='checkbox']:checked {
  background: darkcyan;
}
input[type='checkbox']:after {
  background-color: transparent;
}
.m-l-75 {
  margin-left: 85px;
}
.new_btn {
  color: #000;
  img {
    width: 20px;
    vertical-align: top;
    margin-left: -5px;
  }
}
</style>
