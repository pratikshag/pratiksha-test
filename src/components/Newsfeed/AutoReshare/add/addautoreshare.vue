<template src="./addautoreshare.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'add-autoreshare',
  components: {},
  props: ['autoreshare_id'],
  data() {
    return {
      cat: this.autoreshare_id,
      editor: '',
      id: '',
    };
  },
  created: function () {},

  methods: {
    addautoreshare: function () {
      this.$Progress.start();
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/newsfeed-autoreshare', {
        name: this.editor,
      })
        .then((response) => {
          console.log(response);

          if (response.status === 200) {
            this.clicked = false;
            this.$Progress.finish();
            this.$router.push('/newsfeed/autoreshare');
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
