<template src="./listspam.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import { exportCsv } from '../../mixins/exportDataViolation';

export default {
  name: 'violation-report',
  mixins: [exportCsv],
  data() {
    return {
      data: [],
      is_loading: true,
      is_loading_export_data: false,
      socoWebUrl: Config.default.SOCO_WEB_URL,
      reviewWebUrl: Config.default.REVIEW_WEB_URL,
      journalWebUrl: Config.default.BJ_WEB_URL,
      filter: {
        delete_spam_date_begin: '',
        delete_spam_date_end: '',
        executed_date_begin: '',
        executed_date_end: '',
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
      sortParam: '-delete_spam_date',
    };
  },

  computed: {},

  watch: {},

  mounted: function () {
    // this.getCount();
    this.fetchData();
    // this.getCountPerType();
  },

  methods: {
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

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-reports/logs', {
        params: {
          filter: this.criteria,
          //   skip: this.pagination.skip,
          //   limit: this.pagination.limit,
          //   sort: this.sortParam ? this.sortParam : 'last_reported_at',
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    filterData(fetching = true) {
      this.criteria = this.criteria;
      this.pagination.currentPage = 1;

      const { delete_spam_date_begin, delete_spam_date_end, executed_date_begin, executed_date_end } = this.filter;

      this.criteria = {
        ...(delete_spam_date_begin || delete_spam_date_end
          ? {
              created_at: {
                ...(delete_spam_date_begin ? { $gte: delete_spam_date_begin } : false),
                ...(delete_spam_date_end ? { $lte: delete_spam_date_end } : false),
              },
            }
          : false),
        ...(executed_date_begin || executed_date_end
          ? {
              executed_date: {
                ...(executed_date_begin ? { $gte: executed_date_begin } : false),
                ...(executed_date_end ? { $lte: executed_date_end } : false),
              },
            }
          : false),
      };

      if (fetching) {
        this.fetchData();
      }
    },

    resetFilter() {
      this.filter = {
        delete_spam_date_begin: '',
        delete_spam_date_end: '',
        executed_date_begin: '',
        executed_date_end: '',
      };
      this.filterData();
    },
    filterDate(date) {
      const filtered = new moment(date).tz('Asia/Jakarta').format('DD  MMM  YYYY');
      return filtered;
    },
    exportDatatoCSV(newsfeed) {
      this.is_loading_export_data = true;
      let executedDate = new Date(newsfeed.executed_date);
      if (newsfeed.executed_date === null) {
        executedDate = new Date(newsfeed.created_at);
        executedDate.setTime(executedDate.getTime() + 86400000);
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeed-violation-reports`, {
        params: {
          filter: {
            created_at: {
              $gte: new moment(newsfeed.created_at).tz('Asia/Jakarta'),
              $lte: new moment(executedDate).tz('Asia/Jakarta'),
            },
          },
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data) {
            const mapedData = this.exportMapFields(response.data.data);
            this.exportCsv(mapedData, `list_data_violation_report${newsfeed.created_at}`);
            this.is_loading_export_data = false;
          } else {
            this.is_loading_export_data = false;
          }
        })
        .catch((err) => {
          this.is_loading_export_data = false;
          console.log(err);
          throw err;
        });
    },

    exportMapFields(data) {
      return (data || []).map((el) => {
        const row = {
          user_id: el._id,
          email: el.email,
          user_phone_number: el.phone_no,
          violation_counter: el.violation_counter,
        };
        return row;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
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
  width: 100px !important;
}
</style>
