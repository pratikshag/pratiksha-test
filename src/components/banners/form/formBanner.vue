<template src="./formBanner.html"></template>
<script>
import Axios from 'axios';
import Vue from 'vue';
const Config = require('../../../../config/default.env');
import Croppa from 'vue-croppa';
import Q from 'q';
import Multiselect from 'vue-multiselect';
import MobileAppsLinkPicker from '../../snippets/mobile-apps-links-picker';
import TextEditor from 'components/forms/editor/TextEditor';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';

Vue.use(Croppa);

export default {
  name: 'form-banner',
  components: {
    Multiselect,
    MobileAppsLinkPicker,
    TextEditor,
    Datetime,
  },
  data() {
    return {
      showModal: false,
      is_loading: true,
      banner_id: null,
      options: [
        'ios-home',
        'ios-aboutpnr',
        'ios-aboutpnr-main',
        'ios-aboutpnr-howtoearn',
        'ios-aboutpnr-rewardsbenefits',
        'ios-aboutpnr-rewardsjourney',
        'ios-shop',
        'ios-reviews',
        'ios-newsfeed',
        'android-home',
        'android-aboutpnr',
        'android-aboutpnr-main',
        'android-aboutpnr-howtoearn',
        'android-aboutpnr-rewardsbenefits',
        'android-aboutpnr-rewardsjourney',
        'android-shop',
        'android-reviews',
        'android-newfeed',
        'ios-my-profile',
        'android-my-profile',
        'ios-review-reminder',
        'android-review-reminder',
        'ios-what-do-you-love-about-this',
        'android-what-do-you-love-about-this',
      ],
      locationOptions: [
        { value: 'loyalty-point', label: 'Loyalty Point', show: true },
        { value: 'home', label: 'Home Soco', show: true },
        { value: 'homepage-review', label: 'Homepage Review', show: true },
        { value: 'home-right-panel', label: 'Home Right Panel - SBN', show: true },
        { value: 'apps-mgm', label: 'Apps MGM', show: true },
        { value: 'soco-pnr', label: 'SOCO About PNR', show: true },
        { value: 'soco-pnr-main', label: 'SOCO About PNR - AboutSP - Main', show: true },
        { value: 'soco-pnr-howtoearn', label: 'SOCO About PNR - AboutSP - HowToEarn', show: true },
        { value: 'soco-pnr-rewardsbenefits', label: 'SOCO About PNR - Rewards - Benefit', show: true },
        {
          value: 'soco-beauty-star-benefit-voucher',
          label: 'SOCO Beauty Star - Beauty Star Benefit - Voucher',
          show: true,
        },
        { value: 'soco-pnr-rewardsjourney', label: 'SOCO About PNR - Rewards - Journey', show: true },
        { value: 'expert-choice-banner', label: 'Expert Homepage Review', show: true },
        { value: 'expert-review-page', label: 'Expert Review Page', show: true },
        { value: 'soco-article-detail-page-pop-up', label: 'SOCO - Article Detail Page - Pop Up Banner', show: true },
        { value: 'soco-article-detail-side-banner', label: 'SOCO - Article Detail Page - Side Banner', show: true },
        { value: 'soco-non-login-other-user-banner', label: 'SOCO - Non Login Other User Banner', show: true },
        { value: 'ios-home', label: 'IOS Home', show: false },
        { value: 'ios-shop', label: 'IOS Shop', show: false },
        { value: 'ios-reviews', label: 'IOS Reviews', show: false },
        { value: 'ios-newsfeed', label: 'IOS NewsFeed', show: false },
        { value: 'android-home', label: 'Android Home', show: false },
        { value: 'android-shop', label: 'Android Shop', show: false },
        { value: 'android-reviews', label: 'Android Reviews', show: false },
        { value: 'android-newsfeed', label: 'Android NewsFeed', show: false },
      ],
      banner: {
        image: '',
        location: 'home',
        name: '',
        order: '',
        screen_type: '',
        status: '',
        url: '',
        created_from: 'sociolla',
        apply_for: '',
        mobile_locations: [],
        header_title: '',
        short_description: '',
        background_image: '',
        more_info: {
          location_key: '',
        },
        more_info_description: '',
        header_title: String,
        eligibility: {
          category: 'level',
          csv_link: '',
          list: [],
        },
        platform: {
          id: {
            is_enabled: false,
            title: '',
            text: '',
          },
          vn: {
            is_enabled: false,
            title: '',
            text: '',
          },
        },
        start_date: '',
        end_date: '',
        created_by: '',
      },

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
      select: {
        option: {
          orders: [1, 2, 3, 4, 5, 6, 7],
        },
      },
      csv_name: '',
      roles: ['SOCO Star', 'Rising Star', 'Super Star', 'Diva Star'],
      submit_loading: false,
    };
  },

  computed: {
    isBeautyBanner() {
      return this.banner.location === 'soco-beauty-star-benefit-voucher';
    },
    isNonLoginUser() {
      return this.banner.location === 'soco-non-login-other-user-banner';
    },
    isReviewReminder() {
      return (
        (this.banner.mobile_locations.length && this.banner.mobile_locations.includes('ios-review-reminder')) ||
        this.banner.mobile_locations.includes('android-review-reminder')
      );
    },
    isWhatYouLove() {
      return (
        (this.banner.mobile_locations.length &&
          this.banner.mobile_locations.includes('ios-what-do-you-love-about-this')) ||
        this.banner.mobile_locations.includes('android-what-do-you-love-about-this')
      );
    },
  },

  mounted() {
    this.fetchBanner();
  },

  methods: {
    setMoreInfo(value) {
      // this.banner.more_info = JSON.parse(JSON.stringify(value))
      this.banner.more_info = {
        location_key: (this.banner.more_info && this.banner.more_info.location_key) || '',
        ...JSON.parse(JSON.stringify(value)),
      };
    },
    formReset() {
      this.banner.image = '';
      this.banner.location = 'home';
      this.banner.name = '';
      this.banner.order = 0;
      this.banner.screen_type = '';
      this.banner.status = '';
      this.banner.url = '';
      this.banner.mobile_locations = [];
      this.banner.header_title = '';
      this.banner.more_info = {
        location_key: '',
      };
      this.banner.more_info_description = '';
      this.banner.eligibility = {
        category: 'level',
        csv_link: '',
        list: [],
      };
      (this.start_date = ''), (this.end_date = '');
      (this.banner.platform = {
        id: {
          is_enabled: false,
          title: '',
          text: '',
        },
        vn: {
          is_enabled: false,
          title: '',
          text: '',
        },
      }),
        (this.is_loading = false);
    },

    fetchBanner() {
      this.banner_id = this.$route.params.id;
      this.formReset();

      if (this.banner_id) {
        this.is_loading = true;
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banners', {
          params: { filter: { _id: this.banner_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const banner = response.data.data[0];
              // if (banner && banner.more_info && Object.keys(banner.more_info).length) {
              banner.more_info = {
                location_key: (banner.more_info && banner.more_info.location_key) || '',
                ...banner.more_info,
              };
              banner.eligibility = {
                category: (banner.eligibility && banner.eligibility.category) || '',
                ...banner.eligibility,
              };
              // }
              this.banner = JSON.parse(JSON.stringify(banner));
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    saveBanner(scope) {
      const self = this;
      if (!self.banner.apply_for) {
        delete self.banner['apply_for'];
      }
      if (!self.banner.screen_type) {
        self.banner['screen_type'] = 'desktop-web';
      }
      if (
        self.banner.mobile_locations.includes('ios-what-do-you-love-about-this') ||
        self.banner.mobile_locations.includes('android-what-do-you-love-about-this') ||
        self.banner.mobile_locations.includes('ios-review-reminder') ||
        self.banner.mobile_locations.includes('android-review-reminder')
      ) {
        self.banner['page_type'] = 'recently-bought-need-to-review-page';
      }

      if (!self.banner.page_type) {
        delete self.banner['page_type'];
      }
      self.banner.created_by = {
        _id: self.$store.state.userProfile._id,
        email: self.$store.state.userProfile.email,
      };
      self.submit_loading = true;

      self.$validator.validateAll(scope).then((result) => {
        if (result) {
          if (self.banner_id) {
            Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/banner/' + self.banner_id, self.banner)
              .then((response) => {
                if (response.status === 200) {
                  self.submit_loading = false;
                  self.$router.push('/banners/all');
                }
              })
              .catch((err) => {
                self.$Progress.fail();
                throw err;
              });
          } else {
            Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + '/banner', self.banner)
              .then((response) => {
                if (response.status === 200) {
                  self.submit_loading = false;
                  self.$toasted.global.show('Successfully create banner');
                  self.$router.push('/banners/all');
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

    // triggerUpload() {
    //     this.showImageUploader()
    //     this.fileSizeExceed = false
    //     this.showModal = true
    // },
    triggerUpload() {
      this.$refs.banner_file_input.click(); // trigger file selector
      this.fileSizeExceed = false;
    },

    onFileSelected(event) {
      const file = this.$refs.banner_file_input.files[0];
      if (!file) {
        return;
      }
      if (file.size > 5242880) {
        this.fileSizeExceed = true;
      } else {
        this.file = file;
        this.uploadS3(file);
        // this.getBase64(file);
        // this.is_file_changed = true;
      }
    },
    uploadS3(file) {
      this.state.isProcess = true;
      const self = this;

      let filename = Math.floor(100000000000 * Math.random()) + '-' + Date.now();
      file.type.indexOf('png') > -1 ? (filename = filename + '.png') : (filename = filename + '.jpg');

      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: filename,
            contentType: file.type,
          },
        });
      })
        .then(function (response) {
          self.tmp_image = response.data.data.url;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': file.type },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          //set state
          this.state.isProcess = false;
          self.banner.image = self.tmp_image;
        })
        .catch((err) => {
          this.state.isProcess = false;
          console.log(err);
        });
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
      const fileName = Date.now() + '-' + file.name;
      let cropFile;

      if (file.type === 'image/gif') {
        cropFile = file;
      } else {
        cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
      }
      this.banner.image = '';
      this.state.isProcess = true;

      this.isSaveCrop = true;
      const self = this;
      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: fileName,
            contentType: cropFile.type,
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
            headers: { 'Content-Type': cropFile.type },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          // this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', image_url);
          // this.uploadEditor.resetUploader();
          //set state
          this.state.isProcess = false;
          self.banner.image = self.tmp_image;
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
    selectCsv(file) {
      if (file && file[0]) {
        this.csv_loading = true;
        const reader = new FileReader();
        reader.onload = () => {
          const fileName = get(file[0], 'name', '');
          const timestamp = this.generateTimestamp();
          const newFileName = `${timestamp} - [${fileName}].csv`;
          this.$store
            .dispatch('files/putFile', {
              filename: newFileName,
              blob: file[0],
            })
            .then(({ url }) => {
              this.banner.eligibility.csv_link = url;
              this.csv_name = newFileName;
            });
        };
        reader.readAsText(file[0]);
        reader.onerror = (error) => {
          console.error(error);
        };
      }
    },
    // mobLocation(options){
    //     this.optionsProxy=options
    // },

    toggleHeightMultiselect() {
      // var $fieldMultiselectEl = document.querySelectorAll('.fieldarea--multiselect');
      // var heigtWrap = document.querySelectorAll('.fieldarea--multiselect .multiselect__tags-wrap')[0].offsetHeight;
      // $fieldMultiselectEl.css({ marginBottom: heigtWrap });
    },

    // async getGreatMission() {
    //     try {
    //         const endpoint = Config.default.MS_SOCO_PUBLIC_API_URL + '/missions';
    //         const params = {skip: 0, limit: 20, fields: "_id,id,title,name"};
    //         const response = await Axios.get(endpoint, {params});

    //         this.great_mission_list = response && response.data.data && response.data.data.length ? response.data.data : []
    //     } catch (e) {
    //         console.log(e);
    //     }
    // },
    checkActiveBanner(data) {
      if (data && data.mobile_locations.length) {
        const filter = {
          page_type: 'recently-bought-need-to-review-page',
          mobile_locations: {
            $in: [data.mobile_locations],
          },
          status: 'active',
        };
        if (data.platform.id.is_enabled) {
          filter['platform.id.is_enabled'] = true;
        }
        if (data.platform.vn.is_enabled) {
          filter['platform.id.is_enabled'] = true;
        }
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/banners/count', {
          params: {
            filter: filter,
          },
        })
          .then((response) => {
            if (response.status == 200) {
              let count = parseInt(response.data.data);
              if (isNaN(count)) {
                count = 0;
              }
              if (count > 0) {
                this.$toasted.global.error('Please deactivate other iOS/Android banner settings');
              }
            }
          })
          .catch((err) => {
            this.$Progress.finish();
            throw err;
          });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'formBanner';
input[type='checkbox']:checked {
  background: darkcyan;
}
input[type='checkbox']:after {
  background-color: transparent;
}
</style>
