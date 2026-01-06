<template>
  <form class="sc-filter" @submit.prevent="$_onSubmit">
    <div class="sc-filter-item">
      <label class="sc-filter-label" for="title">Title</label>
      <input id="title" v-model="title" type="text" class="sc-filter-input" />
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="country">Country</label>
      <select id="country" v-model="created_from" class="sc-filter-input">
        <option value=""></option>
        <option v-for="{ text, value } in options.created_from" :key="value" :value="value" v-text="text"></option>
      </select>
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="status">Status</label>
      <select id="status" v-model="status" class="sc-filter-input">
        <option value=""></option>
        <option v-for="item in options.status" :key="item.slug" :value="item.slug" v-text="item.name"></option>
      </select>
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="category">Category</label>
      <select id="category" v-model="category" class="sc-filter-input">
        <option value=""></option>
        <option v-for="item in options.category" :key="item.slug" :value="item.slug" v-text="item.name"></option>
      </select>
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="subcategory">Sub-Category</label>
      <select id="subcategory" v-model="subcategory" class="sc-filter-input">
        <option value=""></option>
        <option v-for="item in options.subcategory" :key="item.slug" :value="item.slug" v-text="item.name"></option>
      </select>
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="subcategory">Platform</label>
      <select id="platform" v-model="platform" class="sc-filter-input">
        <option value=""></option>
        <option v-for="item in options.platform" :key="item.value" :value="item.value" v-text="item.name"></option>
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
        title: '',
        created_from: '',
        status: '',
        category: '',
        subcategory: '',
        platform: '',
      },
      //
      options: {
        category: [],
        subcategory: [],
        created_from: [
          {
            text: 'Indonesia',
            value: 'sociolla',
          },
          {
            text: 'Vietnam',
            value: 'sociolla_vn',
          },
        ],
        status: [
          {
            name: 'Draft',
            slug: 'draft',
          },
          {
            name: 'Published',
            slug: 'publish',
          },
        ],
        platform: [
          {
            name: 'SOCO',
            value: 'soco',
          },
          {
            name: 'Lilla',
            value: 'lilla',
          },
        ],
      },
    };
  },

  computed: {
    title: {
      get() {
        return Object.keys(this.$route.query).indexOf('title') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.title = this.$route.query.title)
          : this.selected.title;
      },
      set(value) {
        this.selected.title = value;
      },
    },

    created_from: {
      get() {
        return Object.keys(this.$route.query).indexOf('created_from') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.created_from = this.$route.query.created_from)
          : this.selected.created_from;
      },
      set(value) {
        this.selected.created_from = value;
      },
    },

    status: {
      get() {
        return Object.keys(this.$route.query).indexOf('status') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.status = this.$route.query.status)
          : this.selected.status;
      },
      set(value) {
        this.selected.status = value;
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

    subcategory: {
      get() {
        return Object.keys(this.$route.query).indexOf('subcategory') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.subcategory = this.$route.query.subcategory)
          : this.selected.subcategory;
      },
      set(value) {
        this.selected.subcategory = value;
      },
    },

    platform: {
      get() {
        return Object.keys(this.$route.query).indexOf('platform') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.platform = this.$route.query.platform)
          : this.selected.platform;
      },
      set(value) {
        this.selected.platform = value;
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
        limit: 20,
        skip: 0,
      }).then((data) =>
        data.forEach(({ name, slug, sub_categories }) => {
          this.options.category.push({ name, slug });

          if (sub_categories.length) {
            this.options.subcategory = this.options.subcategory.concat(sub_categories);
          }
        })
      );
    },
  },
};
</script>
