<template src="./allFaq.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'faq-all',
  components: {},

  data() {
    return {
      data: [],
      is_loading: true,
    };
  },

  created: function () {
    this.fetchData();
  },
  methods: {
    fetchData: function () {
      this.is_loading = true;
      this.data = [];

      Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/faq', {
        params: { filter: { is_deleted: false } },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;
          }
        })
        .catch((err) => {
          this.is_loading = false;
          console.log(err);
          throw err;
        });
    },
    trash: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading = true;
          Axios.delete(Config.default.MS_SOCO_PUBLIC_API_URL + `/feature-config/${id}`).then((response) => {
            self.is_loading = true;
            if (response.status == 200) {
              self.fetchData();
            }
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },
  },
};
</script>
<style lang="scss" scoped>
.w-20 {
  width: 20%;
}
.text-pink {
  color: #da709e;
  font-size: 18px;
}
</style>
