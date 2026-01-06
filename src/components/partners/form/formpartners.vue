<template src="./formpartners.html"></template>
<script>
import Q from 'q';
const Config = require('../../../../config/default.env').default;
import Axios from 'axios';
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import { ImageDrop } from 'quill-image-drop-module';
import { ImageResize } from '@/shared/package/quill-image-resize';
import Croppa from 'vue-croppa';

Vue.use(Croppa);

export default {
  name: 'form-partner',
  components: {
    ImageDrop,
    ImageResize,
    VueEditor,
  },

  data() {
    return {
      partner_id: null,
      subcat_id: null,
      data: {
        name: '',
        logo: '',
        description: '',
        type: '',
        parent_category: null,
        parent_category_name: '',
        image: null,
        terms_condition: '',
        add_phone_message: '',
        redeem_success_message: '',
        redeem_values: [{ point: 0, value: 0 }],
      },
      item_id: '',
      clicked: false,
      showMsg: false,
      msg: '',
      categories: [],
      showModal: false,
      changeImage: false,
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      uploadEditor: {
        fileBaseString64: '',
        fileName: '',
        result: '',
        Editor: '',
        cursorLocation: '',
        resetUploader: '',
        errors: false,
      },
      isSaveCrop: false,
      state: {
        isProcess: false,
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }, { align: [] }],
        ['image', 'video', 'link'],
      ],
      customModulesForEditor: [
        { alias: 'imageDrop', module: ImageDrop },
        { alias: 'imageResize', module: ImageResize },
      ],
      editorSettings: {
        modules: {
          imageDrop: true,
          imageResize: {
            displaySize: {},
          },
        },
      },
    };
  },
  mounted: function () {
    this.fecthpartner();
  },
  methods: {
    addCustomValue() {
      this.data.redeem_values.push({ point: 0, value: 0 });
    },
    removeCustomValue() {
      this.data.redeem_values.pop();
    },
    resetForm() {
      this.partner_id = null;
      this.data.title = null;
      this.data.logo = null;
      this.data.terms_condition = null;
      this.data.add_phone_message = null;
      this.data.redeem_success_message = null;
      this.data.is_type = null;
    },
    fecthpartnerById(partner_id, callback) {
      return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/partners', {
        params: {
          filter: {
            _id: partner_id,
          },
        },
      })
        .then((response) => callback(response))
        .catch((err) => {
          throw err;
        });
    },
    fecthpartner() {
      const self = this;
      this.resetForm();
      if (this.$route.params && this.$route.params.id != null) {
        const partner_id = this.$route.params.id;

        this.fecthpartnerById(partner_id, function (response) {
          if (response.status == 200 && response.data.data.length) {
            const record = response.data.data[0];
            self.partner_id = record._id;

            self.data.name = record.name ? record.name : '';
            self.data.redeem_values = record.redeem_values ? record.redeem_values : [{ point: 0, value: 0 }];
            self.data.logo = record.logo ? record.logo : '';
            self.data.terms_condition = record.terms_condition ? record.terms_condition : '';
            self.data.add_phone_message = record.add_phone_message ? record.add_phone_message : '';
            self.data.redeem_success_message = record.redeem_success_message ? record.redeem_success_message : '';
            self.data.is_type =
              record.offerings && record.offerings.voucher && record.offerings.voucher.enabled
                ? 'voucher'
                : record.offerings && record.offerings.api_exchange && record.offerings.api_exchange.enabled
                ? 'api'
                : 'manual';
          }
        });
      }
    },

    imageUpload: function (e) {
      const self = this;
      const file = e.target.files[0];
      return Q.try(function () {
        return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: file.name,
            contentType: 'multipart/form-data',
          },
        });
      })
        .then(function (response) {
          console.log(response);

          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;
          self.data.logo = response.data.data.url;
          return temp_axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    savepartner() {
      this.$Progress.start();
      const self = this;

      const params = {
        name: self.data.name,
        logo: self.data.logo,
        terms_condition: self.data.terms_condition,
        add_phone_message: self.data.add_phone_message,
        redeem_success_message: self.data.redeem_success_message.replace(/'/g, '"'),
      };
      params.redeem_values = self.data.redeem_values;

      if (self.data.is_type == 'voucher') {
        params.offerings = {
          voucher: {
            enabled: true,
          },
        };
      } else if (self.data.is_type == 'manual') {
        params.offerings = {
          manual_exchange: {
            enabled: true,
          },
        };
      } else if (self.data.is_type == 'api') {
        params.offerings = {
          api_exchange: { enabled: true },
        };
      }

      if (params.title == '' || params.logo == '') {
        self.$Progress.fail();
        self.showMsg = true;
        self.msg = 'partner name and terms_condition must be set';
        return;
      }

      if (self.partner_id) {
        // update subcat
        return Axios.put(Config.MS_SOCO_ADMIN_API_URL + `/partners/${self.partner_id}`, params)
          .then((response) => {
            if (response.status == 200) {
              this.clicked = false;
              this.$Progress.finish();
              this.$router.push('/partners/all/');
              this.$toasted.global.show('partner berhasil disimpan.');
            }
          })
          .catch((err) => {
            this.$Progress.fail();
            this.$toasted.global.show('partner gagal disimpan.');
            throw err;
          });
      } else {
        // create
        return Axios.post(Config.MS_SOCO_ADMIN_API_URL + `/partners`, params)
          .then((response) => {
            self.$Progress.finish();
            if (response.status == 200) {
              self.clicked = false;
              self.$router.push('/partners/all');
              self.$toasted.global.show('partner berhasil disimpan.');
            }
          })
          .catch((err) => {
            self.$Progress.fail();
            self.$toasted.global.show('partner gagal disimpan.');
            throw err;
          });
      }
    },
    showImageUploader() {
      this.changeImage = true;
    },
    triggerUpload() {
      this.showImageUploader();
      this.fileSizeExceed = false;
      this.showModal = true;
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
      //data.original_image = this.uploadEditor.fileName;
      const data = new FormData();
      data.append('file', cropFile);
      data.append('filename', fileName);

      this.isSaveCrop = true;
      const self = this;

      return Q.try(function () {
        return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: fileName,
            contentType: 'multipart/form-data',
          },
        }).then(function (response) {
          console.log(response);
          const url = response.data.data.url;
          const temp_axios = Axios;

          delete temp_axios.defaults.withCredentials;

          return temp_axios
            .put(response.data.data.signedUrl, cropFile, {
              headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then((response) => {
              Axios.defaults.withCredentials = true;

              self.data.thumbnail = url;

              self.showModal = false;
              self.isFileChoose = false;
              self.isSaveCrop = false;
              self.changeImage = false;
            });
        });
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
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
  },
};
</script>

<style lang="scss" scoped>
@import '_formpartners';
</style>
