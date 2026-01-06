<template src="./editreward.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import Q from 'q';

export default {
  name: 'edit-reward',
  components: {},
  data() {
    return {
      reward_id: '',
      reward_type_id: '',
      is_loading: true,
      name: '',
      type: '',
      listuserlevel: '',
      rules: [],
      reward: '',
      point: '',
      image: '',
      status: '',
      from: '',
      to: '',
      no: '',
      id: '',
      pointtype: '',
      pointexp: '',
      actions: [],
      action: '',
      reward_types: [],
      reward_name: '',
      selected_reward_type: '',
      addMore: false,
      prev_level_id: '',
      prev_level_name: '',
      next_level_id: '',
      types: 'point',
      next_level_name: '',
      ruleTypes: [
        {
          name: 'Point',
          val: 'point',
        },
        {
          name: 'Count',
          val: 'count',
        },
        {
          name: 'Checkpoint',
          val: 'checkpoint',
        },
      ],
    };
  },
  created: function () {
    this.reward_id = this.$route.params.id;
    this.reward_type_id = this.$route.params.id1;
    this.currentRewards();
    this.getActions();
    this.getLevel();
    this.getRewardsType();
  },

  methods: {
    editactionlist: function () {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/' + this.id, {
        name: this.name,
        pointtype: this.pointtype,
        pointexp: this.pointexp,
      }).then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.$router.push('/gamification/view');
        }
      });
    },
    currentRewards: function () {
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards', {
        params: {
          filter: {
            _id: this.reward_id,
          },
        },
      }).then((response) => {
        console.log(response);
        this.is_loading = false;
        if (response.status === 200) {
          this.no = response.data.data[0].no;
          this.id = response.data.data[0]._id;
          this.selected_reward_type = response.data.data[0].reward_type_id;
          this.name = response.data.data[0].name;
          this.type = response.data.data[0].reward_name;
          this.listuserlevel = response.data.data[0].listuserlevel;
          this.rules = response.data.data[0].rules;
          this.point = response.data.data[0].point.value;
          this.prev_level_id = response.data.data[0].prev;
          this.next_level_id = response.data.data[0].next;
          this.image = response.data.data[0].image;
          this.status = response.data.data[0].status;
          this.reward_name = response.data.data[0].reward_name;
          this.rules.map(function (row) {
            if (row.gt_count) {
              row.type = 'count';
            } else if (row.gt_point) {
              row.type = 'point';
            } else if (row.multiple) {
              row.type = 'checkpoint';
            }
          });
        }
      });
    },
    getRewards: function () {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/' + this.id, {
        name: this.name,
        pointtype: this.pointtype,
        pointexp: this.pointexp,
      }).then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.$router.push('/gamification/view');
        }
      });
    },
    getRewardsType: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/reward-types/' + this.id).then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.reward_types = response.data.data;
        }
      });
    },
    getLevel: function () {
      const self = this;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/', {
        params: {
          filter: { reward_type_id: self.reward_type_id },
          limit: 20,
        },
      }).then((response) => {
        console.log(response);
        if (response.status === 200) {
          self.levels = response.data.data;
          self.levels.map(function (row) {
            if (self.next_level_id == row._id) {
              self.next_level_name = row.name;
            }
            if (self.prev_level_id == row._id) {
              self.prev_level_name = row.name;
            }
          });
        }
      });
    },
    getActions: function () {
      const self = this;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/actions/', {
        params: { limit: 50 },
      }).then((response) => {
        if (response.status === 200) {
          response.data.data.map(function (row) {
            self.actions.push({
              val: row._id,
              name: row.name,
            });
          });
        }
      });
    },
    addmore: function () {
      this.rules.push({
        action_id: '',
        type: '',
        gt_point: 0,
        gt_count: 0,
      });
    },

    imageUpload: function (e) {
      const self = this;
      const file = e.target.files[0];
      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: file.name,
            contentType: 'multipart/form-data',
          },
        });
      })
        .then(function (response) {
          console.log(response);
          self.image = response.data.data.url;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
        })
        .catch(function (error) {
          console.log(error);
        });
    },

    editreward: function () {
      const self = this;
      self.rules.map(function (row) {
        self.actions.map(function (action) {
          if (row.action_id == action.val) {
            row.name_slug = action.name;
            row.name = action.name;
          }
        });
      });
      const payload = {};
      payload.name = self.name;
      payload.point =
        self.reward_name == 'bagdes' ? { value: self.point, point_type: 'badges' } : { value: self.point };
      payload.status = self.status;
      payload.rules = self.rules;
      payload.image = self.image;
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/' + self.id, payload).then((response) => {
        if (response.status === 200) {
          self.$router.push(`/gamification/view/${self.reward_type_id}`);
        }
      });
    },
  },
};
</script>
