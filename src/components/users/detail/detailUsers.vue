<template src="./detailUsers.html"></template>
<script>
import Axios from 'axios';
import { mapActions } from 'vuex';

const Config = require('../../../../config/default.env');
import { exportCsv } from '../../mixins/exportData';
import InfiniteLoading from 'vue-infinite-loading';
import moment from 'moment';
import { get } from 'lodash';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';
import modalv2 from '../../ui/global/modal';
import Multiselect from 'vue-multiselect';
import Pagination from '@/components/tables/pagination';

export default {
  name: 'detailUsers',
  components: {
    InfiniteLoading,
    Datetime,
    modalv2,
    Multiselect,
    Pagination,
  },
  mixins: [exportCsv],
  data() {
    return {
      user: {},
      userId: null,
      userAction: {
        soco_all_time: {},
        soco_new: {},
      },
      userActionLilla: {
        soco_all_time: {},
        soco_new: {},
      },
      userActivity: [],
      userShoppingHistories: [],
      userActivityHistories: [],
      userReferrals: [],
      userReferralsNotRegistered: [],
      userInvitePhoneBook: [],
      userShoppingHistoriesLilla: [],
      userActivityHistoriesLilla: [],
      userExpiringPoints: 0,
      userLillaStats: '',
      userLillaProfile: '',
      skip: 0,
      limit: 20,
      isShowButtonLoadMore: true,
      isShowButtonLoadMorePhone: true,
      isShowButtonLoadMoreEmail: true,
      isProcessingLoadMore: false,
      isProcessingLoadMorePhone: false,
      isProcessingLoadMoreEmail: false,
      styleLinePink: { 'background-color': '#eee' },
      limitShopping: 10,
      skipShopping: 0,
      limitActivity: 10,
      skipActivity: 0,
      is_loading_export_data_new: false,
      is_loading_export_data_old: false,
      is_loading_update_logs: false,
      showFullBirthday: false,
      picked: 'soft-delete',
      optionsDelete: [
        {
          text: 'Soft Delete',
          value: 'soft-delete',
          payload: { status: 'deleted' },
        },
        {
          text: 'Permanently Delete',
          value: 'permanent-delete',
          payload: { status: 'deleted', is_permanent_delete: true },
        },
      ],
      filter: {
        date_start: new moment().subtract(2, 'M').format('YYYY-MM-DD'),
        date_end: new moment().format('YYYY-MM-DD'),
      },
      formUserName: false,
      formEmail: false,
      formPhone: false,
      user_name: '',
      email: '',
      phone_no: '',
      modalOpen: false,
      selectedCountry: {
        name: '',
        phone_code: '',
        flag: '',
      },
      countries: [],
      countryDropdownOpen: false,
      syncTotalShoppingModalOpen: false,
      totalShoppingLoading: false,
      userTotalOrderPrice: null,
      emailCheck: {
        error: '',
        loading: false,
      },
      phoneCheck: {
        error: '',
        loading: false,
      },
      isEmailAvailable: false,
      isPhoneAvailable: false,
      evidence: '',
      pointSummary: {
        data: 0,
        loading: false,
      },
      totalPoints: {
        loading: false,
        confirmationModal: false,
      },
      syncLevel: {
        data: '',
        loading: true,
        confirmationModal: false,
        loadingButton: false,
      },
      syncPoint: {
        data: '',
        loading: false,
        confirmationModal: false,
        loadingButton: false,
        from_date: new moment().subtract(2, 'M').format('YYYY-MM-DD'),
        to_date: new moment().format('YYYY-MM-DD'),
        previewResults: null,
      },
      otpCount: 0,
      userTransactionHistory: {
        data: [],
        limit: 10,
        skip: 0,
        currentPage: 1,
        totalPage: 0,
        totalData: 0,
      },
      formDateBirth: false,
      modalBirthDate: false,
      selectBirthDate: null,
      sociollaAdminUrl: Config.default.SOCIOLLA_ADMIN_URL,
      verifyModalOpen: false,
      verifyReason: '',
      currentStatus: null,
    };
  },
  computed: {
    userRole() {
      return this.$store.state.userrole;
    },
    formattedBirthday() {
      const { birthday_date, date_of_birth } = this.user;
      let date;

      if (birthday_date) {
        date = new Date(birthday_date);
      } else if (date_of_birth) {
        const [day, month, year] = date_of_birth.split('/');
        date = new Date(year, month - 1, day);
      } else {
        return '-';
      }
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },

    maskedBirthday() {
      if (!this.formattedBirthday || this.formattedBirthday === '-') {
        return '-';
      }
      return this.maskBirthday(this.formattedBirthday);
    },
    hasFilledBeautyProfile() {
      if (this.userAction.soco_all_time.create_beauty === 1 || this.userAction.soco_new.create_beauty === 1) {
        return true;
      }
      return false;
    },
    is_mom_pregnant() {
      if (this.user.is_mother == 'pregnant') {
        return true;
      }
      return false;
    },
    checkRegistrationHash() {
      if (!this.user || !this.user.registration_hash || this.user.registration_hash === null) {
        return false;
      }
      return true;
    },
    checkNegativePoint() {
      if (this.user.points.count < 0) {
        return true;
      }
      return false;
    },
    referral_code() {
      return Object.keys(this.user).indexOf('referral_code') > 0 ? this.user.referral_code : '-';
    },
    userCurrency() {
      if (!this.user.country || this.user.country.name === 'Indonesia') {
        return 'IDR';
      }
      return 'VND';
    },
    designatedUserLevel() {
      if (this.user.country && this.user.country.name === 'Indonesia') {
        if (this.user.level) {
          return 'level';
        } else if (this.user.level_vn) {
          return 'level_vn';
        }
        return null;
      } else {
        if (this.user.level_vn) {
          return 'level_vn';
        } else if (this.user.level) {
          return 'level';
        }
        return null;
      }
    },
    membershipPeriod() {
      const endDate = new Date(this.user[this.designatedUserLevel].re_evaluate_at || this.user.created_at);
      const startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1);
      return {
        startDate: this.formatDateLong(startDate),
        endDate: this.formatDateLong(endDate),
      };
    },
    isValidDateRange() {
      if (!this.syncPoint.from_date || !this.syncPoint.to_date) {
        return false;
      }

      const fromDate = new Date(this.syncPoint.from_date);
      const toDate = new Date(this.syncPoint.to_date);

      return (
        fromDate <= toDate && fromDate instanceof Date && !isNaN(fromDate) && toDate instanceof Date && !isNaN(toDate)
      );
    },
    dateError() {
      if (!this.syncPoint.from_date || !this.syncPoint.to_date) {
        return 'Please select both dates';
      }
      if (this.syncPoint.from_date > this.syncPoint.to_date) {
        return 'From date cannot be after to date';
      }
      return null;
    },
    actions() {
      const actions = [{ text: 'Sync Data', method: this.onSyncData }];
      if (this.user?.phone_no && this.user?.is_verified_phone) {
        actions.push({ text: 'Unverify Phone Number', method: this.onUnverifyPhone });
      }
      if (this.user?.phone_no && !this.user?.is_verified_phone) {
        actions.push({ text: 'Verify Phone Number', method: this.onVerifyPhone });
      }
      actions.push(
        this.user.is_deleted
          ? { text: 'Recover User', method: this.onRecoverUser }
          : { text: 'Delete User', method: this.onShowModal },
        { text: 'Reset Violation Counter', method: this.onResetViolationCounter },
        { text: 'Sync DB Point', method: this.onSyncDbPoint }
      );
      return actions;
    },
  },
  watch: {
    syncTotalShoppingModalOpen(newVal) {
      if (newVal === false) {
        return;
      }

      const self = this;

      if (!self.user) {
        this.$toasted.global.show('Please try again later');
        return;
      }

      this.totalShoppingLoading = true;

      const filter = JSON.stringify({
        re_evaluate_at: self.user[this.designatedUserLevel].re_evaluate_at || self.user.created_at,
        is_vn: !this.user.country || (this.user.country && this.user.country.name !== 'Indonesia'),
      });

      return Axios.get(
        Config.default.MS_SOCO_ADMIN_API_URL + `/users/${self.user.id}/total-paid-in-membership?filter=${filter}`
      )
        .then((response) => {
          if (response.status === 200) {
            this.userTotalOrderPrice = response.data.data.totalPaid;
          } else {
            throw new Error('attempt to fix total shopping failed');
          }
        })
        .catch((err) => {
          this.$toasted.global.show(err.message || 'Please try again later');
          throw err;
        })
        .finally(() => {
          this.totalShoppingLoading = false;
        });
    },
    'syncLevel.confirmationModal'(value) {
      if (!value) {
        return;
      }
      return this.syncUserLevel({ is_preview: true });
    },
  },
  mounted() {
    this.getUser();
    this.getActionUser();
    this.getActionUserLilla();
    this.getUserActivity();
    this.getLillaStats();
    this.getLillaProfile();
    this.getSummaryPointBalance();
    this.getCountries();
    this.getOtpCount();
    this.getUserTransactionHistory();
    this.getUserTransactionCount();
  },
  methods: {
    getCountries() {
      this.is_loading = true;
      const params = {
        filter: { is_active: true },
        skip: 0,
        limit: 0,
        sort: 'name',
      };

      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/countries', { params })
        .then((response) => {
          if (response.status === 200) {
            this.countries = response.data.data.filter(Boolean);
            const defaultCountry = this.countries.find((c) => c.phone_code === '+62');
            this.selectedCountry = defaultCountry || this.countries[0];
            this.phone_code = this.selectedCountry.phone_code;
          }
        })
        .catch((err) => {
          console.error('Error fetching countries:', err);
        })
        .finally(() => {
          this.is_loading = false;
        });
    },

    selectCountry(country) {
      this.selectedCountry = country;
      this.phone_code = country.phone_code;
      this.countryDropdownOpen = false;
    },
    handleActionClick(action) {
      const text = action.text.toLowerCase();

      if (text.includes('verify phone')) {
        const isVerify = text.includes('verify') && !text.includes('unverify');
        this.openVerifyModal(isVerify);
      } else if (text === 'sync db point') {
        this.syncPoint.confirmationModal = true;
      } else {
        action.method();
      }
    },

    closeModal() {
      this.syncPoint.confirmationModal = false;
      this.syncPoint.from_date = '';
      this.syncPoint.to_date = '';
      this.syncPoint.loadingButton = false;
      this.syncPoint.previewResults = null;
    },

    async handlePreviewCalculate() {
      if (!this.isValidDateRange) {
        return;
      }

      this.syncPoint.loadingButton = true;

      try {
        const response = await Axios.post(
          `${Config.default.MS_SOCO_ADMIN_API_URL}/jobs/point-discrepancy-check/${this.syncPoint.from_date}/${this.syncPoint.to_date}`,
          { user_name: this.user.user_name }
        );

        if (response && response.data && response.data.data) {
          const data = response.data.data;
          const previewResults = [
            { type: 'beautyProfile', points: (data.beautyProfile && data.beautyProfile.totalPoints) || 0 },
            { type: 'orderCancel', points: (data.orderCancel && data.orderCancel.totalPoints) || 0 },
            { type: 'orderDelivery', points: (data.orderDelivery && data.orderDelivery.totalPoints) || 0 },
            { type: 'verifyReview', points: (data.verifyReview && data.verifyReview.totalPoints) || 0 },
          ];

          const totalPoints = previewResults.reduce((sum, result) => sum + result.points, 0);
          this.syncPoint.previewResults = previewResults;
          this.syncPoint.totalPoints = totalPoints;
        }
      } catch (error) {
        this.$toast.error(error.response?.data?.message || 'Preview calculation failed');
      } finally {
        this.syncPoint.loadingButton = false;
      }
    },

    async handleSync() {
      if (!this.isValidDateRange) {
        return;
      }

      this.syncPoint.loadingButton = true;

      try {
        const baseUrl = Config.default.MS_SOCO_ADMIN_API_URL;
        const params = { user_name: this.user.user_name };

        const endpoints = [
          'order-cancel-redeem-point-discrepancy-correction',
          'order-delivery-point-discrepancy-correction',
          'verified-purchase-reviews-point-discrepancy-correction',
          'beauty-profile-point-discrepancy-correction',
        ];

        const requests = endpoints.map((endpoint) => {
          const url = `${baseUrl}/jobs/${endpoint}/${this.syncPoint.from_date}/${this.syncPoint.to_date}`;
          return Axios.post(url, params);
        });
        await Promise.all(requests);

        this.closeModal();
      } catch (error) {
        this.$toast.error('Sync process failed due to a network or server error');
      } finally {
        this.syncPoint.loadingButton = false;
      }
    },

    onSyncDbPoint() {
      this.syncPoint.confirmationModal = true;
    },
    exportExpiringPointtoCsv() {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/expired-points`, {
        params: {
          filter: {
            from: this.filter.date_start,
            to: this.filter.date_end,
          },
        },
      }).then((result) => {
        if (result.status == 200) {
          const data = result.data.data.map((el) => {
            const row = {
              point_remark: this.formatRemark(el),
              points: el.points,
              point_type: el.point_type,
              transaction_type: el.transaction_type,
              is_used: el.is_used,
              is_expired: el.is_expired,
              created_at: this.convertDate(el.created_at),
              expired_at: this.convertDate(el.expires_at),
            };
            return row;
          });
          this.exportCsv(data, `user_${this.userId}_expiring_points`);
        }
      });
    },
    formatRemark(point) {
      const transaction_type = point.transaction_type;
      let remark = transaction_type;
      const type = get(point, 'object.type', '');
      const payment_status = get(point, 'object.payment_status', '');
      const orderCode = get(point, 'object.reference_no', '');

      if (transaction_type === 'order') {
        if (payment_status == 'Delivered') {
          remark = 'Get point from order ' + orderCode;
        } else if (payment_status == 'Cancelled') {
          remark = 'Cancel order ' + orderCode;
        }
      } else if (transaction_type === 'remove') {
        remark = 'Remove ' + type;
      } else if (transaction_type === 'redeem') {
        remark = (payment_status == 'Cancelled' ? 'Cancel ' : '') + 'Redeem point from order ' + orderCode;
      } else if (transaction_type === 'verified') {
        remark = 'Get point from verified ' + type;
      } else {
        if (point.points >= 0) {
          remark = 'Get point from ' + transaction_type;
        } else {
          remark = 'Deduct point for ' + transaction_type;
        }
      }

      return remark;
    },
    filterExpiringPoint() {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/expired-points/total`, {
        params: {
          filter: {
            from: this.filter.date_start,
            to: this.filter.date_end,
          },
        },
      }).then((response) => {
        if (response && response.status == 200) {
          this.userExpiringPoints = response.data.data;
        }
      });
    },
    ...mapActions('users', ['unverify', 'verify', 'updateStatus']),
    ...mapActions('$_Auth', ['checkPhoneNumberAvailability']),
    changeTitle(data) {
      const newString = data.title.toString();
      return newString;
    },
    convertDate(data) {
      return moment(data).format('DD-MM-YYYY HH:mm:ss');
    },
    convertDateUtc(data) {
      return moment(data).utc().format('DD-MM-YYYY HH:mm:ss');
    },
    getUser() {
      let filter = {};
      this.userId = this.$route.params.id;
      if (this.$route.query && this.$route.query.from === 'recover') {
        filter = {
          is_deleted_user: true,
        };
      }
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}`, {
        params: {
          filter: filter,
        },
      }).then((result) => {
        if (result.status == 200) {
          this.user = result.data.data;
          const hashKey = this.user.registration_hash ? this.user.registration_hash : '';
          this.user.registrationHash = Config.default.SOCO_WEB_URL + `/quick-registration/verify?hash=${hashKey}`;
          if (this.user && this.user.user_name_lower) {
            this.getInviteeDetails();
            this.getInviteePhonebook();
            this.getInviteeEmail();
          }
        }
      });
    },
    formatDate(value) {
      if (value) {
        return moment(value).format('YYYY-MM-DD');
      } else {
        return '-';
      }
    },
    formatDateLong(value) {
      if (value) {
        return moment(value).locale('en').format('dddd, MMMM Do YYYY');
      } else {
        return '-';
      }
    },
    calculateDiff(createdAt, bpCompletedAt) {
      if (createdAt && bpCompletedAt) {
        const date1 = new Date(createdAt);
        const date2 = new Date(bpCompletedAt);

        // Calculate the difference in milliseconds
        const timeDifference = date2 - date1;

        // Convert milliseconds to days and round to 0 decimal places
        const differenceInDays = Math.round(timeDifference / (1000 * 60 * 60 * 24));

        return differenceInDays;
      } else {
        return '-';
      }
    },

    filterDate(date) {
      const filtered = new moment(date).format('DD - MMM - YYYY ');
      return filtered;
    },

    filterNewDate(date) {
      const filtered = new moment(date).format('DD/MMM/YYYY');
      return filtered;
    },

    getUserActivity() {
      this.userId = this.$route.params.id;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/activity-stats`).then((result) => {
        if (result.status == 200) {
          this.userActivity = result.data.data;
        }
      });
    },
    getActionUser() {
      this.userId = this.$route.params.id;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/user-actions/${this.userId}/stats`).then((results) => {
        if (results.status == 200) {
          this.userAction = results.data.data;
        }
      });
    },
    getActionUserLilla() {
      this.userId = this.$route.params.id;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/user-actions/${this.userId}/stats`, {
        params: {
          filter: {
            source: 'lilla',
          },
        },
      }).then((results) => {
        if (results.status == 200) {
          this.userActionLilla = results.data.data;
        }
      });
    },
    getLillaStats() {
      this.userId = this.$route.params.id;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/activity-stats/lilla`).then((results) => {
        if (results.status == 200) {
          this.userLillaStats = results.data.data;
        }
      });
    },
    getLillaProfile() {
      this.userId = this.$route.params.id;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/lilla-profile`).then((results) => {
        if (results.status == 200) {
          this.userLillaProfile = results.data.data;
        }
      });
    },
    childYears(child) {
      if (child.length) {
        const above3 = child.filter((item) => {
          if (item.date_of_birth !== null) {
            const ageInSeconds = new Date().getTime() - new Date(item.date_of_birth).getTime();
            return ageInSeconds > 3 * 365 * 86400 * 1000;
          }
        });
        if (above3.length) {
          return 'Yes';
        } else {
          return 'No';
        }
      }
    },
    getInviteeDetails() {
      this.userId = this.$route.params.id;
      this.isProcessingLoadMore = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users`, {
        params: {
          filter: {
            referral_code: this.user.user_name_lower,
          },
          fields: 'beauty_interest_created is_referral_point_referrer_received is_verified_phone email is_registered',
          limit: this.limit,
          skip: this.skip,
        },
      })
        .then((results) => {
          if (results && results.status == 200) {
            const data = results.data.data;
            if (data.length < this.limit) {
              this.isShowButtonLoadMore = false;
            }
            for (let i = 0; i < data.length; i++) {
              const user = data && data[i];
              if (user) {
                const beauty_created = user.beauty_interest_created ? true : false;
                const referral =
                  user.is_referral_point_referrer_received != undefined
                    ? user.is_referral_point_referrer_received
                    : false;
                this.userReferrals.push({
                  email: user.email,
                  is_verified_phone: user.is_verified_phone,
                  beauty_profile_created: beauty_created,
                  referral_point_referrer_received: referral,
                  is_registered: true,
                });
              }
            }
            this.skip += this.limit;
            this.isProcessingLoadMore = false;
          }
        })
        .catch((err) => {
          this.isProcessingLoadMore = false;
        });
    },
    getInviteePhonebook() {
      this.userId = this.$route.params.id;
      this.isProcessingLoadMorePhone = true;
      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + `/user-invitations`, {
        params: {
          filter: {
            invited_by: this.userId,
            invitation_mode: 'phone',
          },
          limit: this.limit,
          skip: this.skip,
        },
      })
        .then((results) => {
          if (results && results.status == 200) {
            const data = results.data.data;
            if (data.length < this.limit) {
              this.isShowButtonLoadMorePhone = false;
            }
            //for phonebook
            for (let i = 0; i < data.length; i++) {
              const user = data && data[i];
              if (user) {
                // const beauty_created = user.is_beauty_interest_tags_saved ? user.is_beauty_interest_tags_saved : false;
                // const referral = user.is_referral_point_received ? user.is_referral_point_received : false;
                // const is_verified_phone = user.is_verified_phone ? user.is_verified_phone : false;
                this.userInvitePhoneBook.push({
                  phone: user.phone_no,
                  is_verified_phone: user.is_verified_phone,
                  beauty_profile_created: user.is_completed_profile,
                  referral_point_referrer_received:
                    user.is_registered && user.is_completed_profile && user.is_verified_phone ? true : false,
                  is_registered: user.is_registered,
                });
              }
            }
            this.isProcessingLoadMorePhone = false;
          }
        })
        .catch((err) => {
          this.isProcessingLoadMorePhone = false;
        });
    },
    getInviteeEmail() {
      this.userId = this.$route.params.id;
      this.isProcessingLoadMoreEmail = true;
      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + `/user-invitations`, {
        params: {
          filter: {
            invited_by: this.userId,
            invitation_mode: 'email',
            is_registered: false,
          },
          limit: this.limit,
          skip: this.skip,
        },
      })
        .then((results) => {
          if (results && results.status == 200) {
            const data = results.data.data;
            if (data.length < this.limit) {
              this.isShowButtonLoadMoreEmail = false;
            }
            //for email
            for (let i = 0; i < data.length; i++) {
              const user = data && data[i];
              if (user) {
                const beauty_created = user.is_beauty_interest_tags_saved ? user.is_beauty_interest_tags_saved : false;
                const referral = user.is_referral_point_received ? user.is_referral_point_received : false;
                const is_verified_phone = user.is_verified_phone ? user.is_verified_phone : false;
                this.userReferralsNotRegistered.push({
                  email: user.email,
                  is_verified_phone: is_verified_phone,
                  beauty_profile_created: beauty_created,
                  referral_point_referrer_received: referral,
                  is_registered: user.is_registered,
                });
              }
            }
            this.isProcessingLoadMoreEmail = false;
          }
        })
        .catch((err) => {
          this.isProcessingLoadMoreEmail = false;
        });
    },
    exportDataToCSV(type) {
      if (type === 'old') {
        this.is_loading_export_data_old = true;
      } else if (type === 'new') {
        this.is_loading_export_data_new = true;
      }
      Axios.get(
        Config.default.MS_SOCO_ADMIN_API_URL +
          `/users/${this.userId}/points-history/export?is_new_format=${type === 'new'}`
      )
        .then((response) => {
          if (
            response.status == 200 &&
            response.data &&
            response.data.data &&
            response.data.data.url &&
            response.data.data.name
          ) {
            if (type === 'old') {
              this.is_loading_export_data_old = false;
            } else if (type === 'new') {
              this.is_loading_export_data_new = false;
            }
            this.exportCsv(null, response.data.data.name, response.data.data.url);
          }
        })
        .catch((err) => {
          this.is_loading_export_data_old = false;
          this.is_loading_export_data_new = false;
          throw err;
        });
    },

    exportDataUserDetailCSV() {
      this.is_loading_update_logs = true;
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.userId}/update-logs`)
        .then(() => {
          this.$toasted.global.show('User changes has been sent to your email');
          this.is_loading_update_logs = false;
        })
        .catch((err) => {
          this.is_loading_export_data_old = false;
          this.is_loading_export_data_new = false;
          throw err;
        });
    },

    resetPointsToZero() {
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/reset-points/${this.userId}`)
        .then((response) => {
          if (response.status === 200) {
            this.$toasted.global.show('Points have been reset to 0');
          }
        })
        .catch((err) => {
          this.$toasted.global.show('Please try again later');
          throw err;
        });
    },

    resendQuickRegistration(mode) {
      this.userId = this.$route.params.id;
      const params = { user_id: this.userId, mode: mode };
      return Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/user/resend/register-link`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$toasted.global.show('Quick Registration link sent');
          }
        })
        .catch((err) => {
          this.$toasted.global.show('Please try again later');
          throw err;
        });
    },
    exportUpdateLogsFields(data) {
      return (data || []).map((el) => {
        return {
          ...(el.updated_at && {
            Updated: this.convertDateUtc(el.updated_at),
          }),
          Changed_by: el?.changed_by?.email,
          user_id: el.user_id,
          field_changed: el.target,
          from_data: el.original_data,
          to_data: el.changed_data,
        };
      });
    },

    onSyncData() {
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/sync/${this.user._id}`)
        .then((response) => {
          if (response.status === 200) {
            this.$toasted.global.show('User data has been synced successfully', { icon: 'check' });
          }
        })
        .catch((err) => {
          this.$toasted.global.show('Please try again later');
          throw err;
        });
    },

    onResetViolationCounter() {
      const params = { violation_counter: 0, $unset: { last_spam_review_date: 1 } };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${this.user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.getUser();
            this.$toasted.global.show('Violation counter have been reset', { icon: 'check' });
          }
        })
        .catch((err) => {
          this.$toasted.global.show('Please try again later');
          throw err;
        });
    },

    openVerifyModal(status) {
      this.currentStatus = status;
      this.verifyReason = '';
      this.verifyModalOpen = true;
    },

    closeVerifyModal() {
      this.verifyModalOpen = false;
      this.verifyReason = '';
    },

    confirmVerifyAction() {
      if (!this.verifyReason.trim()) {
        this.$toasted.global.show('Reason is required!', { icon: 'error' });
        return;
      }

      const { user_name, phone_no, _id } = this.user;
      const status = this.currentStatus;
      const successText = status ? 'verified' : 'unverified';

      const payload = {
        _id,
        ...(user_name ? { user_name } : {}),
        is_verified_phone: status,
        reason: this.verifyReason,
      };

      this[status ? 'verify' : 'unverify'](payload)
        .then(() => {
          this.$toasted.global.show(`Phone ${phone_no} successfully ${successText}!`, { icon: 'check' });
          this.closeVerifyModal();
        })
        .catch((err) => {
          console.error(err);
        });
    },

    onShowModal() {
      this.$refs['modal-delete'].open();
    },

    onCancel() {
      this.picked = 'soft-delete';
    },

    onDelete() {
      const { _id: id, name } = this.user;
      const payload = this.optionsDelete.find(({ value }) => value == this.picked).payload;

      this.updateStatus({ id, payload }).then(() =>
        this.$router.push({ name: 'all-users' }, () =>
          this.$toasted.global.show(`${name} successfully deleted!`, { icon: 'check' })
        )
      );
    },
    hasActions(userRole) {
      const default_roles = ['soco_superadmin', 'soco_cs_team', 'soco_sbn_team'];
      const userRoleArray = userRole.split(',');
      // Create a set from the first array
      const set_default_roles = new Set(default_roles);

      // Check for common values in the second array
      for (const value of userRoleArray) {
        if (set_default_roles.has(value)) {
          return true;
        }
      }

      // If no common value is found
      return false;
    },
    showFormUser() {
      this.formUserName = !this.formUserName;
      this.formPhone = false;
      this.formEmail = false;
    },
    showFormEmail() {
      this.formEmail = !this.formEmail;
      this.formUserName = false;
      this.formPhone = false;
    },
    showFormPhone() {
      this.formPhone = !this.formPhone;
      this.formUserName = false;
      this.formEmail = false;
    },
    submitForm(event) {
      event.preventDefault();
    },
    recalculateTotalPaid() {
      const self = this;

      if (!self.user) {
        this.$toasted.global.show('Please try again later');
        return;
      }

      this.totalShoppingLoading = true;

      const payload = {
        is_vn: !this.user.country || (this.user.country && this.user.country.name !== 'Indonesia'),
        user_id: self.user._id,
      };
      return Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/jobs/user-fix-total-shopping`, payload)
        .then((response) => {
          if (response.status === 200) {
            self.user[this.designatedUserLevel].current.total_shopping = this.userTotalOrderPrice;
          } else {
            throw new Error('attempt to fix total shopping failed');
          }
        })
        .then(() => {
          self.syncTotalShoppingModalOpen = false;
          this.$toasted.global.show("Successfully recalculated User's total paid");
        })
        .catch((err) => {
          this.$toasted.global.show(err.message || 'Please try again later');
          throw err;
        })
        .finally(() => {
          this.totalShoppingLoading = false;
        });
    },
    submitEdit() {
      const self = this;
      const payload = {
        is_admin: true,
        evidence: this.evidence,
      };
      if (this.formUserName) {
        payload.user_name = self.user_name;
      } else if (this.formEmail) {
        payload.email = self.email;
      } else if (this.formDateBirth) {
        payload.birthday_date = this.selectBirthDate;
        payload.date_of_birth = this.selectBirthDate;
      } else {
        payload.phone_no = self.phone_no;
        payload.phone_code = self.phone_code;
        payload.phone_no_e164 = `${self.phone_code}${self.phone_no}`;
      }
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${self.user._id}`, payload)
        .then((response) => {
          if (response.status === 200) {
            self.getUser();
            self.$toasted.global.show('Data user has been updated', { icon: 'check' });
            if (this.formUserName) {
              self.user_name = '';
              self.showFormUser();
            } else if (this.formEmail) {
              self.email = '';
              self.showFormEmail();
            } else if (this.formDateBirth) {
              self.selectBirthDate = '';
              self.formDateBirth = false;
            } else {
              self.phone_no = '';
              self.showFormPhone();
            }
            self.modalOpen = false;
          }
        })
        .catch((err) => {
          this.$toasted.global.show('Please try again later');
          throw err;
        });
    },
    verifyEmail(email) {
      this.emailCheck.error = '';
      if (!this.email || this.errors.has('formEmailUser.email')) {
        return;
      }
      this.emailCheck.loading = true;
      this.isEmailAvailable = true;
      return axios
        .post(`${Config.default.MS_SOCO_PUBLIC_API_URL}/auth/email/check`, {
          email: email,
        })
        .then((response) => {
          if (response.status === 200 && response.data) {
            this.isEmailAvailable = this.email ? !response.data.data : true;
            if (response.data.data) {
              this.emailCheck.error = 'Email already registered with SOCO';
            }
          }
          return true;
        })
        .catch((error) => {
          if (error.response && error.response.data) {
            this.emailCheck.error = error.response.data.message;
            this.isEmailAvailable = false;
          }
        })
        .finally(() => {
          this.emailCheck.loading = false;
        });
    },
    onBlurInInputPhone(phone_no) {
      this.phoneCheck.loading = true;
      this.phoneCheck.error = '';
      const phone_code = this.selectedCountry.phone_code;
      this.checkPhoneNumberAvailability({ phone_no, phone_code })
        .then((response) => {
          const res = response.data;
          if ((typeof response == 'boolean' && response) || response.success) {
            this.isPhoneAvailable = typeof response == 'boolean' ? response : response.success;
          } else {
            let errMessage = res.errorCode;
            if (response.errorCode === 'ALREADY_TAKEN') {
              errMessage = 'Phone number already registered in SOCO.';
            } else if (response.errorCode === 'INVALID_PHONE_NUMBER') {
              errMessage = 'Your phone number was invalid. Please check again';
            } else if (res.is_registered_offline && !res.is_profile_created) {
              errMessage = 'Your phone number already registered in Sociolla Store.';
              this.isRegisteredOffline = true;
            } else if (res.is_registered_offline && !res.is_profile_completed) {
              errMessage = 'Your phone number already registered.';
            }
            this.phoneCheck.error = errMessage;
            this.isPhoneAvailable = false;
          }
        })
        .finally(() => (this.phoneCheck.loading = false));
    },
    getSummaryPointBalance() {
      if (this.userId) {
        this.pointSummary.loading = true;
        return axios
          .get(`${Config.default.MS_SOCO_PUBLIC_API_URL}/user/${this.userId}/point-transactions-summary`)
          .then((response) => (this.pointSummary.data = response.data.data))
          .finally(() => (this.pointSummary.loading = false));
      }
    },
    recalculatePointBalance() {
      return this.getSummaryPointBalance();
    },
    syncUserLevel(filter) {
      if (this.userId) {
        if (!filter) {
          this.syncLevel.loadingButton = true;
        }
        return axios
          .post(`${Config.default.MS_SOCO_ADMIN_API_URL}/tasks/user-level-correction`, {
            is_preview: filter && filter.is_preview,
            user_id: this.userId,
          })
          .then((response) => {
            if (response.data && response.data.data && response.data.data[0]) {
              this.syncLevel.data = response.data.data[0];
            }
          })
          .then(() => {
            if (this.syncLevel.confirmationModal) {
              this.syncLevel.loading = false;
            }
            if (!filter) {
              this.$toasted.global.show('User level have been synced');
              this.syncLevel.loadingButton = false;
              this.syncLevel.confirmationModal = false;
              this.getUser();
            }
          });
      }
    },
    syncTotalPoints() {
      if (this.userId && this.hasActions(this.userRole)) {
        this.totalPoints.loading = true;
        return axios
          .post(Config.default.MS_SOCO_ADMIN_API_URL + '/jobs/user-transactions-sync', {
            user_id: this.userId,
          })
          .then((response) => {
            if (response.data.success) {
              return axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/users/update-logs', {
                target: 'points',
                user_id: this.userId,
                original_data: this.user && this.user.points ? this.user.points.count : 0,
                changed_data: this.pointSummary.data,
              });
            }
          })
          .then(() => {
            this.$toasted.global.show('Points have been synced');
            this.totalPoints.loading = false;
            this.totalPoints.confirmationModal = false;
            this.getUser();
          })
          .catch(() => {
            this.totalPoints.loading = false;
          });
      }
    },
    onRecoverUser() {
      const { _id: id } = this.user;
      this.$dialog
        .confirm(`Do you want to recover ${this.user.name}?`)
        .then(() => this.updateStatus({ id, payload: { status: 'active', is_deleted: false } }))
        .then(() => this.getUser())
        .then(() =>
          this.$toasted.global.show(`Account ${this.user.name} successfully recover!`, {
            icon: 'check',
          })
        )
        .catch(console.log);
    },
    async decreaseOtpCounter() {
      try {
        const userId = this.$route.params.id;
        const url = `${Config.default.MS_SOCO_ADMIN_API_URL}/users/${userId}/daily-otp`;
        const response = await axios.delete(url);
        if (response.status === 200) {
          this.otpCount -= 1;
          return this.$toasted.global.show('Success Reset OTP', {
            icon: 'check',
          });
        }
        return this.$toast.error('Something went wrong....');
      } catch (error) {
        return this.$toast.error(error);
      }
    },
    async getOtpCount() {
      try {
        const url = `${Config.default.MS_SOCO_ADMIN_API_URL}/users/${this.$route.params.id}/otp-count`;
        const response = await axios.get(url);
        if (response.status === 200) {
          this.otpCount = response.data.data;
        }
      } catch (error) {
        console.error(error);
      }
    },
    openModalBirthDate() {
      this.modalBirthDate = true;
      this.formDateBirth = true;
      this.formUserName = false;
      this.formPhone = false;
      this.formEmail = false;
      this.$nextTick(() => {
        // Find the input element within the component and click it
        const inputElement = this.$refs.datetimePicker.$el.querySelector('input');
        if (inputElement) {
          inputElement.click();
          inputElement.style.display = 'none';
        } else {
          console.warn('Could not find input element in datetime picker');
        }
      });
    },
    async getUserTransactionHistory() {
      const response = await axios.get(`${Config.default.MS_SOCO_ADMIN_API_URL}/users/${this.userId}/points-history`, {
        params: {
          skip: this.userTransactionHistory.skip,
          limit: this.userTransactionHistory.limit,
        },
      });
      const transactions = response.data?.data || [];
      if (transactions.length) {
        this.userTransactionHistory.data = transactions;
      }
    },
    async getUserTransactionCount() {
      const response = await axios.get(
        `${Config.default.MS_SOCO_ADMIN_API_URL}/users/${this.userId}/points-history/count`
      );
      const count = response.data?.data || 0;
      this.userTransactionHistory.totalData = count;
      this.userTransactionHistory.totalPage = Math.ceil(count / this.userTransactionHistory.limit);
    },
    async userTransactionHistoryPagination(skip) {
      this.userTransactionHistory.skip = Number(skip || 0);
      this.userTransactionHistory.currentPage =
        Math.floor(this.userTransactionHistory.skip / this.userTransactionHistory.limit) + 1;
      this.getUserTransactionHistory();
    },
    async getOtpCount() {
      try {
        const url = `${Config.default.MS_SOCO_ADMIN_API_URL}/users/${this.$route.params.id}/otp-count`;
        const response = await axios.get(url);
        if (response.status === 200) {
          this.otpCount = response.data.data;
        }
      } catch (error) {
        console.error(error);
      }
    },
    async decreaseOtpCounter() {
      try {
        const userId = this.$route.params.id;
        const url = `${Config.default.MS_SOCO_ADMIN_API_URL}/users/${userId}/daily-otp`;
        const response = await axios.delete(url);
        if (response.status === 200) {
          this.otpCount -= 1;
          return this.$toasted.global.show('Success Reset OTP', {
            icon: 'check',
          });
        }
        return this.$toast.error('Something went wrong....');
      } catch (error) {
        return this.$toast.error(error);
      }
    },
    getExpiredTitle(transaction) {
      if (transaction.transaction_type !== "expired") {
        return transaction.title
      };
      let obj = transaction.object;
      while (obj?.transaction) {
        const parent = obj.transaction;
        const parentType = parent.transaction_type;
        const parentObj = parent.object;
        if (parentType && parentType !== "expired" && parentType !== "order") {
          // CASE: top-ten shopper review
          if (
            parentType === "verified" &&
            parentObj?.type === "add-review" &&
            (parentObj?.points_value === 30 || parent.points === 30)
          ) {
            return `Expired point from top-ten shopper review ${parentObj.product_name}`;
          }
          // CASE: verified review biasa
          if (parentType === "verified" && parentObj?.type === "add-review") {
            return `Expired point from Verified Review`;
          }
          if (
            parentType === "manual_commission" ||
            parentObj?.type === "soco_point_injection"
          ) {
            const name = parentObj?.name || parentObj?.id || "";
            return `Expired point from soco_point_injection from this id ${name}`.trim();
          }
          // CASE: fallback
          const formatted = parentType.charAt(0).toUpperCase() + parentType.slice(1);
          return `Expired point from ${formatted}`;
        }
        obj = parent.object;
      }
      return transaction.title;
    },

    getTransactionLink(transaction) {
      if (!transaction?.transaction_type || !transaction?.object) {
        return null;
      }

      const baseUrl = this.sociollaAdminUrl;
      const type = transaction.transaction_type;

      switch (type) {
        case 'order': {
          const orderId = transaction.object?.id;
          return orderId ? `${baseUrl}/orders/detail/${orderId}` : null;
        }

        case 'expired': {
          const orderId = transaction.object?.transaction?.object?.id;
          return orderId ? `${baseUrl}/orders/detail/${orderId}` : null;
        }

        case 'redeem': {
          const orderId = transaction.object?.id;
          return orderId ? `${baseUrl}/orders/detail/${orderId}` : null;
        }

        default:
          return null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/sass/partial/help-reset';
.list-actions {
  display: flex;
  padding-left: 0;
  list-style: none;
  @media (max-width: 991px) {
    flex-direction: column;
    gap: 10px;
  }
  > li {
    margin-right: 15px;
  }
}
.m-bottom-15 {
  margin-bottom: 15px;
}

textarea {
  width: 480px !important;
  height: 50px !important;
}

.sc__total_paid_text {
  color: #da2a52;
}

.form-filter-group {
  display: flex;
  .form-group {
    min-height: 0px;
    .form-input {
      position: relative;
      background-color: white;
      .input-date {
        padding-left: 4px;
        display: block;
        width: 100% !important;
        background-color: transparent !important;
        border: 1px solid #ddd !important;
      }
      .input-date-wrapper {
        width: 130px;
        font-size: 14px !important;
        padding: 0px 8px 0px 8px;
        position: relative;
        border-radius: 4px;
        background-color: transparent;
        border: 1px solid #ddd !important;
        background: none;
      }
      i {
        position: absolute;
        z-index: 9;
        right: 12px;
        font-size: 18px;
        top: 6px;
      }
    }
    label {
      font-size: 12px;
      margin-bottom: 5px;
      font-family: 'Lato-Bold', sans-serif;
      letter-spacing: 0.5px;
      color: #000000;
      text-transform: uppercase;
    }
    .filter-btn {
      margin-left: 12px;
      background-color: black;
      color: white;
      text-transform: uppercase;
      padding: 0px 12px 0px 12px;
      font-size: 14px;
      border-radius: 4px;
      justify-content: center;
    }
  }
}

.sc-form-table {
  display: flex;
  .sc-form-input-addon {
    .sc-area-addon {
      position: relative;
      .addon {
        &.username {
          width: 30px;
        }
        &.phone {
          min-width: 70px;
        }
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        top: 1px;
        left: 1px;
        bottom: 1px;
        z-index: 11;
        background-color: #f1f1f1;
        border-right: 1px solid #e5e5e5;
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
        font: 12px/14px 'lato-bold', sans-serif;
        color: #000;
      }
      input {
        &.username {
          padding-left: 35px;
        }
        &.phone {
          padding-left: 75px;
        }
      }
    }
    .dropdown-list-country {
      position: absolute;
      z-index: 10;
      background: white;
      border: 1px solid #ccc;
      list-style: none;
      padding-left: 2px;
      padding-top: 8px;
      margin: 0;
      min-width: 70px;
      max-height: 200px;
      overflow-y: auto;
      border-radius: 4px;

      li {
        display: flex;
        align-items: center;
        padding: 5px;
        cursor: pointer;
        font: 12px/14px 'lato-regular', sans-serif;

        img {
          width: 16px;
          margin-right: 5px;
        }

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }

    .alert {
      font: 12px/14px 'lato-regular', sans-serif;
      color: #da2a52;
      padding: 10px 0 0;
      margin: 0;
    }
  }
  .sc-form-table-input {
    width: 250px;
    font-size: 14px !important;
    height: auto !important;
    padding: 8px 15px;
    border-radius: 4px;
    background-color: #ffffff !important;
    border: 1px solid #ddd !important;
    margin-right: 15px;
  }
  .sc-btn-height-new {
    height: 36px;
    margin-right: 10px;
  }

  .sc__icon-flag {
    width: 20px;
    height: 14px;
    margin-right: 6px;
  }

  .sc__icon-triangle {
    margin-left: 8px;
    vertical-align: middle;
  }
}

.modal--confirmation,
.modal--sync-point-confirmation {
  .modal {
    z-index: 1040;
  }

  .modal-backdrop {
    z-index: 1030;
  }

  .modal-body {
    padding: 0 0 16px 0;
    width: 320px;
    background-color: #ffffff;
  }

  .content-wrapper {
    .content {
      padding: 0 20px 16px;
      position: relative;
      width: 320px;
      text-align: left;

      .modal-heading {
        letter-spacing: 1px;
        color: #000000;
        text-transform: uppercase;
        margin-bottom: 0;
        font: 13px/20px 'Lato-Bold', sans-serif;
        text-align: left;
      }

      .product-preview {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        border-radius: 4px;
        .confirmation-content {
          display: flex;
          flex-wrap: wrap;
          text-align: left;
          p {
            font-family: 'lato-regular', sans-serif;
            line-height: 28px;
          }
          .head-text {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 28px;
          }
          .main-text {
            font-size: 14px;
          }
          .sub-text {
            font-size: 10px;
            margin-top: 32px;
          }
        }
      }
    }
  }
  .content-wrapper .modal-header {
    position: relative;
    // padding: 0px 0px 20px;
    border-bottom: none;
    .close {
      background-color: transparent;
      position: absolute;
      right: 0;
      z-index: 2;
      opacity: 1;
      top: 0px;
      margin: 0;
      border: none;
    }
  }

  .content-wrapper .date-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 20px;
    .date-wrapper {
      width: 100%;
      max-width: 500px;
    }

    .date-item {
      margin-bottom: 20px;
    }

    .date-label {
      display: block;
      font-size: 16px;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .date-input {
      width: 100%;
      padding: 12px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background-color: white;
    }

    .date-input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }
  }

  .modal-footer {
    width: 100%;
    z-index: 11;
    padding: 16px 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: #ffffff;
    .btn {
      text-transform: uppercase;
      font-family: 'lato-bold', sans-serif;
      font-size: 13px;
      line-height: 18px;
      letter-spacing: 2px;
      text-align: center;
      color: #f8f8f8;
      width: auto;
      border-radius: 4px;
      padding: 9px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #da2a52;
      box-shadow: none;
      width: 100px;

      &.btn-red {
        background-color: #da2a52;
        color: white;
        border: 1px solid #da2a52;
      }
      &.btn-white {
        background-color: #ffffff;
        color: black;
        border: 1px solid #000000;
      }
    }
  }
  .hidden {
    display: none;
  }
}
.popup-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  width: 280px;
  margin-top: 4px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.popup-content {
  padding: 8px;
}

.option-content {
  display: flex;
  align-items: center;
}

/* Import this in your main CSS file */
/* @import 'vue-multiselect/dist/vue-multiselect.min.css'; */

/* Custom multiselect styling */
:deep(.multiselect__tags) {
  border-radius: 4px;
}

:deep(.multiselect__option--highlight) {
  background: #42b883;
}

:deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: #3aa876;
}
.country-flag {
  width: 16px;
  margin-right: 5px;
}
.otp-counter-container {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
}
</style>
