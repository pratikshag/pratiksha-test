<template>
  <form class="sc-filter" @submit.prevent="$_onSubmit">
    <div class="sc-filter-item">
      <label class="sc-filter-label" for="title">From</label>
      <input id="date-from" v-model="from" type="date" class="sc-filter-input" />
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="title">To</label>
      <input id="date-to" v-model="to" type="date" class="sc-filter-input" />
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="category">Category</label>
      <select id="category" v-model="category" class="sc-filter-input">
        <option value=""></option>
        <option v-for="item in options.category" :key="item.slug" :value="item.slug" v-text="item.name"></option>
      </select>
    </div>

    <div class="sc-filter-item sc-filter-button">
      <button
        v-for="item in $_buttons.submit"
        :key="item.value"
        :value="item.value"
        :class="item.btnClass"
        type="submit"
        v-html="item.text"
      ></button>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'vuex';
import tableFilter from 'mixins/table-filter';

export default {
  name: 'table-filter',

  mixins: [tableFilter],

  data() {
    return {
      selected: {
        from: '',
        to: '',
        category: '',
      },
      //
      options: {
        category: [],
      },
    };
  },

  computed: {
    from: {
      get() {
        return Object.keys(this.$route.query).indexOf('from') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.from = this.$route.query.from)
          : this.selected.from;
      },
      set(value) {
        this.selected.from = value;
      },
    },

    to: {
      get() {
        return Object.keys(this.$route.query).indexOf('to') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.to = this.$route.query.to)
          : this.selected.to;
      },
      set(value) {
        this.selected.to = value;
      },
    },

    category: {
      get() {
        return Object.keys(this.$route.query).indexOf('category') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.category = this.$route.query.category)
          : this.selected.category;
      },
      set(value) {
        this.selected.category = value;
      },
    },
  },

  // watch: {},

  created() {
    this.init();
  },

  methods: {
    ...mapActions('categories', ['getCategories']),

    init() {
      this.getCategories({
        filter: {
          type: 'help_page_article',
        },
        fields: 'name slug sub_categories.name sub_categories.slug',
      }).then((data) =>
        data.forEach(({ name, slug, sub_categories }) => {
          this.options.category.push({ name, slug });
          /*
                if (sub_categories.length)
                    this.options.subcategory = this.options.subcategory.concat(sub_categories)
                */
        })
      );
    },
  },
};
</script>
