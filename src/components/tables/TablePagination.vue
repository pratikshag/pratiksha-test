<template>
  <div class="sc-pagination-row between">
    <div class="sc-pagination-page">
      <div class="sc-pagination-text">Page: {{ paginate.currentPage }} out of {{ paginate.lastPage }}</div>
      <div class="sc-pagination-text">
        Total Record:
        {{ paginate.currentTotalRecord ? paginate.currentTotalRecord : paginate.total }}
      </div>
    </div>
    <div v-if="show.pagination" class="sc-pagination">
      <div class="sc-pagination-form">
        <input
          v-if="show.prev"
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Prev"
          @click="prev"
        />
        <input v-model="selected" class="sc-pagination-input" type="number" min="1" :max="paginate.lastPage" name="" />
        <input
          v-if="show.next"
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Next"
          @click="next"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'table-pagination',

  props: ['paginate', 'value'],

  data() {
    return {};
  },

  computed: {
    selected: {
      get() {
        return this.paginate.currentPage;
      },

      set(value) {
        this.$emit('input', value);
      },
    },

    show() {
      return {
        prev: this.paginate.currentPage > 1,
        next: this.paginate.currentPage < this.paginate.lastPage,
        pagination: this.paginate.lastPage > 1,
      };
    },
  },

  methods: {
    prev() {
      this.$emit('input', this.value - 1);
    },

    next() {
      this.$emit('input', this.value + 1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/sass/partial/help-reset';
</style>
