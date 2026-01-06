<template src="./rewardlist.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'reward-list',

  components: {},
  data() {
    return {
      allreward: [],
      is_loading: true,
      search: '',
      totalPage: 0,
      currentPage: 1,
    };
  },

  created: function () {
    this.getallreward();
  },
  methods: {
    getallreward: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/reward-types', {
        params: {
          skip: 0,
          limit: 10,
        },
      })
        .then((response) => {
          console.log(response);
          this.is_loading = false;
          if (response.status === 200) {
            this.allreward = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    searchQuery: function () {
      this.$Progress.start();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/reward-types', {
        params: {
          filter: {
            name: {
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
            this.allreward = response.data.data;
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
      const skip = 2 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/reward-types', {
        params: {
          skip: skip,
          limit: 10,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.allreward = response.data.data;
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
  },
};
</script>
