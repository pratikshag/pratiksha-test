<template src="./allvoucher.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import downloadexcel from 'vue-json-excel';

export default {
  name: 'voucher-all',
  components: {
    downloadexcel,
  },
  data() {
    return {
      allVoucher: [],
      showModal: false,
      is_loading: true,
      totalPage: 0,
      currentPage: 1,
      search: '',
      from: '',
      voucherInfo: {},
      to: '',
      voucher_id: '',
      status: true,
      json_fields: {
        'Name Voucher': 'vouhcer_name',
        'Title Voucher': 'vouhcer_title',
        'User Name': 'user_name',
        'Points Value': 'vouhcer_points_value',
        'Date Used': 'created_at',
        'Redeem Code': 'redeem_code',
      },
    };
  },

  created: function () {
    this.getallVoucher();
  },
  methods: {
    getallVoucher: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/vouchers', {
        params: {
          skip: 0,
          limit: 10,
          sort: '-created_at',
        },
      })
        .then((response) => {
          this.is_loading = false;
          console.log(response);
          if (response.status === 200) {
            this.allVoucher = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    searchQuery(e) {
      if (e.keyCode === 13) {
        this.pagination.skip = 0;
        this.pagination.currentPage = 1;
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/vouchers', {
          params: {
            filter: {
              title: { $regex: this.search, $options: 'i' },
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
              this.allVoucher = response.data.data;
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    filterBystatus: function (status) {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/vouchers', {
        params: {
          filter: {
            is_active: status,
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
            this.allVoucher = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    deleteVoucher: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/vouchers/${id}`).then((response) => {
            self.$toasted.global.show('Sucessfully delete voucher.');
            self.getallVoucher();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    async exportdata() {
      const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/vouchers/${this.voucher_id}/export`, {
        params: {
          filter: {
            created_at: {
              $gte: this.from,
              $lte: this.end,
            },
            status: 'redeemed',
          },
        },
      });
      const self = this;

      response.data.data.map(function (row) {
        row.vouhcer_name = self.voucherInfo.name;
        row.vouhcer_title = self.voucherInfo.title;
        row.vouhcer_points_value = self.voucherInfo.points_value;
      });
      console.log(response.data.data);
      return response.data.data;
    },

    pagination: function (page) {
      this.$Progress.start();

      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/vouchers', {
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
            this.allVoucher = response.data.data;
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
@import '_allvoucher';
</style>
