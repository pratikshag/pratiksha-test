<template>
  <tr>
    <td :colspan="cols" class="sc-table-empty">No data.</td>
  </tr>
</template>

<script>
export default {
  name: 'table-empty',
  props: {
    cols: {
      type: Number,
      required: false,
      default: 3,
    },
  },
};
</script>
