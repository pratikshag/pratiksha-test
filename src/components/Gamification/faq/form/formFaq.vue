<template src="./formFaq.html"></template>
<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');
import TextEditor from 'components/forms/editor/TextEditor';

export default {
  name: 'form-faq',
  components: {
    TextEditor,
  },
  data() {
    return {
      showModal: false,
      is_loading: true,
      faq_id: null,
      faq: {
        position: '',
        version: 'id',
        title: '',
        description: '',
      },
      state: {
        isProcess: false,
      },
      disabledButton: false,
    };
  },

  mounted() {
    this.fetchFaq();
  },

  methods: {
    formReset() {
      this.faq.position = 0;
      this.faq.version = 'id';
      this.faq.title = '';
      this.faq.description = '';
      this.is_loading = false;
    },

    fetchFaq() {
      this.faq_id = this.$route.params.id;
      this.formReset();

      if (this.faq_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/faq', {
          params: { filter: { _id: this.faq_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const faq = response.data.data[0];
              this.faq = faq;
              if (this.faq.source === 'sociolla') {
                this.faq.version = 'id';
              } else {
                this.faq.version = 'vn';
              }
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    saveFaq(scope) {
      const self = this;
      self.$validator.validateAll(scope).then((result) => {
        let setCheckTitle = self.faq.title.replaceAll(/<p>/g, '');
        setCheckTitle = setCheckTitle.replaceAll(/<\/p>/g, '');
        const testTitle = !setCheckTitle.trim().length;
        let setCheckDesc = self.faq.description.replaceAll(/<p>/g, '');
        setCheckDesc = setCheckDesc.replaceAll(/<\/p>/g, '');
        const testDesc = !setCheckDesc.trim().length;
        if (result && self.faq.title && !testTitle && self.faq.description && !testDesc) {
          this.disabledButton = true;
          if (self.faq_id) {
            Axios.put(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/' + self.faq_id, self.faq)
              .then((response) => {
                if (response.status === 200) {
                  this.disabledButton = false;
                  self.$router.push('/gamification/faq/all');
                }
              })
              .catch((err) => {
                this.disabledButton = false;
                self.$Progress.fail();
                throw err;
              });
          } else {
            Axios.post(Config.default.MS_SOCO_PUBLIC_API_URL + '/feature-config/faq', self.faq)
              .then((response) => {
                if (response.status === 200) {
                  this.disabledButton = false;
                  self.$router.push('/gamification/faq/all');
                }
              })
              .catch((err) => {
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
@import 'formFaq';
</style>
