<template src="./list-roles.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../config/default.env');
import sortField from '../ui/global/sortField';

export default {
  name: 'list-roles',
  components: { sortField },
  data() {
    return {
      roles: [],
      currentPage: 0,
      totalPage: 1,
      search: '',
      sortParam: 'title',
      is_loading: false,
    };
  },

  created: function () {
    this.getRoles();
  },
  methods: {
    async convertResponse(data) {
      const result = [];

      const keys = Object.keys(data);
      if (keys && keys.length) {
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const role_key = `soco_${key}`;
          if (key != 'community') {
            result.push({
              role_name_key: role_key,
              role_name: `${data[key].title}`,
              access_list: data[key].menus ? this.getAccessList(data[key].menus) : 'No Access',
              total_users: await this.getTotalUsers(role_key),
            });
          }
        }
      }

      return result;
    },
    getAccessList(menus) {
      let result = '';

      if (menus && Object.keys(menus).length) {
        const keys = Object.keys(menus);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          result += `${i > 0 ? `, ` : ``}${key}`;
        }
      }

      return result;
    },
    async getTotalUsers(key) {
      return await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/count', {
        params: {
          filter: {
            is_admin_soco: true,
            role: { $regex: `${key}`, $options: 'i' },
          },
        },
      })
        .then(async (response) => {
          let result = 0;
          if (response.status == 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }
            result = count;
          }
          return result;
        })
        .catch((err) => 0);
    },
    getRoles: function () {
      this.is_loading = true,
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/auth/roles', {
        params: {
          sort: this.sortParam,
          skip: 0,
          limit: 10,
        },
      })
        .then(async (response) => {
          if (response.status === 200) {
            this.roles = await this.convertResponse(response.data.data);
            this.is_loading = false;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    trash: function (id) {
      Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/auth/roles/' + id, {}).then((response) => {
        if (response.status == 200) {
          this.getRoles();
        }
      });
    },

    searchQuery: function () {
      this.$Progress.start();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/auth/roles', {
        params: {
          sort: this.sortParam,
          filter: {
            role_name: {
              $regex: this.search,
              $options: 'i',
            },
          },
        },
      })
        .then(async (response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.roles = await this.convertResponse(response.data.data);
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },

    pagination: function (page) {
      this.$Progress.start();
      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/auth/roles', {
        params: {
          sort: this.sortParam,
          skip: skip,
          limit: 10,
        },
      })
        .then(async (response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.roles = await this.convertResponse(response.data.data);
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },

    sort(sort) {
      this.sortParam = sort;
      this.pagination(1);
    },
  },
};
</script>
