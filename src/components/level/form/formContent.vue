<template src="./formContent.html"></template>
<script>
import Axios from 'axios';
import Vue from 'vue';
const Config = require('../../../../config/default.env');
import Croppa from 'vue-croppa';
import Q from 'q';

Vue.use(Croppa);

export default {
  name: 'form-content',

  components: {},
  data() {
    return {
      showModal: false,
      is_loading: true,
      level_id: null,
      level: {
        image: '',
        title: '',
        description: '',
      },
      name: '',

      tmp_image: '',
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      isSaveCrop: false,
      changeImage: false,
      state: {
        isProcess: false,
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }, { align: [] }],
      ],
    };
  },

  mounted() {
    this.fetchLevel();
  },

  methods: {
    formReset() {
      this.level.image = '';
      this.level.title = '';
      this.level.description = '';
      this.is_loading = false;
      this.name = '';
    },

    fetchLevel() {
      this.level_id = this.$route.params.id;
      this.formReset();

      if (this.level_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/levels', {
          params: { filter: { _id: this.level_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const level = response.data.data[0];
              // this.level.id = level._id
              if (!level.content) {
                level.content = {};
              }
              this.level.title = level.content.title;
              this.level.description = level.content.description;
              this.level.image = level.content.image;
              this.name = level.name;
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    saveLevel(scope) {
      const self = this;

      self.$validator.validateAll(scope).then((result) => {
        if (result) {
          Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/rewards/' + this.level_id + '/contents', self.level)
            .then((response) => {
              if (response.status === 200) {
                self.$router.push('/level/all');
              }
            })
            .catch((err) => {
              self.$Progress.fail();
              throw err;
            });
        }
      });
    },

    triggerUpload() {
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
    getTypeSubmit(val) {
      this.dataArticle.submit = val;
      this.dataArticle.article_status = val;
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
      const typeFile = file.type;

      const cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
      this.level.image = '';
      this.state.isProcess = true;

      this.isSaveCrop = true;
      const self = this;
      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: fileName,
            contentType: typeFile,
          },
        });
      })
        .then(function (response) {
          self.tmp_image = response.data.data.url;
          // self.dataArticle.url = response.data.data.url;
          self.showModal = false;
          self.isFileChoose = false;
          self.isSaveCrop = false;
          self.changeImage = false;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, cropFile, {
            headers: { 'Content-Type': typeFile },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          // this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', image_url);
          // this.uploadEditor.resetUploader();
          //set state
          this.state.isProcess = false;
          self.level.image = self.tmp_image;
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
@import 'formContent';
</style>
