<template src="./users-list.html"></template>
<script>
import Axios from 'axios';
import VueJsonToCsv from 'vue-json-to-csv';
import DownloadExcel from 'vue-json-excel';
import { get } from 'lodash';
import sortField from '../../ui/global/sortField';
import Modal from '../../../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

const Config = require('../../../../config/default.env');
export default {
  name: 'users-list',
  components: {
    sortField,
    Modal,
    VueJsonToCsv,
    DownloadExcel,
    DisplayPerPage,
    Pagination,
  },

  data() {
    return {
      toggleCheckAll: false,
      totalCount: {
        pending: 0,
        rejected: 0,
        approved: 0,
      },
      data: [],
      review: {},
      is_loading: true,
      event_status: [
        'waiting',
        'invited',
        'being_notified',
        'waiting_payment',
        'joined',
        'checkin',
        'claimed_gifts',
        'filled_survey',
        'waiting_removed',
        'removed',
      ],
      filter: {
        status: '',
      },
      json_fields: {
        ID: 'user.id',
        Name: 'user.name',
        'User Name': 'user.user_name',
        Email: 'user.email',
        Status: 'status',
        Review: 'review.content',
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
      sortParam: '-created_at',
      userExport: [],
      SOCO_WEB_URL: Config.default.SOCO_WEB_URL,
    };
  },

  computed: {
    labelDate() {
      if (this.status === 'approved') {
        return 'Approved Date';
      } else if (this.status === 'rejected') {
        return 'Rejected Date';
      }
      return 'Registration Date';
    },
    sortFieldDate() {
      if (this.status === 'pending') {
        return 'created_at';
      }
      return 'updated_at';
    },
    isOkDisabledDeleteModal() {
      const { message, isLoadingUpdateSBNUser } = this;
      const voucherMessageDisabled = message.trim().length === 0;

      return voucherMessageDisabled || isLoadingUpdateSBNUser;
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

  mounted() {
    Promise.all([this.fetchData(), this.getCount()]);
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
    resetAll() {
      this.filter = {
        status: '',
      };
      this.filterData();
    },
    async getCount(filter = {}) {
      const event_id = this.$route.params.id;
      this.pagination.currentTotalRecord = 0;
      filter = this.getFilters();

      const options = { params: { filter } };
      const url = Config.default.MS_SOCO_ADMIN_API_URL + `/event/${event_id}/participants/count`;

      try {
        const response = await Axios.get(url, options);

        if (Number(response.status) === 200) {
          let count = parseInt(response.data.data);
          if (isNaN(count)) {
            count = 0;
          }
          this.pagination.currentTotalRecord = count;
          this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
          return count;
        }
        return 0;
      } catch (err) {
        this.$Progress.finish();
        throw err;
        return 0;
      }
    },
    showReview(review) {
      this.review = review;
      this.$refs.modal_review.open();
    },

    async downloadExcel(filter = {}) {
      const event_id = this.$route.params.id;
      filter = this.getFilters();
      const url = Config.default.MS_SOCO_ADMIN_API_URL + `/event/${event_id}/participants`;
      const params = {
        filter: filter,
        limit: 1000,
      };

      try {
        const response = await Axios.get(url, { params });
        const responseData = get(response, 'data.data', []);
        return responseData;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    exportData() {
      const payload = {
        event_id: this.$route.params.id,
      };

      if (this.filter.status) {
        payload['status'] = this.filter.status;
      }

      const url = Config.default.MS_SOCO_ADMIN_API_URL + '/tasks/event-participants-export';
      Axios.post(url, payload).then((response) => {
        alert('Export file will be emailed to selected recipient');
      });
    },
    async fetchData(filter = {}) {
      const event_id = this.$route.params.id;
      this.is_loading = true;
      this.data = [];
      filter = this.getFilters();

      const url = Config.default.MS_SOCO_ADMIN_API_URL + `/event/${event_id}/participants`;
      const params = {
        filter: filter,
        skip: this.pagination.skip,
        limit: this.pagination.limit,
        sort: this.sortParam,
      };

      try {
        const { sortParam } = this;
        const response = await Axios.get(url, { params });
        const responseData = get(response, 'data.data', []);
        this.is_loading = false;

        if (Number(response.status) === 200) {
          if (this.sortParam.includes('user_name')) {
            this.data = responseData.sort((a, b) =>
              sortParam.includes('-') ? b.user_name.localeCompare(a.user_name) : a.user_name.localeCompare(b.user_name)
            );
          } else {
            this.data = responseData;
            this.userExport = responseData.map((u) => {
              const userData = {};
              userData.name = u.user.name;
              userData.user_name = u.user.user_name;
              userData.email = u.user.email || '';
              userData.status = u.status;
              userData.review = (u.review && u.review.content) || '';
              // console.log('User Data',userData)
              return userData;
            });
          }

          if (this.criteria.user_name) {
            this.data = this.data.filter((item) => {
              return get(item, 'sbn_user_detail.status', '') === this.status;
            });
          }

          this.pagination.showNextPage = responseData.length >= this.pagination.limit;

          if (this.criteria.user_name || this.criteria.email) {
            const count = this.data.length;
            this.pagination.currentTotalRecord = count;
            this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
          }
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    getFilters() {
      if (this.$route.query.filled_survey) {
        this.filter.status = 'filled_survey';
      }
      const filter = {};
      for (const property in this.filter) {
        if (this.filter.hasOwnProperty(property) && this.filter[property].length) {
          filter[property] = this.filter[property];
        }
      }
      return filter;
    },
    async filterData() {
      const params = this.getFilters();
      this.pagination.currentPage = 1;
      this.fetchData(params);
      this.getCount(params);
    },
    gotoPage(page) {
      this.pagination.currentPage = page;
    },
    sort(sort) {
      this.sortParam = sort;
      if (this.pagination.currentPage === 1) {
        this.pagination.skip = 0;
        this.pagination.currentPage = 1;
        this.fetchData();
      } else {
        this.pagination.currentPage = 1;
      }
    },
  },
};
</script>

<style lang="scss">
.component-users-list {
  .bt-default {
    height: 30px;
    padding: 6px 12px;
    width: auto;
  }

  .modal-default-user-list {
    .modal-header {
      height: auto;
      padding: 12px 12px 0;
      border-bottom: none;

      .ion-md-close {
        margin: 0 6px 0 0;
      }
    }
  }

  .modal-fill-content-batch {
    .modal-header {
      background: #ffd6ef;
      padding-bottom: 12px;
      border-radius: 0;
    }

    .modal-body {
      input {
        width: 100%;
        border: 1px solid #d4d4d4 !important;
        border-radius: 4px !important;
      }

      .text-detail {
        width: 120px;
        padding-right: 16px;

        p:first-child {
          font-weight: bold;
          margin-bottom: 6px;
        }

        p:last-child {
          font-size: 13px;
          color: #c4c4c4;
        }
      }

      .fill-detail-reason {
        label {
          color: #0a0a0a;
          font-weight: bold;
        }
        select,
        textarea {
          width: 100%;
          padding: 6px 12px;
          border: 1px solid #dbdbdb;
        }
        textarea {
          margin-top: 8px;
        }
      }

      ul {
        padding-left: 0;
        margin: 0;

        li {
          padding: 8px 0;

          & + li {
            border-top: 1px solid #dbdbdb;
          }

          input,
          .fill-detail-reason {
            flex: 1;
          }
        }
      }
    }
  }

  .modal-confirm-approve-reject {
    .modal-body p {
      text-align: center;
      font-size: 1.2rem;
      font-weight: bold;
    }
  }

  table {
    th:first-child {
      vertical-align: bottom;
    }

    input[type='checkbox'] {
      margin: 0 auto;

      &:checked::after {
        background-color: #c4c4c4 !important;
      }
    }
  }
}

.wrap-text {
  word-wrap: break-word;
  max-width: 300px;
}

p.approved-err,
.is-tooltip-danger i {
  color: #e34a4a;
}

.input-voucher-code-wrp {
  input {
    width: 100% !important;
    padding: 14px;

    & + p.approved-err {
      margin-top: 0.75rem;
    }
  }
}

p.approved-err {
  font-size: 1rem;
}

.info-container {
  padding: 10px;
  border-bottom: 1px solid #f6f6f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-container {
  background: #f6f6f6;
}

.sub-container {
  display: flex;
  align-self: flex-end;
  justify-content: flex-end;
  flex-direction: column;
}

.view-image {
  .modal-footer {
    display: none !important;
  }
}

.center {
  text-align: center !important;
  border-bottom: 1px solid #f6f6f6;
}

.link {
  color: #da2a52 !important;
}

.pink {
  padding: 0.7rem 2.5rem;
  font-size: 1rem;
  line-height: 1.25;
  background-color: #da2a52;
  color: white;
  border-radius: 5px !important;
  margin: 10px 0 10px 0;
  box-shadow: none !important;
}

.no-rad {
  border: 1.5px solid #f6f6f6 !important;
  border-radius: 5px !important;
  box-shadow: none !important;
}

.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: #23282e;
    color: white;
    border-radius: 5px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: #23282e !important;
  }

  .tooltip-arrow::before {
    border: none !important;
  }

  &[x-placement^='top'] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='bottom'] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^='right'] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^='left'] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &.popover {
    $color: #23282e;

    .popover-inner {
      background: $color;
      color: #23282e;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }

    .popover-arrow {
      border-color: $color;
    }
  }

  &[aria-hidden='true'] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden='false'] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }
}
</style>
