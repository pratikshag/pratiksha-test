<template src="./formRecomendationQuiz.html"></template>
<script>
import Axios from 'axios';
import Vue from 'vue';
const Config = require('../../../../config/default.env');
import selectTags from './selectTags';
import Croppa from 'vue-croppa';

Vue.use(Croppa);

import Q from 'q';

export default {
  name: 'form-recomendation-quiz',

  components: { selectTags },
  data() {
    return {
      showModal: false,
      is_loading: true,
      record_id: null,
      data: {
        question: '',
        options: [],
        is_active: false,
      },
      tags: [],
      indexImage: null,
      optionEmptySchema: { option: 'example', tags: 'kulit_putih', image: '' },

      tmp_image: '',
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      isSaveCrop: false,
      changeImage: false,
      state: {
        isProcess: false,
      },
    };
  },

  mounted() {
    this.fetchRecord();
    this.fetchTags();
  },

  methods: {
    formReset() {
      this.data = {
        question: '',
        options: [
          { ...this.optionEmptySchema },
          { ...this.optionEmptySchema },
          { ...this.optionEmptySchema },
          { ...this.optionEmptySchema },
        ],
        is_active: false,
      };

      this.is_loading = false;
    },

    fetchRecord() {
      this.banner_id = this.$route.params.id;
      this.formReset();

      if (this.banner_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/recommendation/quiz/', {
          params: { filter: { _id: this.banner_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const record = response.data.data[0];

              this.record_id = record._id;
              this.data.question = record.question;
              this.data.options = record.options;
              this.data.is_active = record.is_active;
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    saveData(scope) {
      const self = this;
      this.$validator.validateAll(scope).then((result) => {
        console.log(scope, result);

        if (result) {
          if (this.banner_id) {
            Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/recommendation/quiz/' + this.record_id, this.data)
              .then((response) => {
                console.log(response);
                if (response.status == 200) {
                  self.$router.push('/recommendation/quiz');
                }
              })
              .catch((err) => {
                self.$Progress.fail();
                throw err;
              });
          } else {
            Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/recommendation/quiz', self.data)
              .then((response) => {
                console.log(response);
                if (response.status == 200) {
                  self.$router.push('/recommendation/quiz');
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

    fetchTags() {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/tags/', {
        params: { type: 'beauty-profile' },
      }).then((response) => {
        if (response.status == 200 && response.data.data && response.data.data.length > 0) {
          this.tags = response.data.data;
        }
      });
    },

    changeTags(indexOption, tagCode) {
      this.data.options[indexOption].tags = tagCode;
    },

    addOption() {
      this.data.options.push(this.optionEmptySchema);
    },

    delOption(index) {
      this.data.options.splice(index, 1);
    },

    triggerUpload(indexImage) {
      this.indexImage = indexImage;
      this.showImageUploader();
      this.fileSizeExceed = false;
      this.showModal = true;
    },

    showImageUploader() {
      this.changeImage = true;
    },
    generateChar(endNumber) {
      let randStr = '';

      for (let i = 1; i <= 300; i++) {
        randStr += 'a';
      }

      return randStr;
    },
    getBase64(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        this.uploadEditor.fileBaseString64 = reader.result;
      }.bind(this);
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    },
    handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      if (file.size > 5242880) {
        this.uploadEditor.errors = {};
        this.uploadEditor.errors.message = 'Maximum image size 5MB.';
        return;
      }

      if (this.uploadEditor.errors) {
        this.uploadEditor.errors = false;
      }

      this.getBase64(file);
      this.uploadEditor.Editor = Editor;
      this.uploadEditor.cursorLocation = cursorLocation;
      this.uploadEditor.resetUploader = resetUploader;
      this.uploadEditor.fileName = file.name;
      // set state process
      this.state.isProcess = true;
    },
    onFileSizeExceed(file) {
      this.fileSizeExceed = true;
      this.isFileChoose = false;
    },
    onFileChoose() {
      this.isFileChoose = true;
      this.fileSizeExceed = false;
    },
    saveCrop() {
      const file = this.croppa.getChosenFile();
      const fileName = file.name;

      const cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
      this.data.options[this.indexImage].image = 'uploading';

      this.state.isProcess = true;

      this.isSaveCrop = true;
      const self = this;
      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: fileName,
            contentType: 'multipart/form-data',
          },
        });
      })
        .then(function (response) {
          console.log(response);
          self.tmp_image = response.data.data.url;
          // self.dataArticle.url = response.data.data.url;
          self.showModal = false;
          self.isFileChoose = false;
          self.isSaveCrop = false;
          self.changeImage = false;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, cropFile, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          // this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', image_url);
          // this.uploadEditor.resetUploader();
          //set state
          this.state.isProcess = false;
          self.data.options[self.indexImage].image = self.tmp_image;
        })
        .catch((err) => {
          this.state.isProcess = false;
          console.log(err);
        });
    },
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    },
    dataURItoBlob(dataURI) {
      const arr = dataURI.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const byteString = atob(dataURI.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mime });
    },
    toggleHeightMultiselect() {
      // var $fieldMultiselectEl = document.querySelectorAll('.fieldarea--multiselect');
      // var heigtWrap = document.querySelectorAll('.fieldarea--multiselect .multiselect__tags-wrap')[0].offsetHeight;
      // $fieldMultiselectEl.css({ marginBottom: heigtWrap });
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'formRecomendationQuiz';
</style>
