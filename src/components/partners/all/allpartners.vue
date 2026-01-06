<template src="./allpartners.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import downloadexcel from 'vue-json-excel';

export default {
  name: 'partner-all',
  components: {
    downloadexcel,
  },
  data() {
    return {
      allpartner: [],
      showModal: false,
      is_loading: true,
      totalPage: 0,
      currentPage: 1,
      search: '',
      from: '',
      to: '',
      partner_id: '',
      status: '',
      json_fields: {
        'User Name': 'name',
        'Mobile No': 'phone_no',
        'E-mail': 'email',
        'Points to redeem': 'points',
        'Nominal Conversion': 'exchange_amount',
        'Date of redeem': 'created_at',
      },
    };
  },

  created: function () {
    this.getallpartner();
  },
  methods: {
    getallpartner: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/partners', {
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
            this.allpartner = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    deletepartner: function (partner) {
      const self = this;
      const document = {};
      document.is_deleted = true;
      document.deleted_at = new Date();
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/partners/${partner._id}`, document).then((response) => {
            self.$toasted.global.show('Sucessfully delete partner.');
            self.getallpartner();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    async exportdata() {
      const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/redeems/${this.partner_id}`, {
        params: {
          filter: {
            created_at: {
              $gte: this.from,
              $lte: this.end,
            },
          },
        },
      });
      response.data.data.map(function (row) {
        row.points = Math.abs(row.points);
        row.phone_no = row.phone_number;
      });
      return response.data.data;
    },

    pagination: function (page) {
      this.$Progress.start();

      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/partners', {
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
            this.allpartner = response.data.data;
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
@import '_allpartners';
</style>
