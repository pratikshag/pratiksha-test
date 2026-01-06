<template src="./allcampaign.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import downloadexcel from 'vue-json-excel';
import Multiselect from 'vue-multiselect';
import moment from 'moment';

let cancelSearchResource;

export default {
  name: 'campaign-all',
  components: {
    downloadexcel,
    Multiselect,
  },
  data() {
    return {
      allCampaign: [],
      showModal: false,
      is_loading: true,
      totalPage: 0,
      currentPage: 1,
      search: '',
      from: '',
      to: '',
      addWinner: false,
      campaign_id: '',
      status: '',
      json_fields: {
        'User Name': 'user_name',
        'User Email': 'email',
        'Date Join': 'created_at',
      },
      allUser: [],
      users: [],
      points_earned: 0,
    };
  },

  created: function () {
    this.getallCampaign();
  },
  methods: {
    nameWithUsername({ name, user_name }) {
      return `${name} — (${user_name})`;
    },

    getallCampaign: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/campaigns', {
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
            this.allCampaign = response.data.data;
            this.allCampaign.map(function (row) {
              row.users = '';
              row.winners.map(function (winner) {
                row.users = row.users + winner.email + ', ';
              });
            });
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
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/campaigns', {
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
              this.allCampaign = response.data.data;
              this.allCampaign.map(function (row) {
                row.users = '';
                row.winners.map(function (winner) {
                  row.users = row.users + winner.email + ', ';
                });
              });
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    searchUser(e) {
      if (typeof cancelSearchResource === 'object') {
        cancelSearchResource.cancel();
      }
      const CancelToken = Axios.CancelToken;
      cancelSearchResource = CancelToken.source();
      if (e.length > 3) {
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/users/search', {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              keyword: e,
            },
            fields: 'name user_name _id email image',
            skip: 0,
            limit: 100,
            sort: '-created_at',
          },
        })
          .then((response) => {
            console.log(response);
            if (response.status === 200) {
              this.allUser = response.data.data;
            }
          })
          .catch((err) => {
            if (Axios.isCancel(err)) {
              return 'cancel';
            }
            console.log(err);
            throw err;
          });
      }
    },

    addWinners(users, points_earned) {
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/campaigns/${this.campaign_id}/winners`, {
        user_id: users._id,
        email: users.email,
        name: users.name,
        user_name: users.user_name,
        image: users.image,
        points: points_earned,
      })
        .then((response) => {
          if (response.status === 200) {
            this.addWinner = false;
            this.$toasted.global.show('Sucessfully added winners');
            this.$router.go();
          }
        })
        .catch((err) => {
          console.log(err);
          if (err.response && err.response.data) {
            if (err.response.data.errorCode === 'USER_NOT_JOINED') {
              this.$toasted.global.show('User is not joined the campaign');
            } else if (err.response.data.errorCode === 'DUPLICATE_USER') {
              this.$toasted.global.show('User is already a winner');
            }
          } else {
            this.$toasted.global.show(err.message);
          }
          throw err;
        });
    },

    notifyWinners() {
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/campaigns/${this.campaign_id}/winners/notify`)
        .then((response) => {
          if (response.status === 200) {
            const notified_winners = response.data.data || [];
            if (notified_winners.length > 0) {
              this.$toasted.global.show(
                `Succesfully notified (points, email, notification) - ${notified_winners.map((w) => w.name)}`
              );
            } else {
              this.$toasted.global.show(`All winners already notified`);
            }
          }
        })
        .catch((err) => {
          console.log(err);
          if (err.response && err.response.data && err.response.data.errorCode === 'CAMPAIGN_ONGOING') {
            this.$toasted.global.show(`Campaign is still active`);
          } else {
            this.$toasted.global.show(`ERR: ${err.message}`);
          }
          throw err;
        });
    },

    filterBystatus: function (status) {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/campaigns', {
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
            this.allCampaign = response.data.data;
            this.allCampaign.map(function (row) {
              row.users = '';
              row.winners.map(function (winner) {
                row.users = row.users + winner.email + ', ';
              });
            });
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    deleteCampaign: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/campaigns/${id}`).then((response) => {
            self.$toasted.global.show('Sucessfully delete campaign.');
            self.getallCampaign();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    async exportdata() {
      const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/campaigns/${this.campaign_id}/export`, {
        params: {
          filter: {
            created_at: {
              $gte: this.from,
              $lte: this.end,
            },
          },
        },
      });
      return response.data.data;
    },

    pagination: function (page) {
      this.$Progress.start();

      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/campaigns', {
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
            this.allCampaign = response.data.data;
            this.allCampaign.map(function (row) {
              row.users = '';
              row.winners.map(function (winner) {
                row.users = row.users + winner.email + ', ';
              });
            });
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    isCampaignExpired(endDate) {
      return moment(new Date()).format('YYYY-MM-DD') <= moment(endDate).format('YYYY-MM-DD');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_allcampaign';
</style>
