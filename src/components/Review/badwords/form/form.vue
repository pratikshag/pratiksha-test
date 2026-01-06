<template src="./form.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  name: 'form-badword-review',

  components: {},

  data() {
    return {
      is_loading: false,

      record_id: null,
      record: {},

      temp: {
        name: '',
      },
    };
  },

  watch: {
    $route(newVal, oldVal) {
      this.initRecord();
    },
  },

  mounted: function () {
    this.initRecord();
  },

  methods: {
    initRecord() {
      this.formReset();
      this.record_id = this.$route.params.id;

      if (this.record_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words', {
          params: {
            filter: { _id: this.record_id },
          },
        })
          .then((response) => {
            console.log(response.data);
            this.is_loading = false;
            if (response.status == 200 && response.data.data.length > 0) {
              const record = response.data.data[0];
              this.record = record;
              this.temp = record;
            } else {
              this.formReset();
            }
          })
          .catch((err) => {
            this.is_loading = false;
            throw err;
          });
      }
    },

    saveForm() {
      this.$validator.validateAll('form').then((result) => {
        if (result) {
          if (this.record_id) {
            this.updRecord();
          } else {
            this.addRecord();
          }
        }
      });
    },

    addRecord() {
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words', {
        name: this.temp.name,
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.$router.push('/review/badwords');
          }
        })
        .catch((err) => {
          this.is_loading = false;
          throw err;
        });
    },

    updRecord() {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/bad-words/' + this.record_id, {
        name: this.temp.name,
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.$router.push('/review/badwords');
          }
        })
        .catch((err) => {
          this.is_loading = false;
          throw err;
        });
    },

    formReset() {
      this.record_id = null;
      this.record = {};
      this.temp = {
        name: '',
      };
    },
  },
};
</script>
