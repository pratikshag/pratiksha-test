<template src="./formcampaign.html"></template>
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
  name: 'form-campaign',
  components: {
    ImageDrop,
    ImageResize,
    VueEditor,
    //   Croppa,
  },

  data() {
    return {
      campaign_id: null,
      subcat_id: null,
      data: {
        name: '',
        slug: '',
        description: '',
        type: '',
        parent_category: null,
        parent_category_name: '',
        image: null,
        is_active: '',
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
    this.fecthCampaign();
  },
  methods: {
    resetForm() {
      this.campaign_id = null;
      this.data.title = null;
      this.data.banner = null;
      this.data.description = null;
      this.data.prize_details = null;
      this.data.end_date = null;
      this.data.is_active = null;
      this.data.thumbnail = null;
    },
    fecthCampaignById(campaign_id, callback) {
      return Axios.get(Config.MS_SOCO_ADMIN_API_URL + '/campaigns', {
        params: {
          filter: {
            _id: campaign_id,
          },
        },
      })
        .then((response) => callback(response))
        .catch((err) => {
          throw err;
        });
    },
    fecthCampaign() {
      const self = this;
      this.resetForm();
      if (this.$route.params && this.$route.params.id != null) {
        const campaign_id = this.$route.params.id;

        this.fecthCampaignById(campaign_id, function (response) {
          if (response.status == 200 && response.data.data.length) {
            const record = response.data.data[0];
            self.campaign_id = record._id;

            self.data.banner = record.banner ? record.banner : '';
            self.data.title = record.title ? record.title : '';
            self.data.description = record.description ? record.description : '';
            self.data.prize_details = record.prize_details ? record.prize_details : '';
            self.data.is_active = record.is_active ? true : false;
            self.data.end_date = record.end_date ? record.end_date.substring(0, 10) : '';
            self.data.thumbnail = record.thumbnail ? record.thumbnail : '';
          }
        });
      }
    },
    saveCampaign() {
      this.$Progress.start();
      const self = this;

      const params = {
        banner: self.data.banner,
        title: self.data.title,
        description: self.data.description,
        prize_details: self.data.prize_details,
        end_date: self.data.end_date,
        is_active: self.data.is_active,
        thumbnail: self.data.thumbnail,
      };

      if (params.title == '' || params.terms_condition == '' || params.points_value == '' || params.thumbnail == '') {
        self.$Progress.fail();
        self.showMsg = true;
        self.msg = 'campaign name and terms_condition must be set';
        return;
      }

      if (self.campaign_id) {
        // update subcat
        return Axios.put(Config.MS_SOCO_ADMIN_API_URL + `/campaigns/${self.campaign_id}`, params)
          .then((response) => {
            if (response.status == 200) {
              this.clicked = false;
              this.$Progress.finish();
              this.$router.push('/campaign/all/');
              this.$toasted.global.show('campaign berhasil disimpan.');
            }
          })
          .catch((err) => {
            this.$Progress.fail();
            this.$toasted.global.show('campaign gagal disimpan.');
            throw err;
          });
      } else {
        // create
        return Axios.post(Config.MS_SOCO_ADMIN_API_URL + `/campaigns`, params)
          .then((response) => {
            self.$Progress.finish();
            if (response.status == 200) {
              self.clicked = false;
              self.$router.push('/campaign/all');
              self.$toasted.global.show('campaign berhasil disimpan.');
            }
          })
          .catch((err) => {
            self.$Progress.fail();
            self.$toasted.global.show('campaign gagal disimpan.');
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
      const fileName = file.name.replace(/[\s*+?^${}()|[\]\\]/g, '_');
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
@import '_formcampaign';
</style>
