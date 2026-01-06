export const models = (names = []) => {
  if (!names.length) {
    return false;
  }

  const computed = {};

  names.forEach((item) =>
    Object.assign(computed, {
      [item]: {
        get() {
          return Object.keys(this.$route.query).indexOf(item) > -1
            ? (this.selected[item] = this.$route.query[item])
            : this.selected[item];
        },
        set(value) {
          this.selected[item] = value;
        },
      },
    })
  );

  return computed;
};

export default {
  // data () {},

  computed: {
    $_query() {
      return Object.keys(this.selected);
    },

    $_hasQuery() {
      return this.$_query.indexOf(Object.keys(this.$route.query)[0]) > -1;
    },

    $_buttons() {
      return {
        submit: [
          {
            text: '<i class="fa fa-filter"></i> Filter',
            value: 'filter',
            btnClass: 'sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-uppercase sc-mr-10',
          },
          ...(this.$_hasQuery
            ? [
                {
                  text: '<i class="fa fa-trash-o"></i> Clear',
                  value: 'clear',
                  btnClass: 'sc-btn sc-btn-danger sc-btn-md sc-btn-rounded sc-uppercase sc-mr-10',
                },
              ]
            : []),
        ],
      };
    },
  },

  // watch: {},

  // created () {},

  methods: {
    $_onSubmit(e) {
      if (e.submitter.value == 'filter') {
        this.$emit('filter', {
          ...Object.fromEntries(Object.entries(this.selected).filter(([, value]) => value)),
        });
      } else {
        this.selected = this.$options.data().selected;
        this.$emit('filter');
      }
    },
  },
};
