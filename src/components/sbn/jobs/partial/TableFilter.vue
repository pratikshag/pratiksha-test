<template>
  <form class="sc-filter" @submit.prevent="$_onSubmit">
    <div class="sc-filter-item">
      <label class="sc-filter-label">Title: </label>
      <input v-model="title" class="sc-filter-input" type="input" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">State: </label>
      <select id="state" v-model="state" class="sc-filter-input">
        <option value="">Choose State</option>
        <option v-for="item in options.state" :key="item.value" :value="item.value" v-text="item.text"></option>
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
        title: '',
        state: '',
      },
    };
  },

  computed: {
    options() {
      return {
        state: this.$store.state.jobs.options.state,
      };
    },

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

    state: {
      get() {
        return Object.keys(this.$route.query).indexOf('state') > -1
          ? // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            (this.selected.state = this.$route.query.state)
          : this.selected.state;
      },
      set(value) {
        this.selected.state = value;
      },
    },
  },

  // watch: {},

  // created () {},

  // methods: {}
};
</script>
