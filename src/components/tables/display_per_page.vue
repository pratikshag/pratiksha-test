<template>
  <div class="display-per-page">
    <span>Display&nbsp;</span>
    <Dropdown
      class-name-toggle="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
      identifier="display"
      :toggle-text="toggleText"
      :options="listOptions"
      @getSelectedOption="getSelectedOption"
    >
      <template slot="toggle">{{ toggleText }}<span class="fa fa-caret-down" /></template>
    </Dropdown>
  </div>
</template>

<script>
import Dropdown from './dropdown.vue';
export default {
  name: 'DisplayPerPage',
  components: {
    Dropdown,
  },
  props: {
    total: {
      required: false,
      type: Number,
      default: 0,
    },
    options: {
      required: false,
      type: Array,
      default: () => [],
    },
    newOptions: {
      required: false,
      type: Array,
      default: () => [],
    },
    limit: {
      required: false,
      type: Number,
      default: 20,
    },
  },
  data() {
    return {
      toggleText: '20',
    };
  },
  computed: {
    listOptions() {
      if (this.newOptions.length) {
        return this.newOptions;
      } else {
        return [
          {
            text: '20',
            name: '20',
          },
          {
            text: '50',
            name: '50',
          },
          {
            text: '100',
            name: '100',
          },
          {
            text: '300',
            name: '300',
          },
          ...this.options,
        ];
      }
    },
  },
  created() {
    this.toggleText = String(this.limit);
  },
  methods: {
    getSelectedOption(option) {
      this.toggleText = option.text;
      this.$emit('display', this.toggleText);
    },
  },
};
</script>

<style lang="scss" scoped>
.display-per-page ::v-deep .dropdown {
  margin: 0 4px;
}
</style>
