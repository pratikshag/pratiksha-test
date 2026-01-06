import Axios from 'axios';
import Modal from '../../../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
const Config = require('../../../../config/default.env');

export default {
  name: 'Banner',
  components: {
    Modal,
  },
  data() {
    return {
      allBanners: [],
      is_loading: true,
      search: '',
      delete_banner_id: null,
      totalPage: 0,
      perPage: 10,
      currentPage: 1,
    };
  },

  created() {
    this.getBanners();
  },
  filters: {
    capitalize(value) {
      if (!value) {
        return '';
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  methods: {
    async getBanners() {
      try {
        this.startLoading();

        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/banners`, {
          params: {
            filter: { location: 'loyalty-point' },
            sort: '-created_at',
          },
        });
        console.log(response);
        this.finishLoading();

        if (response.status === 200) {
          this.allBanners = response.data.data;
        }
      } catch (err) {
        console.log(err);
        this.finishLoading(true);
      }
    },

    async trash(id) {
      try {
        this.startLoading();
        const response = await Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/banner/${id}`, {});

        this.finishLoading();
        if (response.status == 200) {
          this.getBanners();
        }
      } catch (err) {
        this.finishLoading(true);
        console.log(err);
      }
    },

    confirmDelete(id) {
      this.delete_banner_id = id;
      this.$refs.modal.open();
    },

    deleteConfirmed() {
      this.trash(this.delete_banner_id);
    },

    async searchQuery() {
      this.startLoading();
      try {
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/banners`, {
          params: {
            filter: {
              name: {
                $regex: this.search,
                $options: 'i',
              },
              location: 'loyalty-point',
            },
            sort: '-created_at',
          },
        });
        console.log(response);
        this.finishLoading();

        if (response.status === 200) {
          this.allBanners = response.data.data;
        }
      } catch (err) {
        this.finishLoading(true);
        console.log(err);
      }
    },

    async pagination(page) {
      this.startLoading();
      page = Math.max(parseInt(page) || 1, 1);
      this.posts = {};
      try {
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/banners`, {
          params: {
            filter: { location: 'loyalty-point' },
            skip: this.perPage * (page - 1),
            limit: this.perPage,
            sort: '-created_at',
          },
        });
        console.log(response);
        this.finishLoading();

        if (response.status === 200) {
          this.allBanners = response.data.data;
          this.currentPage = page;
        }
      } catch (err) {
        this.finishLoading(true);
        console.log(err);
      }
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
