<template src="./addreward.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import Q from 'q';

export default {
  name: 'add-reward',
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
      tmp_image: '',
      status: false,
      from: '',
      to: '',
      no: '',
      id: '',
      pointtype: '',
      pointexp: '',
      actions: [],
      action: '',
      reward_types: [],
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
    this.reward_type_id = this.$route.params.id;
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
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/reward-types/').then((response) => {
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

    editreward: function () {
      const reward_type_id = this.reward_type_id;
      const self = this;
      let reward_name = null;

      self.$validator.validateAll('formReward').then((result) => {
        if (result) {
          self.reward_types.forEach(function (data) {
            if (reward_type_id == data._id) {
              reward_name = data.name;
            }
          });

          self.rules.forEach(function (data) {
            self.actions.forEach(function (action) {
              if (data.action_id == action.val) {
                data.name_slug = action.name;
                data.name = action.name;
              }
            });
          });

          const payload = {};
          payload.name = self.name;
          payload.point = reward_name == 'bagdes' ? { value: self.point, point_type: 'badges' } : { value: self.point };
          payload.status = self.status;
          payload.reward_type_id = reward_type_id;
          payload.reward_name = reward_name;
          payload.rules = self.rules;
          payload.image = self.image;

          Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards', payload).then((response) => {
            if (response.status === 200) {
              self.$router.push(`/gamification/view/${self.reward_type_id}`);
            }
          });
        }
      });
    },

    imageUpload: function (e) {
      const self = this;
      self.image = 'uploading';
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
          self.tmp_image = response.data.data.url;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
        .then((response) => {
          self.image = self.tmp_image;
          Axios.defaults.withCredentials = true;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
};
</script>
