<template src="./editzodiac.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'edit-zodiac',
  components: {},
  data() {
    return {
      horoscopes_id: '',
      allzodiac: '',
      is_loading: true,
      name: '',
      startdate: '',
      enddate: '',
      id: '',
    };
  },
  created: function () {
    this.horoscopes_id = this.$route.params.id;
    return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscopes', {
      params: {
        filter: {
          _id: this.horoscopes_id,
        },
      },
    })

      .then((response) => {
        console.log(response);
        this.is_loading = false;
        if (response.status === 200) {
          this.id = response.data.data[0]._id;
          this.name = response.data.data[0].name;
          this.startdate = response.data.data[0].start_date;
          this.enddate = response.data.data[0].end_date;
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  },

  methods: {
    editzodiac: function () {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscopes/' + this.id, {
        name: this.name,
        start_date: this.startdate,
        end_date: this.enddate,
      }).then((response) => {
        console.log(response);
        if (response.status === 200) {
          this.$router.push('/horoscope/zodiac');
        }
      });
    },
  },
};
</script>
