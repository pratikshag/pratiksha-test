<template>
  <th class="is-sort" :class="isActive" :title="context.title" @click="onSort">
    {{ field.text }} <span :class="context.icon"></span>
  </th>
</template>

<script>
export default {
  name: 'table-sort',

  props: {
    field: {
      type: Object,
      default: () => {},
    },
  },

  data() {
    return {
      currentIndex: 0,
      //
      icon: ['fa fa-unsorted', 'fa fa-sort-asc', 'fa fa-sort-desc'],
      title: ['Unsorted', 'Ascending', 'Descending'],
    };
  },

  computed: {
    currentState() {
      return this.states[this.currentIndex];
    },

    states() {
      // [unsorted, asc, desc]
      return [undefined, this.field.key, `-${this.field.key}`];
    },

    context() {
      return {
        title: this.title[this.currentIndex],
        icon: this.icon[this.currentIndex],
      };
    },

    isActive() {
      return this.currentIndex > 0 ? 'active' : false;
    },
  },

  watch: {
    $route: 'init',
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      const { sort } = this.$route.query;

      this.currentIndex = sort ? (sort.indexOf(this.field.key) > -1 ? this.states.indexOf(sort) : 0) : 0;
    },

    onSort() {
      this.currentIndex++;

      if (this.currentIndex > 2) {
        this.currentIndex = 0;
      }

      // emit as is
      this.$emit('sort', this.currentState);
    },
  },
};
</script>

<style lang="scss" scoped>
th {
  &.is-sort {
    &:focus,
    &:hover,
    &.active {
      background-color: #f09ab9;
      cursor: pointer;
    }
  }
}
</style>
