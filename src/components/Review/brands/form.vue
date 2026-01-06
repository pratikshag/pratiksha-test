<template src="./form.html"></template>

<script>
const Config = require('../../../../config/default.env');
import Axios from 'axios';
import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import Croppa from 'vue-croppa';

Vue.use(Croppa);

export default {
  name: 'brand-form',
  components: { Multiselect },

  data() {
    return {
      is_loading: false,
      data: {},
      uploadisProcess: false,
      temp: {
        name: '',
        description: '',
        logo: '',
        banner: '',
        meta_title: '',
        meta_description: '',
        meta_keyword: '',
        is_active_in_review: true,
        short_description: '',
      },
      showModalLogo: false,
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      isSaveCrop: false,
      changeImage: false,
      state: {
        isProcess: false,
      },
      buttonName: 'Save',
    };
  },

  computed: {
    hash_id() {
      return this.$route.params.id;
    },
  },

  watch: {
    data(newData, oldData) {
      this.applyTempData(newData);
    },
  },

  mounted() {
    this.fetchData();
  },

  methods: {
    formReset() {
      this.temp.logo = '';
      this.temp.banner = '';
      this.temp.name = '';
      this.temp.description = '';
      this.temp.meta_title = '';
      this.temp.meta_description = '';
      this.temp.meta_keyword = '';
      this.temp.short_description = '';
    },
    uploadImage(e) {
      this.uploadisProcess = true;
      this.$toasted.global.show('image uploading... ');
      const file = e.target.files[0];
      const fileName = this.sanitizeFileName(file.name);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        this.temp.logo = e.target.result;
      };
      ///processing upload
      // this.isSaveCrop = true

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/pre-signed-url`, {
        params: {
          fileName: fileName,
          contentType: file.type,
        },
      })
        .then((response) => {
          const url = response.data.data.signedUrl.split('?')[0];
          delete Axios.defaults.withCredentials;

          return Axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': file.type },
          }).then((response) => {
            this.$toasted.global.show('image upload success! ');
            this.uploadisProcess = false;
            Axios.defaults.withCredentials = true;
            console.log(url);
            this.temp.logo = url;

            // this.showModalLogo = false;
            // this.isFileChoose = false;
            // this.isSaveCrop = false;
            // this.changeImage = false
          });
        })
        .catch((err) => {
          this.uploadisProcess = false;
          this.$toasted.global.error('image upload failed! ');
          console.log(err);
        });
    },

    fetchData() {
      const self = this;
      this.formReset();
      // if(!self.hash_id) self.$router.push({ name: 'brandList' })

      if (self.hash_id) {
        self.is_loading = true;
        self.buttonName = 'Update';
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/brands', {
          params: {
            filter: { _id: self.hash_id },
          },
        })
          .then((response) => {
            self.is_loading = false;
            if (response.status == 200 && response.data.data && response.data.data[0]) {
              self.data = response.data.data[0];
            } else {
              self.$router.push({ name: 'brand-list' });
            }
          })
          .catch((err) => {
            self.is_loading = false;
            self.$router.push({ name: 'brand-list' });

            console.log(err);
            throw err;
          });
      }
    },

    applyTempData(data) {
      this.temp.logo = data.logo;
      this.temp.name = data.name;
      this.temp.banner = data.desktop_banner;
      this.temp.description = data.description;
      this.temp.meta_title = data.meta_title;
      this.temp.meta_description = data.meta_description;
      this.temp.meta_keyword = data.meta_keyword;
      this.temp.is_active_in_review = data.is_active_in_review;
      this.temp.short_description = data.short_description;
    },

    save() {
      const self = this;
      if (self.hash_id) {
        Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/brands/' + self.hash_id, {
          logo: this.temp.logo,
          name: this.temp.name,
          description: this.temp.description,
          meta_title: this.temp.meta_title,
          meta_description: this.temp.meta_description,
          meta_keyword: this.temp.meta_keyword,
          is_active_in_review: this.temp.is_active_in_review,
          short_description: this.temp.short_description,
        })
          .then((response) => {
            self.is_loading = false;
            if (response.status == 200) {
              alert('Success');
              self.$router.push({ name: 'brand-list' });
            }
          })
          .catch((err) => {
            self.is_loading = false;
            alert(err.response.data.message);
            throw err;
          });
      } else {
        Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/brands', {
          logo: this.temp.logo,
          name: this.temp.name,
          description: this.temp.description,
          meta_title: this.temp.meta_title,
          meta_description: this.temp.meta_description,
          meta_keyword: this.temp.meta_keyword,
          is_active_in_review: this.temp.is_active_in_review,
          short_description: this.temp.short_description,
        })
          .then((response) => {
            self.is_loading = false;
            if (response.status == 200) {
              alert('Success');
              self.$router.push({ name: 'brand-list' });
            }
          })
          .catch((err) => {
            self.is_loading = false;
            alert(err.response.data.message);
            throw err;
          });
      }
    },

    onFileSizeExceed(file) {
      this.fileSizeExceed = true;
      this.isFileChoose = false;
    },
    onFileChoose() {
      this.isFileChoose = true;
      this.fileSizeExceed = false;
      this.state.isFileChoose = true;
      this.state.fileSizeExceed = false;
    },

    saveCrop() {
      const file = this.croppa.getChosenFile();
      const fileName = this.sanitizeFileName(file.name);
      this.isSaveCrop = true;

      this.croppa.generateBlob((blob) => {
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/pre-signed-url`, {
          params: {
            fileName: fileName,
            contentType: blob.type,
          },
        })
          .then((response) => {
            const url = response.data.data.url;
            delete Axios.defaults.withCredentials;

            return Axios.put(response.data.data.signedUrl, blob, {
              headers: { 'Content-Type': blob.type },
            }).then((response) => {
              console.log(response);
              Axios.defaults.withCredentials = true;
              this.temp.logo = url;

              this.showModalLogo = false;
              this.isFileChoose = false;
              this.isSaveCrop = false;
              this.changeImage = false;
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }, 'image/jpeg');
    },

    sanitizeFileName(fname) {
      // 489-file-name-2.jpg
      // spaces, brackets, quotes cause issue with slider regexes
      return (Math.ceil(Math.random() * 1000) + '-' + String(fname)).replace(/ /g, '-').replace(/('|\(|\))/g, '');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_form';
</style>
