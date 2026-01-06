<template src="./users-list.html"></template>
<script>
import Axios from 'axios';
import { get } from 'lodash';
import sortField from '../../ui/global/sortField';
import Modal from '../../../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
import socoSwitch from '../../ui/switch/socoSwitch.vue';
const Config = require('../../../../config/default.env');
import { mapState } from 'vuex'; // Import mapState from Vuex
export default {
  name: 'users-list',
  components: { sortField, Modal, socoSwitch },

  data() {
    return {
      toggleCheckAll: false,
      totalCount: {
        pending: 0,
        rejected: 0,
        approved: 0,
      },
      data: [],
      rejectionMessageList: [
        'You don’t have enough followers/subscribers on your social media. Please improve your activity on social media and try again.',
        'Your Instagram account is on private. Please make it public and upgrade your account to Business Profile.',
        'There is/are some differences between your ID Card/NPWP Number, ID Card/NPWP Photo, and your personal data. Please re-check and try again.',
        'Others',
      ],
      approvedVoucherFeedbackMessage: '',
      rejectedUserFeedbackMessage: '',
      status: 'pending',
      is_loading: true,
      isLoadingUpdateSBNUser: false,
      voucherCode: '',
      newdate: '',
      message:
        'You don’t have enough followers/subscribers on your social media. Please improve your activity on social media and try again.',
      reason: '',
      filter: {
        status: '',
        filter_by: '',
        username: '',
        date_begin: '',
        date_end: '',
        user_id: '',
        phone_no: '',
        categories: [],
        is_hijab: undefined,
        social_media_account_type: '',
        social_media_account_url: '',
        social_media_counter_type: '',
        social_media_counter_value: {
          min: 0,
          max: 0,
        },
        approved_from_date: '',
        approved_to_date: '',
        sbn_voucher_status: '',
      },
      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },
      voucher_status: false,
      criteria: {},
      sortParam: '-created_at',
      SOCO_WEB_URL: Config.default.SOCO_WEB_URL,
      userData: null,
      image_ktp: '',
      image_ktp_selfie: '',
      image_npwp: '',
      confirmationData: {},
      isModalFilterByContent: false,
      contentEnthusiastOption: [
        { text: 'Skincare Enthusiast', value: 'skincare_enthusiast' },
        { text: 'Makeup Enthusiast', value: 'makeup_enthusiast' },
        { text: 'Lifestyle', value: 'lifestyle' },
        { text: 'Korean Beauty Enthusiast', value: 'korean_beauty_enthusiast' },
        { text: 'Travel', value: 'travel' },
        { text: 'Fasihon', value: 'fashion' },
        { text: 'Food Lover', value: 'food_lover' },
        { text: 'Health and Organic', value: 'health_and_organic' },
        { text: 'Kids and Mom', value: 'kids_and_mom' },
        { text: 'Other', value: 'other' },
      ],
      isHijabOption: [
        { text: 'All', value: undefined },
        { text: 'Hijab', value: true },
        { text: 'No Hijab', value: false },
      ],
      socialMediaOption: [
        { text: 'Instagram', value: 'instagram' },
        { text: 'Facebook', value: 'facebook' },
        { text: 'Tiktok', value: 'tiktok' },
        { text: 'Youtube', value: 'youtube' },
        { text: 'Blog', value: 'blog' },
        { text: 'Twitter / X', value: 'twitter' },
      ],
      filterByDate: false,
      bulkVoucherDate: '',
    };
  },

  computed: {
    ...mapState('sbn', ['selectedSbnUsers']),
    contentList() {
      return this.$store.state.jobs.options.content;
    },

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
    availableYears() {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 101 }, (_, index) => ({
        label: currentYear + 5 - index, // Display label for each year
        value: currentYear + 5 - index, // Value to bind
      }));
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
    'pagination.limit': function () {
      this.fetchData();
    },
  },

  created() {
    Promise.all([this.getAllWidgetCount(), this.fetchData()]);
  },

  methods: {
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD');
      } else {
        return '-';
      }
    },
    onChageToggleCheckAll(evt) {
      const checked = get(evt, 'target.checked', false);

      this.data.forEach((item) => {
        this.$set(item, 'checked', checked);
      });
    },
    getCategories(categories) {
      if (!categories) {
        return '';
      }
      return categories
        .map((category) => {
          const contentList = this.contentList.find(({ value }) => value == category);
          if (contentList) {
            return contentList.text;
          }

          return null;
        })
        .filter((item) => item)
        .join(', ');
    },
    doApproveOrRejectSelectedUser(showReason = false, force = false) {
      if (force) {
        if (!this.isLoadingUpdateSBNUser) {
          this.rejectedUserFeedbackMessage = '';
          const url = Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-user/approve';

          const promises = this.data
            .filter((item) => item['checked'])
            .map((item) => {
              let param;

              if (this.status === 'pending') {
                param = {
                  user_id: item._id,
                  status: 'approved',
                  code: item.voucherCode,
                  is_sbn: true,
                };
              } else {
                const rejetctMessage = item.rejectMesage === 'Others' ? item.rejectReason : item.rejectMesage;

                param = {
                  user_id: item._id,
                  status: 'rejected',
                  is_sbn: false,
                  rejection_message: rejetctMessage,
                };
              }

              return Axios.post(url, param);
            });

          this.is_loading = true;
          Promise.all(promises)
            .catch((err) => {
              const isReasonBlank = get(err, 'response.data.errorCode', '') === 'MISSING_REJECTION_MESSAGE';
              if (isReasonBlank) {
                this.$toasted.global.error('Reason cannot be blanked');
              }
            })
            .finally(() => {
              this.isLoadingUpdateSBNUser = false;
              this.is_loading = false;
              this.fetchData();
            });
        }
      } else if (showReason) {
        this.$refs.modal_fill_content_approve_reject.open();
      } else {
        const containSelected = this.data.some((item) => Boolean(item['checked']));

        if (containSelected) {
          this.$refs.modal_approve_batch.open();
        } else {
          this.$toasted.global.error('Check some data first');
        }
      }
    },
    filterStatus(status) {
      this.filter.username = '';
      this.filter.date_begin = '';
      this.filter.date_end = '';
      this.filter.phone_no = '';
      this.filter.approved_from_date = '';
      this.filter.approved_to_date = '';
      this.filter.sbn_voucher_status = '';
      this.criteria = {};

      this.getCount(this.status).then(() => {
        this.filter.status = status;
        this.pagination.currentPage = 1;
        this.status = status;
        this.getCount(status);
        this.fetchData();
      });
    },
    onInputBlurFocusVoucherCode(isFocus = false) {
      if (this.approvedVoucherFeedbackMessage) {
        this.approvedVoucherFeedbackMessage = '';
      }
    },
    async getAllWidgetCount() {
      await Promise.all([this.getCount('pending'), this.getCount('approved'), this.getCount('rejected')]);
    },
    infoWarningIg(data) {
      const igFolowers = get(data, 'social.instagram.total_followers', 0);

      if (Number(igFolowers) < 3000) {
        return 'Not Enough IG Followers';
      }

      return '';
    },
    infoWarningYoutubeSubs(data) {
      const youtubeSubs = get(data, 'social.youtube.total_subscribers', 0);

      if (Number(youtubeSubs) < 5000) {
        return 'Not Enough Youtube Subscribers';
      }

      return '';
    },
    infoWarningBlogPageView(data) {
      const blogViews = get(data, 'social.blog.total_page_views', 0);

      if (Number(blogViews) < 0) {
        return 'Not Enough Pageviews';
      }

      return '';
    },
    infoWarningPageViewLikeSubscriber(data) {
      if (this.infoWarningIg(data)) {
        return `<ul><li>${this.infoWarningIg(data)}</li></ul>`;
      }

      if (this.infoWarningYoutubeSubs(data)) {
        return `<ul><li>${this.infoWarningYoutubeSubs(data)}</li></ul>`;
      }

      if (this.infoWarningBlogPageView(data)) {
        return `<ul><li>${this.infoWarningBlogPageView(data)}</li></ul>`;
      }

      return '';
    },
    getFilters() {
      const criteria = { status: this.status, filter_by: 'sbn' };
      const criteria_date = {};

      if (this.filter.username) {
        if (this.filter.username.includes('@')) {
          criteria.email = this.filter.username.trim();
        } else {
          criteria.user_name = this.filter.username;
        }
      }

      if (this.filter.date_begin) {
        criteria_date['$gte'] = this.filter.date_begin;
      }

      if (this.filter.date_end) {
        criteria_date['$lte'] = this.filter.date_end;
      }
      if (this.filter.phone_no) {
        criteria.phone_no = this.filter.phone_no;
      }

      if (this.filter.approved_from_date) {
        criteria_date['$gte'] = this.filter.approved_from_date;
      }
      if (this.filter.approved_to_date) {
        criteria_date['$lte'] = this.filter.approved_to_date;
      }
      const voucherStatus = this.filter.sbn_voucher_status === 'true';
      if (this.filter.sbn_voucher_status === 'true') {
        criteria.voucher_status = voucherStatus;
      } else if (this.filter.sbn_voucher_status === 'false' || this.filter.sbn_voucher_status == null) {
        criteria.$or = [{ voucher_status: false }, { voucher_status: { $exists: false } }];
      }

      if (Object.keys(criteria_date).length > 0) {
        if (this.status === 'pending') {
          criteria.created_at = criteria_date;
        } else if (this.status === 'approved') {
          criteria['voucher.activated_at'] = criteria_date;
        } else if (this.status === 'rejected') {
          criteria.updated_at = criteria_date;
        }
      }
      if (this.filter.user_id) {
        criteria._id = this.filter.user_id;
      }

      if (this.filter.is_hijab !== undefined) {
        criteria.is_hijab = this.filter.is_hijab;
      }

      if (this.filter.categories && this.filter.categories.length > 0) {
        criteria.categories = { $in: this.filter.categories };
      }

      if (this.filter.social_media_account_type) {
        criteria.social_media_account_type = this.filter.social_media_account_type;
      }
      if (this.filter.social_media_account_url) {
        criteria.social_media_account_url = this.filter.social_media_account_url;
      }
      if (this.filter.social_media_counter_type) {
        criteria.social_media_counter_type = this.filter.social_media_counter_type;
      }
      if (this.filter.social_media_counter_value) {
        const { min, max } = this.filter.social_media_counter_value;
        if (min && min !== 0) {
          criteria['social_media_counter_value.min'] = min;
        }
        if (max && max !== 0) {
          criteria['social_media_counter_value.max'] = max;
        }
      }

      return criteria;
    },

    async getCount(filter) {
      this.criteria = this.getFilters();

      if (this.criteria.user_name || this.criteria.email) {
        return 0;
      } else {
        delete this.criteria.filter_by;
        delete this.criteria.user_name;
        delete this.criteria.email;
        delete this.criteria._id;

        this.criteria.status = filter;

        const options = { params: { filter: this.criteria } };
        const url = Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-users/count';

        try {
          const response = await Axios.get(url, options);

          if (Number(response.status) === 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }

            if (filter === 'pending') {
              this.totalCount.pending = count;
            } else if (filter === 'approved') {
              this.totalCount.approved = count;
            } else if (filter === 'rejected') {
              this.totalCount.rejected = count;
            }

            if (this.status === filter) {
              this.pagination.currentTotalRecord = count;
              this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
              return count;
            }
            return count;
          }
          return 0;
        } catch (err) {
          this.$Progress.finish();
          throw err;
          return 0;
        }
      }
    },
    editUser(user) {
      this.rejectedUserFeedbackMessage = '';
      this.voucherCode = '';
      this.message = '';
      this.userData = { ...user };
      // console.log("datae userne", this.userData)
      this.$refs.edit_modal.open();
    },
    editVoucher(userData) {
      this.$refs.edit_modal_voucher.open();
    },
    viewKtp(userData) {
      this.image_ktp = this.userData.sbn_user_detail.ktp.photo;
      this.$refs.image_download_ktp.open();
    },
    viewKtpSelfie(userData) {
      this.image_ktp_selfie = this.userData.sbn_user_detail.ktp.selfie_with_user;
      this.$refs.image_download_ktp_selfie.open();
    },
    viewNpwp(userData) {
      this.image_npwp = this.userData.sbn_user_detail.npwp.photo;
      this.$refs.image_download_npwp.open();
    },
    confirmModal(user, status) {
      this.confirmationData = {
        user_id: user._id,
        status,
        code: user.sbn_user_detail.voucher.code,
      };
      this.$refs.delete_modal.open();
    },
    async fetchData() {
      this.is_loading = true;
      this.data = [];
      this.criteria = this.getFilters();

      if (this.criteria.user_name || this.criteria.email || this.criteria._id) {
        delete this.criteria.filter_by;
        delete this.criteria.status;
      }

      const url = Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-users';
      const params = {
        filter: this.criteria,
        skip: this.pagination.skip,
        limit: this.pagination.limit,
        sort: this.sortParam,
      };
      if (this.criteria.status === 'approved') {
        params.sort = { 'voucher.activated_at': 1 };
      }

      try {
        const { sortParam } = this;
        const response = await Axios.get(url, { params });
        const responseData = get(response, 'data.data', []).map((item) => {
          item['checked'] = false;
          item['voucherCode'] = '';
          item['rejectReason'] = '';
          item['rejectMesage'] = '';

          return item;
        });

        this.is_loading = false;

        if (Number(response.status) === 200) {
          if (this.sortParam.includes('user_name')) {
            this.data = responseData.sort((a, b) =>
              sortParam.includes('-') ? b.user_name.localeCompare(a.user_name) : a.user_name.localeCompare(b.user_name)
            );
          } else {
            this.data = responseData;
            // console.log("datae", this.data)
          }

          if (this.criteria.user_name || this.criteria.email) {
            this.data = this.data.filter((item) => {
              return get(item, 'sbn_user_detail.status', '') === this.status;
            });
          }

          this.pagination.showNextPage = responseData.length >= this.pagination.limit;

          if (this.criteria.user_name || this.criteria.email) {
            const count = this.data.length;
            this.pagination.currentTotalRecord = count;
            this.pagination.totalPage = Math.ceil(count / this.pagination.limit);

            if (this.status === 'pending') {
              this.totalCount.pending = count;
            } else if (this.status === 'approved') {
              this.totalCount.approved = count;
            } else if (this.status === 'rejected') {
              this.totalCount.rejected = count;
            }
          }
        }
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    exportData() {
      const payload = {
        ...this.filter,
        status: this.status || this.criteria.status,
      };
      const url = Config.default.MS_SOCO_ADMIN_API_URL + '/tasks/user-sbn-export';
      Axios.post(url, payload).then((res) => {
        const data = get(res, 'data.data');
        if (data) {
          const a = document.createElement('a');
          a.href = data.cdn_url;
          a.download = data.name;
          a.click();
          a.remove();
        }
      });
    },
    resetData() {
      this.filter = {
        status: '',
        filter_by: '',
        username: '',
        date_begin: '',
        date_end: '',
        user_id: '',
        phone_no: '',
        categories: [],
        is_hijab: undefined,
        social_media_account_type: '',
        social_media_account_url: '',
        social_media_counter_type: '',
        social_media_counter_value: {
          min: 0,
          max: 0,
        },
        approved_from_date: '',
        approved_to_date: '',
        sbn_voucher_status: '',
      };
      this.getCount(this.status).then(() => this.fetchData());
    },
    updateSbnUser(data) {
      if (!this.isLoadingUpdateSBNUser) {
        this.isLoadingUpdateSBNUser = true;
        if (data.status === 'approved') {
          data.is_sbn = true;
          data.rejection_message = '';
        } else {
          data.is_sbn = false;
          if (this.message === 'Others') {
            data.rejection_message = this.reason;
          } else {
            data.rejection_message = this.message;
          }
        }

        Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-user/approve', data)
          .then(async () => {
            this.approvedVoucherFeedbackMessage = '';
            this.rejectedUserFeedbackMessage = '';
            await Promise.all([this.fetchData(), this.getAllWidgetCount()]);
          })
          .catch((err) => {
            const isVoucherCodeDuplicate = get(err, 'response.data.errorCode', '') === 'SBN_DUPLICATE_CODE';

            const isReasonBlank = get(err, 'response.data.errorCode', '') === 'MISSING_REJECTION_MESSAGE';

            if (isVoucherCodeDuplicate && this.$refs.delete_modal) {
              this.$refs.delete_modal.open();
              this.approvedVoucherFeedbackMessage = 'Kode voucher ini sudah digunakan';
            } else if (isReasonBlank && this.$refs.delete_modal) {
              this.$refs.delete_modal.open();
              this.rejectedUserFeedbackMessage = 'Rejected reason cannot be blank';
            }

            throw err;
          })
          .finally(() => {
            this.isLoadingUpdateSBNUser = false;
            this.is_loading = false;
            this.fetchData();
          });
      }
    },
    async updateSbnVoucher({ status, userId, voucherCode, isSbn, toDate }) {
      this.isLoadingUpdateSBNUser = true;
      this.is_loading = true;

      try {
        let finalToDate;
        if (toDate) {
          finalToDate = moment(toDate).add(10, 'years').format('YYYY-MM-DD');
        } else {
          finalToDate = moment().add(10, 'years').format('YYYY-MM-DD');
        }

        const requestData = {
          user_id: userId || this.userData._id,
          code: voucherCode || this.userData.sbn_voucher_code,
          is_enable: status,
          is_sbn: isSbn ?? this.userData?.is_sbn,
          to_date: finalToDate || this.newdate,
        };
        await Axios.put(`${Config.default.MS_SOCO_ADMIN_API_URL}/sbn-user/voucher`, requestData);
        await Promise.all([this.fetchData(), this.getAllWidgetCount()]);

        if (toDate && this.userData?.sbn_user_detail?.voucher) {
          this.userData.sbn_user_detail.voucher.expires_at = finalToDate;
        }
      } catch (err) {
        throw err;
      } finally {
        this.isLoadingUpdateSBNUser = false;
        this.is_loading = false;
      }
    },
    async filterData() {
      this.pagination.currentPage = 1;

      this.getCount(this.status).then(() => this.fetchData());
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
    showSocialMediaURL(userData, type) {
      if (userData?.social) {
        const url = userData.social[type]?.url;
        const followers = userData.social[type]?.total_followers;

        return `
          <div class="social-media-link">
            <div>id : ${url ?? '-'}</div></br>
            <div>follower : ${followers ?? '-'}</div>
          </div>
        `;
      }
      return '-';
    },
    isUserSelected(user) {
      return this.selectedSbnUsers.some((u) => u._id === user._id);
    },
    updateFilterByDate(newValue) {
      this.filterByDate = newValue;
    },
    clearSelectedUser() {
      this.$store.dispatch('sbn/clearSelectedSbnUsers');
      this.data.forEach((item) => {
        this.$set(item, 'checked', false);
      });
    },
    async processBulkVoucherStatus() {
      try {
        this.is_loading = false;
        const params = {
          is_all: this.toggleCheckAll,
          is_by_date: this.filterByDate,
          date: this.bulkVoucherDate,
          is_enable: this.filter.sbn_voucher_status,
          data: this.selectedSbnUsers.map((item) => {
            return item.sbn_user_detail.voucher.code;
          }),
        };
        const url = Config.default.MS_SOCO_ADMIN_API_URL + '/sbn-users/voucher/bulk';
        const response = await Axios.patch(url, params);
        this.is_loading = false;

        if (response.status !== 200) {
          this.$toasted.global.error('Something went wrong');
        }
        this.$toasted.global.show(`Successfully update ${response.data.data} data`, { icon: 'check' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.log(error);
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

.button-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  width: 100%;
  flex-wrap: wrap;
}

.center {
  width: 100%;
  max-width: 250px;
}

.btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: center;
}

.btn-normal.btn-sm.pink {
  background-color: #e91e63;
  color: white;
}

.btn-normal.btn-sm.pink:hover {
  background-color: #d81b60;
}

@media (max-width: 991px) {
  .button-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .center {
    width: 100%;
    max-width: none;
  }

  .btn {
    padding: 0.625rem 0.875rem;
    font-size: 0.875rem;
  }
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

.pagination-custom-footer {
  display: flex;
  flex-direction: row;
  margin-top: 20px;
  .pagination-info {
    width: 50%;
    display: flex;
    flex-direction: column;
  }
  .display-setting {
    align-self: center;
    display: flex;
    flex-direction: row;
    width: 50%;
    gap: 3px;
    span {
      align-self: center;
    }
    select {
      align-self: center;
      width: 35px;
      height: 20px;
      border-radius: 5px;
      text-align: center;
      font: 14px 'lato-regular';
    }
  }
}
.button-filter-content {
  margin-top: 15%;
  @media (max-width: 768px) {
    margin: 0;
  }
}
.button-filter-social-media {
  margin-top: 12%;
  @media (max-width: 768px) {
    margin: 0;
  }
}
.modal-filter-by-content-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .content-enthusiast-container {
    align-self: center;
    width: 100%;
    text-align: center;
    .content-enthusiast-filter {
      margin-top: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      place-items: center;
      gap: 5px;
      .checkbox-group {
        width: 70%;
        align-items: center;
        display: flex;
      }
    }
  }
  .content-hijab-container {
    margin-top: 20px;
    align-self: center;
    width: 100%;
    text-align: center;
    .content-hijab-filter {
      margin-top: 10px;
      display: flex;
      justify-content: space-evenly;
      .radio-group {
        flex-direction: row;
        width: 50%;
        align-items: center;
        display: flex;
        justify-content: center;
        gap: 10px;
      }
    }
  }
}
.modal-filter-by-social-media-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  .by-social-media-container {
    display: flex;
    justify-content: center;
    flex-direction: column;

    .content-social-media-filter {
      display: flex;
      justify-content: center;
      margin-top: 10px;
      gap: 20px;
      select,
      input {
        width: 60%;
        font-size: 14px !important;
        height: auto !important;
        padding: 8px 15px;
        border-radius: 4px;
        background-color: #ffffff !important;
        border: 1px solid #ddd !important;
      }
    }
  }
}
input[type='checkbox']:checked {
  background: #f09ab9;
}
input[type='checkbox']:after {
  background-color: transparent;
}
.bulk-voucher-container {
  display: flex;
  flex-direction: column;
  .bulk-type-container {
    display: flex;
    flex-direction: row;
    gap: 3px;
  }
  .filter-field-container {
    display: flex;
    flex-direction: row;
    input,
    select {
      width: 100%;
      font-size: 14px !important;
      height: auto !important;
      padding: 8px 15px;
      border-radius: 4px;
      background-color: #ffffff !important;
      border: 1px solid #ddd !important;
    }
  }
}
</style>
