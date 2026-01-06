<template src="./formTnc.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import TextEditor from 'components/forms/editor/TextEditor';

export default {
  name: 'form-tnc',
  components: {
    TextEditor,
  },
  data() {
    return {
      showModal: false,
      is_loading: true,
      tnc_id: null,
      tnc: {
        position: '',
        version: 'id',
        description: '',
      },
      state: {
        isProcess: false,
      },
      disabledButton: false,
    };
  },

  mounted() {
    this.fetchTnc();
  },

  methods: {
    formReset() {
      this.tnc.position = 0;
      this.tnc.version = 'id';
      this.tnc.description = '';
      this.is_loading = false;
    },

    fetchTnc() {
      this.tnc_id = this.$route.params.id;
      this.formReset();

      if (this.tnc_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/tnc', {
          params: { filter: { _id: this.tnc_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const tnc = response.data.data[0];
              this.tnc = tnc;
              if (this.tnc.source === 'sociolla') {
                this.tnc.version = 'id';
              } else {
                this.tnc.version = 'vn';
              }
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    saveTnc(scope) {
      const self = this;
      self.$validator.validateAll(scope).then((result) => {
        let setCheckDesc = self.tnc.description.replaceAll(/<p>/g, '');
        setCheckDesc = setCheckDesc.replaceAll(/<\/p>/g, '');
        const testDesc = !setCheckDesc.trim().length;
        if (result && self.tnc.description && !testDesc) {
          this.disabledButton = true;
          if (self.tnc_id) {
            Axios.put(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/' + self.tnc_id, self.tnc)
              .then((response) => {
                if (response.status === 200) {
                  this.disabledButton = false;
                  self.$router.push('/gamification/tnc/all');
                }
              })
              .catch((err) => {
                self.$Progress.fail();
                throw err;
              });
          } else {
            Axios.post(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/tnc', self.tnc)
              .then((response) => {
                if (response.status === 200) {
                  this.disabledButton = false;
                  self.$router.push('/gamification/tnc/all');
                }
              })
              .catch((err) => {
                this.disabledButton = false;
                self.$Progress.fail();
                throw err;
              });
          }
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'formTnc';
</style>
