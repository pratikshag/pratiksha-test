<template src="./newsfeedreport.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import modalv2 from '../../ui/global/modal';

export default {
  name: 'newsfeed-report',
  components: { sortField, modalv2 },

  data() {
    return {
      checkedIds: [],
      data: [],
      tempdelete: '',
      is_loading: true,
      socoWebUrl: Config.default.SOCO_WEB_URL,
      reviewWebUrl: Config.default.REVIEW_WEB_URL,
      journalWebUrl: Config.default.BJ_WEB_URL,

      filter: {
        object_type: '',
        category: '',
        date_begin: '',
        date_end: '',
        keyword: '',
        username: '',
        actor: '',
        last_reported_date_begin: '',
        last_reported_date_end: '',
        spam_criteria: '',
        total_count_from: '',
        total_count_to: '',
        add_review: false,
        violation_counter: '',
        country_source: '',
        is_deleted: false,
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

      criteria: {},
      sortParam: '-last_reported_at',

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
    showModalSpam() {
      return this.$store.state.modal.isModalShow.modalSpam;
    },
    statusSpam() {
      return this.$store.state.modal.sourceClick;
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

    current_object_type(newVal, oldVal) {
      if (newVal != oldVal) {
        this.filter.object_type = newVal == 'all' ? '' : newVal;
        this.filterData();
      }
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
        let filter = '';
        if (type != 'all') {
          filter = { params: { filter: { object_type: type } } };
        }
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/v2/newsfeed-reports/count', filter)
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
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/v2/newsfeed-reports/count', {
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/v2/newsfeed-reports', {
        params: {
          filter: this.criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortParam ? this.sortParam : 'last_reported_at',
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

    selectAll() {
      if (this.checkedIds.length >= 5) {
        this.checkedIds = [];
      } else {
        this.checkedIds = this.data.map((data) => data._id);
      }
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
    },

    searchQuery(e) {
      if (e.keyCode === 13) {
        this.filterData();
      }
    },

    bulkDelete() {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then((dialog) => {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeeds/reports/bulk', {
            data: {
              newsfeedIds: this.checkedIds,
            },
          })
            .then((response) => {
              this.checkedIds = [];
              self.fetchData();
              self.getCount();
              self.getCountPerType();
            })
            .catch((error) => {
              if (error) {
                if (error.response.status === 500) {
                  this.checkedIds = [];
                  self.fetchData();
                  self.getCount();
                  self.getCountPerType();
                }
              }
            });
        })
        .catch(() => {
          console.log('Clicked on cancel');
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

    trash(id) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${id}/reports`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
              self.getCountPerType();
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    removeReport(id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeed-reports/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
              self.getCount();
              self.getCountPerType();
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

    changeObjectType(type) {
      this.current_object_type = type;
    },

    filterData(fetching = true) {
      this.criteria = this.criteria;
      this.pagination.currentPage = 1;
      // var criteria_date = {}

      // if(this.filter.object_type !== "") this.criteria.object_type = this.filter.object_type
      // if(this.filter.category !== "") this.criteria.category = this.filter.category
      // if(this.filter.date_begin) criteria_date['$gte'] = this.filter.date_begin
      // if(this.filter.date_end) criteria_date['$lte'] = this.filter.date_end
      // if(Object.keys(criteria_date).length > 0) this.criteria.created_at = criteria_date
      // if(this.filter.keyword !== "") this.criteria.keyword

      const {
        actor,
        username,
        keyword,
        object_type,
        category,
        date_begin,
        date_end,
        last_reported_date_begin,
        last_reported_date_end,
        spam_criteria,
        total_count_from,
        total_count_to,
        violation_counter,
        country_source,
        is_deleted,
      } = this.filter;

      this.criteria = {
        ...(keyword
          ? {
              title: {
                $regex: keyword,
                $options: 'i',
              },
            }
          : false),
        ...(actor
          ? {
              'user.name': {
                $regex: actor,
                $options: 'i',
              },
            }
          : false),
        ...(username
          ? {
              'owner.user_name': {
                $regex: username,
                $options: 'i',
              },
            }
          : false),
        ...(object_type ? { object_type } : false),
        ...(category ? { category } : false),
        ...(date_begin || date_end
          ? {
              created_at: {
                ...(date_begin ? { $gte: date_begin } : false),
                ...(date_end ? { $lte: date_end } : false),
              },
            }
          : false),
        ...(last_reported_date_begin || last_reported_date_end
          ? {
              last_reported_at: {
                ...(last_reported_date_begin ? { $gte: last_reported_date_begin } : false),
                ...(last_reported_date_end ? { $lte: last_reported_date_end } : false),
              },
            }
          : false),
        ...(spam_criteria
          ? {
              spam_criteria: {
                $in: [spam_criteria],
              },
            }
          : false),
        ...(total_count_from || total_count_to
          ? {
              total_reports: {
                ...(total_count_from ? { $gte: total_count_from } : false),
                ...(total_count_to ? { $lte: total_count_to } : false),
              },
            }
          : false),
        ...(violation_counter
          ? {
              'owner.violation_counter': {
                ...(violation_counter ? { violation_counter } : false),
              },
            }
          : false),
        ...(country_source
          ? {
              acquisition_source: {
                $in: country_source,
              },
            }
          : false),
        is_deleted,
      };
      if (this.criteria?.total_reports || this.criteria?.last_reported_at) {
        Object.assign(this.criteria, { add_review: true });
      }

      if (fetching) {
        this.fetchData();
      }
      this.getCount();
    },

    resetFilter() {
      this.filter = {
        object_type: '',
        category: '',
        date_begin: '',
        date_end: '',
        keyword: '',
        last_reported_date_begin: '',
        last_reported_date_end: '',
        spam_criteria: '',
        total_count_from: '',
        total_count_to: '',
        violation_counter: '',
        country_source: '',
        is_deleted: false,
      };
      this.current_object_type = 'all';
      delete this.criteria?.add_review;
      this.filterData();
    },
    filterDate(date) {
      const filtered = new moment(date).tz('Asia/Jakarta').format('DD - MM - YYYY h:mm:ss');
      return filtered;
    },
    deleteSpam(data, id = '') {
      if (id !== '') {
        this.tempdelete = id;
      }
      this.$store.commit('setSourceClick', data);
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalSpam' });
    },
    hideModalSpam() {
      this.$store.commit('setSourceClick', '');
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalSpam' });
    },
    bulkDeleteSpam() {
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalSpam' });
      const self = this;
      self.is_loading = true;
      Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/reports/bulk?is_delete_spam=true`, {
        data: {
          newsfeedIds: this.checkedIds,
        },
      })
        .then((response) => {
          this.checkedIds = [];
          this.tempdelete = '';
          this.$store.commit('setSourceClick', '');
          self.fetchData();
          self.getCount();
          self.getCountPerType();
        })
        .catch((error) => {
          if (error) {
            if (error.response.status === 500) {
              this.checkedIds = [];
              this.tempdelete = '';
              this.$store.commit('setSourceClick', '');
              self.fetchData();
              self.getCount();
              self.getCountPerType();
            }
          }
        });
    },
    deletes() {
      this.$store.commit('toggleModalGlobalState', { modalName: 'modalSpam' });
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
