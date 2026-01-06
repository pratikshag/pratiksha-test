<template src="./formvoucher.html"></template>
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
  name: 'form-voucher',
  components: {
    ImageDrop,
    ImageResize,
    VueEditor,
  },

  data() {
    return {
      voucher_id: null,
      subcat_id: null,
      data: {
        name: '',
        slug: '',
        description: '',
        type: '',
        total_available_voucher: 0,
        parent_category: null,
        parent_category_name: '',
        image: null,
        partner_id: '',
        code: '',
        is_available: true,
        terms_condition: '',
        is_active: true,
      },
      options: {
        is_available: [
          { text: 'Show', value: true },
          { text: 'Hidden', value: false },
        ],
        is_active: [
          { text: 'Active', value: true },
          { text: 'Not Active', value: false },
        ],
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
      allpartner: [],
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
    this.fetchPartners();
    this.fecthVoucher();
  },
  methods: {
    resetForm() {
      this.voucher_id = null;
      this.data.title = null;
      this.data.quota_per_user = null;
      this.data.total_available_voucher = null;
      this.data.terms_condition = null;
      this.data.points_value = null;
      this.data.total_available_voucher = 0;
      this.data.end_date = null;
      this.data.is_active = null;
      this.data.thumbnail = null;
      this.data.is_available = null;
      this.data.code = null;
    },
    fecthVoucherById(voucher_id, callback) {
      return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/vouchers', {
        params: {
          filter: {
            _id: voucher_id,
          },
        },
      })
        .then((response) => callback(response))
        .catch((err) => {
          throw err;
        });
    },
    fetchPartners() {
      Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/partners', {
        params: {
          filter: { is_deleted: false },
          skip: 0,
          limit: 10,
          sort: '-created_at',
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.allpartner = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    fecthVoucher() {
      const self = this;
      this.resetForm();
      if (this.$route.params && this.$route.params.id != null) {
        const voucher_id = this.$route.params.id;

        this.fecthVoucherById(voucher_id, function (response) {
          if (response.status == 200 && response.data.data.length) {
            const record = response.data.data[0];
            self.voucher_id = record._id;

            self.data.partner_id = record.partner_id ? record.partner_id : '';
            self.data.title = record.title ? record.title : '';
            self.data.quota_per_user = record.quota_per_user ? record.quota_per_user : '';
            self.data.total_available_voucher = record.total_available_voucher ? record.total_available_voucher : '';
            self.data.terms_condition = record.terms_condition ? record.terms_condition : '';
            self.data.points_value = record.points_value ? record.points_value : '';
            self.data.total_available_voucher = record.total_available_voucher ? record.total_available_voucher : 0;
            self.data.is_active = record.is_active || false;
            self.data.end_date = record.end_date ? record.end_date.substring(0, 10) : '';
            self.data.thumbnail = record.thumbnail ? record.thumbnail : '';
            self.data.is_available = record.is_available || false;
            self.data.code = record.code ? record.code : '';
          }
        });
      }
    },
    saveVoucher() {
      this.$Progress.start();
      const self = this;
      let name = null;
      self.allpartner.map(function (row) {
        if (row._id == self.data.partner_id) {
          name = row.name;
        }
      });
      const params = {
        partner_id: self.data.partner_id,
        title: self.data.title,
        quota_per_user: self.data.quota_per_user,
        total_available_voucher: self.data.total_available_voucher,
        name: name,
        terms_condition: self.data.terms_condition,
        points_value: self.data.points_value,
        total_available_voucher: self.data.total_available_voucher,
        end_date: self.data.end_date,
        is_active: self.data.is_active,
        thumbnail: self.data.thumbnail,
        is_available: self.data.is_available,
        code: self.data.code,
      };

      if (
        params.partner_id == '' ||
        params.title == '' ||
        params.terms_condition == '' ||
        params.points_value == '' ||
        params.thumbnail == '' ||
        params.total_available_voucher == ''
      ) {
        self.$Progress.fail();
        self.showMsg = true;
        self.msg = 'Voucher name and terms_condition must be set';
        self.$toasted.global.show('Voucher partner, title, terms condition, loyalty points, thumbnail must be set');
        return;
      }

      if (self.voucher_id) {
        // update subcat
        return Axios.put(Config.MS_SOCO_ADMIN_API_URL + `/vouchers/${self.voucher_id}`, params)
          .then((response) => {
            if (response.status == 200) {
              this.clicked = false;
              this.$Progress.finish();
              this.$router.push('/voucher/all/');
              this.$toasted.global.show('Voucher berhasil disimpan.');
            }
          })
          .catch((err) => {
            this.$Progress.fail();
            this.$toasted.global.show('Voucher gagal disimpan.');
            throw err;
          });
      } else {
        // create
        return Axios.post(Config.MS_SOCO_ADMIN_API_URL + `/vouchers`, params)
          .then((response) => {
            self.$Progress.finish();
            if (response.status == 200) {
              self.clicked = false;
              self.$router.push('/voucher/all');
              self.$toasted.global.show('Voucher berhasil disimpan.');
            }
          })
          .catch((err) => {
            self.$Progress.fail();
            self.$toasted.global.show('Voucher gagal disimpan.');
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
@import '_formvoucher';
</style>
