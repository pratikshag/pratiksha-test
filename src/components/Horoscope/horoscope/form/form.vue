<template src="./form.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import Multiselect from 'vue-multiselect';

export default {
  name: 'form-badword-review',

  components: { Multiselect },

  data() {
    return {
      is_loading: false,
      dataZodiac: [],

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
    this.getZodiac();
  },

  methods: {
    getZodiac: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscopes', {
        params: { limit: 50 },
      })
        .then((response) => {
          if (response.status == 200) {
            this.dataZodiac = ((response.data && response.data.data) || []).map((el) => {
              return {
                id: el._id,
                name: el.name,
              };
            });
          }
        })
        .catch((err) => {
          throw err;
        });
    },

    initRecord() {
      this.formReset();
      this.record_id = this.$route.params.id;

      if (this.record_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscope-posts', {
          params: {
            filter: { _id: this.record_id },
          },
        })
          .then((response) => {
            this.is_loading = false;
            if (response.status == 200 && response.data.data.length > 0) {
              const record = response.data.data[0];
              record.publish_method = 'immediate';

              if (record.publish_at) {
                record.publish_at = this.dateFormat_Ymd(record.publish_at, '-');
                if (this.dateFormat_Ymd(null, '-') != record.publish_at) {
                  record.publish_method = 'scheduled';
                }
              }

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

    saveForm(status) {
      this.$validator.validateAll('form').then((result) => {
        if (result) {
          if (this.record_id) {
            this.updRecord(status);
          } else {
            this.addRecord(status);
          }
        }
      });
    },

    addRecord(status) {
      Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscope-posts', {
        ...this.serializeData(),
        status,
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.$router.push('/horoscope/all');
          }
        })
        .catch((err) => {
          this.is_loading = false;
          throw err;
        });
    },

    updRecord(status) {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/horoscope-posts/' + this.record_id, {
        ...this.serializeData(),
        status,
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.$router.push('/horoscope/all');
          }
        })
        .catch((err) => {
          this.is_loading = false;
          throw err;
        });
    },

    serializeData() {
      if (this.temp.publish_method == 'immediate') {
        this.temp.publish_at = this.dateFormat_mdY(null, '-');
      }

      return {
        horoscope: this.temp.horoscope,
        title: this.temp.title,
        summary: this.temp.summary,
        content: this.temp.content,
        publish_at: this.temp.publish_at,
      };
    },

    formReset() {
      this.record_id = null;
      this.record = {};
      this.temp = {
        name: '',
        publish_method: 'immediate',
      };
    },
  },
};
</script>
