<template src="./list.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../config/default.env');
import sortField from '../ui/global/sortField';
import Multiselect from 'vue-multiselect';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'list',
  components: { sortField, Multiselect, DisplayPerPage, Pagination },
  data() {
    return {
      totalCount: {
        all: 0,
        old: 0,
        new: 0,
      },
      isDashboard: false,
      status: 'all',
      users: [],
      allUsers: '',
      email: '',
      user_name: '',
      name: '',
      phone_no: '',
      country: '',
      source: '',
      countries: [],
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
      roles: [
        { id: 'soco_superadmin', name: 'Super Admin' },
        { id: 'soco_cs_team', name: 'CS Team' },
        { id: 'soco_sbn_team', name: 'SBN Team' },
        { id: 'soco_bj_team', name: 'BJ Team' },
        { id: 'soco_content_team', name: 'Content Team' },
        { id: 'soco_freebies_team', name: 'Freebies Team' },
        { id: 'soco_event_team', name: 'Event Team' },
      ],
      new_role: [],
      showModalRoles: '',
      isLoadingOrders: false,
      orderCounts: {},
      totalOrderCounts: {},
    };
  },
  computed: {
    finalFilter() {
      const result = {};

      if (this.$route.query.roles) {
        result.role = { $regex: `${this.$route.query.roles}`, $options: 'i' };
      }

      result['is_deleted_user'] = false;

      return result;
    },
  },
  created: function () {
    this.loadInitialData();
  },
  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.skip / this.limit) + 1;
      this.loadInitialData(this.skip);
    },
    display(newLimit) {
      this.is_loading = true;
      this.limit = isNaN(Number(newLimit)) ? 10 : Number(newLimit);
      this.$nextTick(() => {
        this.loadInitialData().then(() => {
          this.is_loading = false;
        });
      });
    },
    loadInitialData() {
      this.is_loading = true;
      return Promise.all([this.getCountries(), this.getCount({ filter: this.finalFilter })])
        .then(() => {
          this.getUsers();
        })
        .catch((error) => {
          console.error('Error loading initial data:', error);
          this.is_loading = false;
        });
    },
    getUsers: function () {
      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
        params: {
          filter: this.finalFilter,
          limit: this.limit,
          skip: this.skip,
          sort: this.sortParam,
          fields: [
            '_id',
            'name',
            'user_name',
            'email',
            'created_at',
            'phone_no',
            'phone_no_e164',
            'country',
            'acquisition_source',
            'registered_from',
            'ip_address',
            'is_verified_phone',
            'role',
            'address',
            'lastActivity',
            'lastActivityDate',
          ].join(','),
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.users = response.data.data;
          }
        })
        .then(() => {
          if (this.users.length) {
            this.fetchOrderCounts();
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
        .finally(() => (this.is_loading = false));
    },

    getCountries: function () {
      this.is_loading = true;
      //For of now need only Asean country
      this.countries = [
        'Brunei',
        'Cambodia',
        'Indonesia',
        'Laos',
        'Malaysia',
        'Myanmar',
        'Philippines',
        'Singapore',
        'Thailand',
        'Vietnam',
      ];
      this.is_loading = false;
      // Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + "/users/countries")
      //     .then(response => {
      //         if (response.status === 200) {
      //             this.countries = response.data.data;
      //         }
      //     })
      //     .catch(err => {
      //         console.log(err);
      //         throw err;
      //     })
      //     .finally(() => (this.is_loading = false));
    },

    getCount: function (params = {}) {
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
          this.totalPage = Math.ceil(count / this.limit);
          return count;
        }
      });
    },

    searchQuery: async function (params = {}) {
      this.$Progress.start();
      this.is_loading = true;
      try {
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
          params: {
            sort: this.sortParam,
            filter: params,
          },
        });

        if (response.status === 200) {
          this.$Progress.finish();
          this.users = response.data.data;

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
      let filter = { $or: [], ...this.finalFilter };
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
      if (this.source) {
        filter['$or'].push({ acquisition_source: this.source });
      }
      if (this.country) {
        filter['$or'].push({ 'country.name': this.country });
      }
      filter = filter['$or'].length ? (filter['$or'].length === 1 ? filter['$or'][0] : filter) : {};
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
      const params = filter;
      this.searchQuery(params);
      this.getCount({ filter: params });
    },
    filterStatus(status) {
      this.user_name = '';
      this.name = '';
      this.email = '';
      (this.phone_no = ''), (this.country = ''), (this.source = ''), (this.status = status);
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
      const params = {
        sort: this.sortParam,
        skip: this.skip,
        limit: this.limit,
      };

      this.$Progress.start();
      page = parseInt(page);
      const skip = this.limit * (page - 1);
      this.posts = {};
      params.skip = skip;
      this.skip = params.skip;

      params.filter = this.finalFilter;
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users', {
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
          console.log(err);
          throw err;
        });
    },

    saveAdmin: function (user) {
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
          console.log(err);
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
          console.log(err);
          throw err;
        });
    },
    socoUserRoles: function (role) {
      const roles = this.roles.map(({ id }) => id);
      const userRoles = role.split(',').filter((role) => roles.includes(role));
      const filteredRoles = this.roles.filter(({ id }) => userRoles.includes(id));

      return filteredRoles.length ? filteredRoles.map(({ name }) => name).join(', ') : '';
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

    openPopupRoles(user) {
      const roles = this.roles.map(({ id }) => id);
      const current = user.role.split(',').filter((item) => roles.includes(item));

      this.new_role = this.roles.filter(({ id }) => current.includes(id));
      this.showModalRoles = user._id;
    },

    saveRoles() {
      // this.$Progress.start();
      // const new_role = this.new_role && this.new_role.length ? this.new_role.map(r => r.id) : []
      const roles = this.roles.map(({ id }) => id);
      const new_role = this.new_role.map(({ id }) => id) || [];
      const user_id = this.showModalRoles;
      const user_idx = this.users.findIndex((u) => u._id == user_id);

      if (user_idx > -1) {
        const old_role = this.users[user_idx].role.split(',').filter((item) => !roles.includes(item));
        const updated_role = old_role.concat(new_role).join(',');
        const is_admin_soco = !!new_role.length || false;

        this.users[user_idx].role = updated_role;
        const params = { role: updated_role, is_admin_soco };
        return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/users/${user_id}`, params)
          .then((response) => {
            if (response.status === 200) {
              this.$Progress.finish();
            }
            this.new_role = [];
            this.showModalRoles = '';
          })
          .catch((err) => {
            this.$Progress.fail();
            this.new_role = [];
            this.showModalRoles = '';
            console.log(err);
            throw err;
          });
      }
      this.new_role = [];
      this.showModalRoles = '';
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
  },
};
</script>

<style lang="scss" scoped>
@import './list';
</style>
