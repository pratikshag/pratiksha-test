<template src="./allBanneduser.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';

export default {
  name: 'all-banneduser',
  components: { sortField },
  data() {
    return {
      allBanneduser: [],

      currentPage: 1,
      totalPage: 1,
      search: '',

      sortParam: 'username',
      is_loading: true,
    };
  },

  created: function () {
    this.getallBanneduser();
  },
  methods: {
    getallBanneduser: function () {
      this.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser', {
        params: {
          sort: this.sortParam,
          skip: 0,
          limit: 10,
        },
      })
        .then((response) => {
          console.log(response);

          if (response.status === 200) {
            this.allBanneduser = response.data.data;
             this.is_loading = false;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    trash: function (id) {
      Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser/' + id, {}).then((response) => {
        if (response.status == 200) {
          this.getallBanneduser();
        }
      });
    },

    searchQuery: function () {
      this.$Progress.start();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser', {
        params: {
          sort: this.sortParam,
          filter: {
            username: {
              $regex: this.search,
              $options: 'i',
            },
          },
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.allBanneduser = response.data.data;
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
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser', {
        params: {
          sort: this.sortParam,
          skip: skip,
          limit: 10,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.allBanneduser = response.data.data;
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
