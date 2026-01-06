<template>
  <form class="sc-filter" @submit.prevent="$_onSubmit">
    <div class="sc-filter-item">
      <label class="sc-filter-label" for="title">Name</label>
      <input id="name" v-model="name" type="text" class="sc-filter-input" />
    </div>

    <div class="sc-filter-item">
      <label class="sc-filter-label" for="country">Country</label>
      <select id="country" v-model="created_from" class="sc-filter-input">
        <option value=""></option>
        <option v-for="{ text, value } in options.created_from" :key="value" :value="value" v-text="text"></option>
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
import tableFilter from 'mixins/table-filter';

export default {
  name: 'table-filter',

  mixins: [tableFilter],

  data() {
    return {
      selected: {
        name: '',
        created_from: '',
        platform: '',
      },
      //
      options: {
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
    name: {
      get() {
        return Object.keys(this.$route.query).indexOf('name') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.name = this.$route.query.name)
          : this.selected.name;
      },
      set(value) {
        this.selected.name = value;
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
        return Object.keys(this.$route.query).indexOf('created_from') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.created_from = this.$route.query.created_from)
          : this.selected.created_from;
      },
      set(value) {
        this.selected.created_from = value;
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

  // created () {},

  // methods: {}
};
</script>
