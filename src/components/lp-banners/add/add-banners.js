import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'addBanners',
  props: ['banner_id'],
  data() {
    return {
      file: null,
      is_edit: false,
      is_loading: false,
      is_file_changed: false,
      fileSizeExceed: false,
      banner: {
        _id: null,
        url: '',
        name: '',
        image: '',
        location: 'loyalty-point',
        screen_type: 'desktop-web',
        status: 'inactive',
      },
    };
  },
  created() {
    this.banner._id = this.$route.params.id;
    this.is_edit = !!this.banner._id;
    console.log(`banner id: ${this.banner._id}`);

    if (this.is_edit) {
      this.getBanner(this.banner._id);
    }
  },
  components: {},
  methods: {
    async getBanner(id) {
      try {
        this.startLoading();
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/banners`, {
          params: {
            filter: {
              _id: id,
              location: 'loyalty-point',
            },
          },
        });
        if (response.status === 200) {
          const [banner] = response.data.data;
          this.finishLoading();

          if (banner) {
            this.banner = banner;
          }
        }
      } catch (err) {
        this.finishLoading(true);
        console.error(err);
      }
    },

    async createBanner() {
      try {
        this.startLoading();
        await this.uploadFile(this.file);

        const response = await Axios.post(Config.default.MS_SOCO_ADMIN_API_URL + `/banner`, this.banner);
        console.log(response);

        if (response.status === 200) {
          this.finishLoading();
          this.$router.push('/loyalty-point-banners/all');
        }
      } catch (err) {
        this.finishLoading(true);
        console.error(err);
      }
    },

    async updatBanner(id) {
      try {
        this.startLoading();
        await this.uploadFile(this.file);

        const response = await Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/banner/${id}`, this.banner);
        console.log(response);

        if (response.status === 200) {
          this.finishLoading();
          this.$router.push('/loyalty-point-banners/all');
        }
      } catch (err) {
        this.finishLoading(true);
        console.error(err);
      }
    },

    triggerUpload() {
      this.$refs.banner_file_input.click(); // trigger file selector
      this.fileSizeExceed = false;
    },

    onFileSelected(event) {
      const file = this.$refs.banner_file_input.files[0];
      console.log('file selected: ', file);
      if (!file) {
        return;
      }
      if (file.size > 5242880) {
        this.fileSizeExceed = true;
      } else {
        this.file = file;
        this.getBase64(file);
        this.is_file_changed = true;
      }
    },

    onSubmit() {
      this.$validator.validateAll('formBanner').then((result) => {
        if (result) {
          if (this.is_edit) {
            this.updatBanner(this.banner._id);
          } else {
            this.createBanner();
          }
        }
      });
    },

    async uploadFile(file) {
      try {
        if (!this.is_file_changed) {
          return this.banner.image;
        }

        let response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/pre-signed-url`, {
          params: {
            fileName: file.name,
            contentType: 'multipart/form-data',
          },
        });

        const { url, signedUrl } = response.data.data;
        delete Axios.defaults.withCredentials;

        response = await Axios.put(signedUrl, file, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        this.banner.image = url;
        console.log('file uploaded', response);
        Axios.defaults.withCredentials = true;

        return url;
      } catch (error) {
        console.error(error);
      }
    },

    getBase64(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.banner.image = reader.result;
      };
      reader.onerror = (error) => {
        console.error(error);
      };
    },

    startLoading() {
      this.is_loading = true;
      this.$Progress.start();
    },

    finishLoading(hasError) {
      this.is_loading = false;
      if (hasError) {
        this.$Progress.fail();
      } else {
        this.$Progress.finish();
      }
    },
  },
};
