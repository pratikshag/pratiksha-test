<template>
  <a v-if="sort == field" @click="$emit('sort', `-${field}`)">
    <span aria-hidden="true" class="fa fa fa-sort-asc"></span>
  </a>
  <a v-else-if="sort == `-${field}`" @click="$emit('sort', '')">
    <span aria-hidden="true" class="fa fa fa-sort-desc"></span>
  </a>
  <a v-else @click="$emit('sort', field)">
    <span aria-hidden="true" class="fa fa-unsorted"></span>
  </a>
</template>

<script>
export default {
  name: 'sort-field',
  props: ['sort', 'field'],
};
</script>
