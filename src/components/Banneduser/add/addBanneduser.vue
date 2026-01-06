<template src="./addBanneduser.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'add-banneduser',
  components: {},
  props: ['banneduser_id'],
  data() {
    return {
      cat: this.banneduser_id,
      username: '',
      id: '',
    };
  },
  created: function () {},

  methods: {
    addBanneduser: function () {
      this.$Progress.start();
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser', {
        username: this.username,
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.clicked = false;
            this.$Progress.finish();
            this.$router.push('/banneduser/all');
            console.log(response);
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
