<template src="./newsfeed-autoreshare.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'newsfeed-autoreshare',
  components: {},
  data() {
    return {
      newsfeedautoreshare: [],
      is_loading: true,
      search: '',
      totalPage: 0,
      currentPage: 1,
    };
  },

  created: function () {
    this.getnewsfeedautoreshare();
  },
  methods: {
    getnewsfeedautoreshare: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-autoreshare', {
        params: {
          skip: 0,
          limit: 1000,
          sort: '-created_at',
        },
      })
        .then((response) => {
          console.log(response);
          this.is_loading = false;
          if (response.status === 200) {
            this.newsfeedautoreshare = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    trash: function (id) {
      Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-autoreshare/' + id, {}).then((response) => {
        if (response.status == 200) {
          this.getnewsfeedautoreshare();
        }
      });
    },

    searchQuery: function () {
      this.$Progress.start();
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-autoreshare', {
        params: {
          filter: {
            'user.name': {
              $regex: this.search,
              $options: 'i',
            },
          },
          sort: '-created_at',
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.newsfeedautoreshare = response.data.data;
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
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-autoreshare', {
        params: {
          skip: skip,
          limit: 10,
          sort: '-created_at',
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.newsfeedautoreshare = response.data.data;
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
