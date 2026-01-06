<template>
  <form class="sc-filter" @submit.prevent="onSubmit">
    <div class="sc-filter-item">
      <label class="sc-filter-label">Search By ID User: </label>
      <input v-model="id" v-validate="'object_id'" class="sc-filter-input" type="text" name="Id User" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">Name: </label>
      <input v-model="name" class="sc-filter-input" type="text" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">Email: </label>
      <input v-model="email" class="sc-filter-input" type="text" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">Phone: </label>
      <input v-model="phone_no" class="sc-filter-input" type="text" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">Deleted by: </label>
      <input v-model="deleted_by" class="sc-filter-input" type="text" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">From: </label>
      <input v-model="date_begin" class="sc-filter-input" type="date" />
    </div>
    <div class="sc-filter-item">
      <label class="sc-filter-label">To: </label>
      <input v-model="date_end" class="sc-filter-input" type="date" />
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
import tableFilter, { models } from 'mixins/table-filter';

export default {
  name: 'table-filter',

  mixins: [tableFilter],

  data() {
    return {
      selected: {
        id: '',
        name: '',
        email: '',
        phone_no: '',
        deleted_by: '',
        date_begin: '',
        date_end: '',
      },
    };
  },

  computed: {
    ...models(['id', 'name', 'email', 'phone_no', 'deleted_by', 'date_begin', 'date_end']),
  },

  // watch: {},

  // created () {},

  methods: {
    async validateFilter() {
      const isValid = await this.$validator.validateAll();
      if (!isValid) {
        const firstError = this.errors.items[0];
        const errMsg = `Error in "${firstError.field}": ${firstError.msg}`;
        this.$toasted.global.error(errMsg);
        throw new Error(errMsg);
      }
    },
    async onSubmit(event) {
      await this.validateFilter();
      this.$_onSubmit(event);
    },
  },
};
</script>
