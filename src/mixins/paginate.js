import TablePagination from 'components/tables/TablePagination';

export default {
  components: { TablePagination },

  data() {
    return {
      $_count: 0,
      $_lastPage: 0,
      $_limit: 10,
      //
      $_recount: false,
    };
  },

  computed: {
    $_currentPage: {
      get() {
        return parseInt(this.$route.query.page) || 1;
      },
      set(value) {
        this.$data.$_recount = false;

        this.$router.replace({
          query: {
            ...this.$route.query,
            page: value,
          },
        });
      },
    },

    $_paginate() {
      return {
        total: this.$data.$_count,
        perPage: this.$data.$_limit,
        currentPage: this.$_currentPage,
        lastPage: this.$data.$_lastPage,
      };
    },
  },

  methods: {
    $_updateCount(count) {
      // paginate
      this.$data.$_count = count;
      this.$data.$_lastPage = Math.ceil(count / this.$data.$_limit);
    },
  },
};
