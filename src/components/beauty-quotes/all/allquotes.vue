<template src="./allquotes.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import downloadexcel from 'vue-json-excel';

export default {
  name: 'quotes-all',
  components: {
    downloadexcel,
  },
  data() {
    return {
      allquotes: [],
      showModal: false,
      is_loading: true,
      totalPage: 0,
      currentPage: 1,
      search: '',
      from: '',
      to: '',
      quotes_id: '',
      status: '',
      json_fields: {
        'User Name': 'name',
        'Mobile No': 'phone_no',
        'points to redeem': 'points',
        'Date of redeem': 'created_at',
      },
    };
  },

  created: function () {
    this.getallquotes();
  },
  methods: {
    getallquotes: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/beauty-quotes', {
        params: {
          filter: {
            is_deleted: { $ne: true },
          },
          skip: 0,
          limit: 10,
          sort: '-created_at',
        },
      })
        .then((response) => {
          this.is_loading = false;
          console.log(response);
          if (response.status === 200) {
            this.allquotes = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    deletequotes: function (quotes) {
      const self = this;
      const document = {};
      document.is_deleted = true;
      document.deleted_at = new Date();
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/beauty-quotes/${quotes._id}`, document).then(
            (response) => {
              this.$toasted.global.show('Sucessfully delete quotes.');
              this.getallquotes();
            }
          );
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    pagination: function (page) {
      this.$Progress.start();

      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/beauty-quotes', {
        params: {
          filter: {
            is_deleted: { $ne: true },
          },
          skip: skip,
          limit: 10,
          sort: '-created_at',
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.allquotes = response.data.data;
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

<style lang="scss" scoped>
@import '_allquotes';
</style>
