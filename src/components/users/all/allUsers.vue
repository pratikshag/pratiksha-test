<template src="./allUsers.html"></template>
<script>
import moment from 'moment';
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

const usersSearchFields =
  '_id,name,user_name,email,created_at,phone_no_e164,phone_code,phone_no,country,acquisition_source,registered_from,ip_address,orderCount,orderCreated,is_admin_soco,is_expert_reviewer,expert_role,is_featured_expert_user,is_verified_phone,ip_address';

export default {
  name: 'all-users',
  components: { sortField, DisplayPerPage, Pagination },
  data() {
    return {
      totalCount: {
        all: 0,
        old: 0,
        new: 0,
      },
      filter: {
        date: {
          from: '',
          to: '',
        },
      },
      isDashboard: false,
      status: 'all',
      users: [],
      allUsers: '',
      id: '',
      email: '',
      user_name: '',
      name: '',
      phone_no: '',
      phone_no_e164: '',
      country: '',
      source: '',
      countries: [],
      filter_expertise: [
        {
          name: 'Yes',
          value: true,
        },
        {
          name: 'No',
          value: false,
        },
      ],
      showUserActivityModal: false,
      currentUserActivity: [],
      limit: 10,
      skip: 0,
      numPages: 0,
      page: 1,
      category: '',
      all: 0,
      editorial: 0,
      admin: 0,
      contributor: 0,
      author: 0,
      community: 0,
      noedit: true,
      role: '',
      show: true,
      totalPage: 1,
      currentPage: 1,
      currentTotalRecord: 0,
      is_loading: false,
      sortParam: '-created_at',
      is_expert_reviewer: null,
      expert_role: 'content_creator',
      ip_address: '',
      modalSaveAdmin: false,
      selectedUser: {},
      isLoadingOrders: false,
      orderCounts: {},
      totalOrderCounts: {},
      order_created_from: '',
      order_created_to: '',
    };
  },
  computed: {
    userRole() {
      return this.$store.state.userrole;
    },
    isSbnOrCs() {
      return this.userRole.includes('soco_sbn_team') || this.userRole.includes('soco_cs_team');
    },
    makeAndRemoveAdminAccess() {
      return this.userRole.includes('superadmin');
    },
    getTotalData() {
      return Math.ceil(this.currentTotalRecord / this.limit);
    },
  },
  created: function () {
    this.loadInitialData();
  },
  methods: {
    formatDate(value, isTable = false) {
      return moment(value).format(isTable ? 'DD MMM YYYY' : 'YYYY-MM');
    },
    setSkip(skipValue, useId) {
      this.skip = Number(skipValue || 0);
      this.currentPage = Math.floor(this.skip / this.limit) + 1;
      this.pagination(this.currentPage);
    },
    display(newLimit) {
      this.is_loading = true;
      this.limit = isNaN(Number(newLimit)) ? 10 : Number(newLimit);
      this.skip = 0;
      this.currentPage = 1;
      this.$nextTick(() => {
        this.loadInitialData().then(() => {
          this.is_loading = false;
        });
      });
    },
    async loadInitialData() {
      this.is_loading = true;
      try {
        const filter = this.buildFilter();

        await Promise.all([this.getCountries(), this.getCount({ filter: filter })]);

        await this.pagination(1);

        if (this.users.length) {
          this.fetchOrderCounts();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        this.is_loading = false;
      }
    },

    buildFilter() {
      let filter = { $or: [] };

      if (this.email) {
        filter['$or'].push({ email: this.email });
      }
      if (this.user_name) {
        filter['$or'].push({ user_name_lower: this.user_name.toLowerCase() });
      }
      if (this.name) {
        filter['$or'].push({ name: this.name });
      }
      if (this.phone_no) {
        filter['$or'].push({ phone_no: this.phone_no });
      }
      if (this.phone_no_e164) {
        filter['$or'].push({ phone_no_e164: this.phone_no_e164 });
      }
      if (this.ip_address) {
        filter['$or'].push({ ip_address: this.ip_address });
      }

      const criteria_date = {};
      if (this.filter && this.filter.date && this.filter.date.from) {
        criteria_date['$gte'] = `${this.filter.date.from} 00:00:00`;
      }
      if (this.filter && this.filter.date && this.filter.date.to) {
        criteria_date['$lte'] = `${this.filter.date.to} 23:59:59`;
      }
      if (Object.keys(criteria_date).length > 0) {
        filter['$or'].push({ created_at: criteria_date });
      }

      if (this.source) {
        filter['$or'].push({ acquisition_source: this.source });
      }
      if (this.country) {
        filter['$or'].push({ 'country.name': this.country });
      }
      if (this.id) {
        filter['$or'].push({ _id: this.id });
      }

      filter = filter['$or'].length ? filter : {};

      if (this.isDashboard) {
        filter.is_verified_phone = true;
        if (this.status === 'old') {
          filter.is_verified_phone = true;
          filter.created_at = { $lt: '2020-5-5' };
        } else if (this.status === 'new') {
          filter.is_verified_phone = true;
          filter.created_at = { $gte: '2020-5-5' };
        }
      }

      if (this.is_expert_reviewer !== null) {
        filter.is_expert_reviewer = this.is_expert_reviewer;
        filter.status = 'active';
      }

      filter['is_deleted_user'] = false;

      return filter;
    },
    async validateFilter() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) {
        const firstError = this.errors.items[0];
        const errMsg = `Error in "${firstError.field}": ${firstError.msg}`;
        this.$toasted.global.error(errMsg);
        throw new Error(errMsg);
      }
    },
    async fetchOrderCounts() {
      if (!this.users.length) {
        return;
      }

      this.isLoadingOrders = true;
      try {
        const params = {
          userIds: this.users.map((user) => user._id),
        };

        if (this.order_created_from) {
          params.order_created_from = this.order_created_from;
        }
        if (this.order_created_to) {
          params.order_created_to = this.order_created_to;
        }

        const response = await Axios.post(`${Config.default.MS_SOCO_ADMIN_API_URL}/users/order-counts`, params);

        if (response.status === 200) {
          this.orderCounts = response.data.data.orderCounts;
          this.totalOrderCounts = response.data.data.totalOrderCounts;
        }
      } catch (error) {
        console.error('Error fetching order counts:', error);
      } finally {
        this.isLoadingOrders = false;
      }
    },
    gotoPage(page) {
      this.pagination(page);
    },
    async getUsers() {
      this.is_loading = true;
      try {
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
          params: {
            limit: this.limit,
            skip: this.skip,
            sort: this.sortParam,
            filter: {
              is_deleted_user: false,
            },
            fields: usersSearchFields,
          },
        });

        if (response.status === 200) {
          this.users = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        this.is_loading = false;
      }
    },

    getCountries: function () {
      this.is_loading = true;
      const params = {
        filter: {
          is_active: true,
        },
        skip: 0,
        limit: 0,
        sort: 'name',
      };
      //For of now need only Asean country
      // this.countries = [
      //   'Brunei',
      //   'Cambodia',
      //   'Indonesia',
      //   'Laos',
      //   'Malaysia',
      //   'Myanmar',
      //   'Philippines',
      //   'Singapore',
      //   'Thailand',
      //   'Vietnam',
      // ];
      this.is_loading = false;
      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/countries', {
        params: params,
      })
        .then((response) => {
          if (response.status === 200) {
            this.countries = response.data.data.filter((res) => res);
          }
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },
    convertDate(dateString) {
      const correctedDateString = dateString.replace(' GM', ' GMT');
      const date = new Date(correctedDateString);
      return moment(date).format('DD-MM-YYYY HH:mm:ss');
    },
    async getCount(params = {}) {
      await this.validateFilter();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/count', {
        params: params,
      }).then((response) => {
        this.is_loading = false;
        if (response.status == 200) {
          let count = parseInt(response.data.data);
          if (isNaN(count)) {
            count = 0;
          }

          this.currentTotalRecord = count;
          this.totalPage = count;
          return count;
        }
      });
    },

    searchQuery: async function (params = {}) {
      this.$Progress.start();
      this.is_loading = true;

      try {
        await this.validateFilter();
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
          params: {
            sort: this.sortParam,
            filter: params,
            fields: usersSearchFields,
          },
        });

        if (response.status === 200) {
          this.$Progress.finish();
          this.users = response.data.data;

          // Fetch order counts if we have users
          if (this.users.length) {
            this.fetchOrderCounts();
          }
        }
      } catch (err) {
        this.$Progress.fail();
        throw err;
      } finally {
        this.is_loading = false;
      }
    },
    filterData: function () {
      const filter = this.buildFilter();
      this.searchQuery(filter);
      this.getCount({ filter: filter });
    },
    filterStatus(status) {
      this.user_name = '';
      this.name = '';
      this.email = '';
      this.id = '';
      (this.phone_no = ''), (this.country = ''), (this.source = ''), (this.status = status), (this.phone_no_e164 = '');
      this.filterData();
    },
    showDashboard() {
      this.isDashboard = !this.isDashboard;
      if (this.isDashboard) {
        this.getAllWidgetCount();
        this.filterData();
      } else {
        this.filterStatus('all');
      }
    },
    async getAllWidgetCount() {
      const result = await Promise.all([
        this.getCount({ filter: { is_verified_phone: true } }),
        this.getCount({
          filter: { is_verified_phone: true, created_at: { $lt: '2020-5-5' } },
        }),
        this.getCount({
          filter: { is_verified_phone: true, created_at: { $gte: '2020-5-5' } },
        }),
      ]);
      this.totalCount.all = result[0];
      this.totalCount.old = result[1];
      this.totalCount.new = result[2];
    },
    pagination(page) {
      this.$Progress.start();
      page = parseInt(page);
      const skip = this.limit * (page - 1);
      this.skip = skip;
      const filter = this.buildFilter();

      const params = {
        sort: this.sortParam,
        skip: this.skip,
        limit: this.limit,
        filter: filter,
        fields: usersSearchFields,
      };

      return Axios.get(`${Config.default.MS_SOCO_ADMIN_API_URL}/users`, {
        params: params,
      })
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.users = response.data.data;
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        });
    },
    handleSaveAdmin(user) {
      this.modalSaveAdmin = true;
      this.selectedUser = user;
    },
    saveAdmin: function (user) {
      this.modalSaveAdmin = false;
      this.$Progress.start();
      user.is_admin_soco = true;
      this.show = false;
      const params = { is_admin_soco: true };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            // this.users = response.data.data
            this.noedit = true;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        });
    },

    removeAdmin: function (user) {
      this.$Progress.start();
      user.is_admin_soco = false;
      this.show = false;
      const params = { is_admin_soco: false };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            // this.users = response.data.data
            this.noedit = true;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        });
    },

    saveExpertise: function (user) {
      const self = this; // Store reference to 'this'

      this.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          user.is_expert_reviewer = true;
          user.expert_role = 'content_creator';
          const selected = user.expert_role;
          self.show = false; // Use 'self' instead of 'this'
          const params = { is_expert_reviewer: true, expert_role: selected };
          return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params).then((response) => {
            if (response.status === 200) {
              self.$toasted.global.show('Success change to expert reviewer');
              // self.users = response.data.data
              self.noedit = true;
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    saveFeatured: function (user) {
      this.$Progress.start();
      this.show = false;
      const params = { is_featured_expert_user: !user.is_featured_expert_user };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            if (!user.is_featured_expert_user) {
              this.$toasted.global.show('Success change to featured user');
            } else {
              this.$toasted.global.show('Success removed from featured user');
            }
            // this.users = response.data.data
            this.noedit = true;
            user.is_featured_expert_user = !user.is_featured_expert_user;
          }
        })
        .catch((err) => {
          this.$toasted.global.error(err.response.data.errorCode);
          this.$Progress.fail();
          throw err;
        });
    },

    removeExpertise: function (user) {
      this.$Progress.start();
      user.is_expert_reviewer = false;
      user.is_featured_expert_user = false;
      this.show = false;
      const params = { is_expert_reviewer: false, expert_role: null, is_featured_expert_user: false };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.$toasted.global.show('Success remove expert reviewer');
            // this.users = response.data.data
            this.noedit = true;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        });
    },

    showUserActivity: function (userActivity) {
      this.showUserActivityModal = true;
      this.currentUserActivity = userActivity.reduce((acc, iterator) => {
        acc.push({
          date: iterator.created_at.split('T')[0],
          name: iterator.action.name,
        });
        return acc;
      }, []);
    },

    sort(sort) {
      this.sortParam = sort;
      this.pagination(1);
    },

    onexpertRole(user) {
      this.$Progress.start();
      const selected = this.$refs.expert_role[0].value;
      const params = { expert_role: selected, is_expert_reviewer: true };
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user._id}`, params)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.$toasted.global.show('Success update the expert role');
            this.noedit = true;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          throw err;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
::v-deep .sc-table {
  th {
    font-size: 10px;
  }

  td {
    span {
      font-size: 12px;
      color: #292929;
    }

    .expert-role {
      padding: 4px;
      margin: 3px 0;
      font-size: 12px !important;
      color: rgb(34, 93, 66);
    }
  }
}

.sc-btn-md {
  &.cancel {
    color: white;
    background: red;
  }

  &.proceed {
    color: white;
    background: green;
  }
}
</style>
