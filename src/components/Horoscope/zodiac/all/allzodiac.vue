<template src="./allzodiac.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'all-zodiac',
  components: {},
  data() {
    return {
      allzodiac: [],
      is_loading: true,
    };
  },

  created: function () {
    this.getallzodiac();
  },
  methods: {
    getallzodiac: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscopes', {})
        .then((response) => {
          console.log(response);
          this.is_loading = false;
          if (response.status === 200) {
            this.allzodiac = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
  },
};
</script>
