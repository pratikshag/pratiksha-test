export default {
  // data () {},

  // computed: {},

  methods: {
    $_onFilter(payload) {
      this.$data.$_recount = true;

      if (payload) {
        this.$router.replace(
          {
            query: payload,
          },
          () => {}
        );
      } else {
        this.$router.push({ name: this.$route.name });
      } // clear
    },
  },
};
