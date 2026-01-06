<template src="./editactionlist.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'edit-action-list',
  components: {},
  data() {
    return {
      is_loading: true,
      actions_id: '',
      no: '',
      useraction: '',
      id: '',
      pointtype: '',
      pointexp: '',
    };
  },
  created: function () {
    this.actions_id = this.$route.params.id;
    return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/actions', {
      params: {
        filter: {
          _id: this.actions_id,
        },
      },
    })

      .then((response) => {
        console.log(response);
        this.is_loading = false;
        if (response.status === 200) {
          this.no = response.data.data[0].my_sql_id;
          this.id = response.data.data[0]._id;
          this.useraction = response.data.data[0].name;
          this.pointtype = response.data.data[0].type;
          this.pointexp = response.data.data[0].point;
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  },

  methods: {
    editactionlist: function () {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/actions/' + this.id, {
        name: this.name,
        type: this.pointtype,
        point: this.pointexp,
      }).then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.$router.push('/gamification/actionlist');
        }
      });
    },
  },
};
</script>
