<template src="./editBanneduser.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'edit-banneduser',
  components: {},
  data() {
    return {
      banneduser_id: '',
      is_loading: true,
      username: '',
      id: '',
    };
  },
  created: function () {
    this.banneduser_id = this.$route.params.id;
    return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser', {
      params: {
        filter: {
          _id: this.banneduser_id,
        },
      },
    })

      .then((response) => {
        console.log(response);
        this.is_loading = false;
        if (response.status === 200) {
          this.username = response.data.data[0].username;
          this.id = response.data.data[0]._id;
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  },

  methods: {
    editBanneduser: function () {
      this.$Progress.start();
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/banneduser/' + this.id, {
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
