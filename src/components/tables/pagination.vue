<template>
  <div class="pagination-wrapper">
    <paginate
      v-model="page"
      :page-count="count"
      :page-range="3"
      :margin-pages="2"
      :click-handler="clickCallback"
      :prev-text="'Prev'"
      :next-text="'Next'"
      :container-class="'pagination pagination__list'"
      :page-class="'page-item'"
    >
    </paginate>
  </div>
</template>

<script>
import Vue from 'vue';
import Paginate from 'vuejs-paginate';

Vue.component('paginate', Paginate);

export default {
  name: 'Pagination',
  props: {
    total: {
      required: true,
      type: Number,
      default: 1,
    },
    limit: {
      required: true,
      type: Number,
      default: 1,
    },
    skip: {
      required: true,
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      page: 1,
      pageNumb: 0,
    };
  },
  computed: {
    count() {
      return Math.ceil(this.total / this.limit);
    },
  },
  watch: {
    skip(newVal, oldVal) {
      this.page = this.skip == 0 ? 1 : this.skip / this.limit + 1;
    },
  },
  created() {
    this.page = this.skip == 0 ? 1 : this.skip / this.limit + 1;
    this.pageNumb = this.page;
  },
  methods: {
    clickCallback(pageNum) {
      let useId = null;
      if (this.pageNumb && pageNum * this.limit > 1000) {
        if (pageNum - 1 === this.pageNumb) {
          useId = '$lt';
        }
        if (pageNum === this.pageNumb - 1) {
          useId = '$gt';
        }
      }
      this.pageNumb = pageNum;
      this.$emit('page', (pageNum - 1) * this.limit, useId);
    },
  },
};
</script>

<style scoped>
.pagination-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  list-style: none;
  padding: 0;
}

.page-item {
  margin: 0 2px;
}

.page-item a {
  padding: 6px 12px;
  border-radius: 4px;
  color: #666;
  background-color: white;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

:deep(.page-item.active) a {
  font-family: 'Lato-Bold', sans-serif;
}

.page-item a:hover:not(.active) {
  background-color: #f1f1f1;
}

.page-item.disabled a {
  color: #999;
  cursor: not-allowed;
}
</style>
