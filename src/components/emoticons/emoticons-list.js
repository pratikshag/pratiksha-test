import Axios from 'axios';
import Modal from '../../vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
const Config = require('../../../config/default.env');
import sortField from '../ui/global/sortField';

export default {
  name: 'Emoticons',
  components: {
    Modal,
    sortField,
  },
  data() {
    return {
      emoticons: [],
      filtered_emoticons: [],
      is_loading: true,
      page: 1,
      per_page: 20,
      search: '',
      edit_emoticon: {},
      delete_emoticon_id: null,
      sortParam: '',
    };
  },

  created() {
    this.getEmoticons(true);
  },
  methods: {
    async getEmoticons(reset = false) {
      this.page = reset ? 1 : Math.max(parseInt(this.page) || 1, 1);
      try {
        const params = {
          skip: this.per_page * (this.page - 1),
          limit: this.per_page,
          sort: this.sortParam,
        };

        if (this.search) {
          params.filter = { name: this.search };
        }

        this.startLoading();
        const response = await Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/emoticons`, { params });
        this.finishLoading();
        this.emoticons = response.data.data;
      } catch (err) {
        console.error(err);
        this.finishLoading(true);
      }
    },

    nextPage() {
      this.page++;
      this.getEmoticons();
    },

    prevPage() {
      this.page = Math.max(--this.page, 1);
      this.getEmoticons();
    },

    async saveEmoticon() {
      try {
        const id = this.edit_emoticon._id;
        await Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/emoticons/${id}`, this.edit_emoticon);
        this.emoticons = this.emoticons.map((emoji) =>
          emoji._id === this.edit_emoticon._id ? this.edit_emoticon : emoji
        );
      } catch (err) {
        console.log(err);
      }
    },

    editEmoticon(emoticon) {
      this.edit_emoticon = { ...emoticon };
      this.$refs.edit_modal.open();
    },

    async deleteEmoticon(id) {
      try {
        this.startLoading();
        await Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/emoticons/${id}`);
        await this.getEmoticons();
        this.finishLoading();
      } catch (err) {
        this.finishLoading(true);
        console.log(err);
      }
    },

    confirmDelete(id) {
      this.delete_emoticon_id = id;
      this.$refs.delete_modal.open();
    },

    deleteConfirmed() {
      this.deleteEmoticon(this.delete_emoticon_id);
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
    sort(sort) {
      this.sortParam = sort;
      this.page = 1;
      this.getEmoticons();
    },
  },
};
