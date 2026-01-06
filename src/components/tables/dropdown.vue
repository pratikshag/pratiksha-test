<template>
  <div :ref="dropdownRef" class="dropdown" :class="{ open: isDropdownOpen }">
    <div :ref="toggleRef" :class="classNameToggle" @click.prevent="toggle">
      <slot name="toggle"></slot>
    </div>

    <ul v-if="hasOptions" class="dropdown__menu">
      <template v-for="(option, key) in options">
        <li v-if="option && option.type !== 'divider'" :key="key">
          <a href="#" @click.prevent="selectOption(option)" v-html="option.text"></a>
        </li>
        <li v-else :key="`divider-${key}`" class="dropdown__divider"></li>
      </template>
      <slot name="suffix-custom-action" :selectOption="selectOption"></slot>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Dropdown',
  props: {
    classNameToggle: {
      required: true,
      type: String,
    },
    identifier: {
      required: true,
      type: String,
    },
    options: {
      required: true,
      type: Array,
    },
    toggleText: {
      required: false,
      default: '',
      type: String,
    },
  },
  data() {
    return {
      isDropdownOpen: false,
    };
  },
  computed: {
    dropdownRef() {
      return `dropdown${this.identifier}`;
    },
    toggleRef() {
      return `toggle${this.identifier}`;
    },
    hasOptions() {
      return this.options.length > 0 || (this.$slots && this.$slots['suffix-custom-action']);
    },
  },
  watch: {
    toggleText(newToggleText, oldToggleText) {
      if (newToggleText !== oldToggleText) {
        this.updateTextToggle(newToggleText, oldToggleText);
      }
    },
  },
  mounted() {
    document.addEventListener('click', this.documentClick);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.documentClick);
  },
  methods: {
    toggle() {
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectOption(option) {
      this.isDropdownOpen = false;
      this.$emit('getSelectedOption', option);
    },
    updateTextToggle(newToggleText, oldToggleText) {
      const toggleEl = document.querySelector(`[ref="${this.toggleRef}"]`);
      if (toggleEl) {
        toggleEl.innerHTML = toggleEl.innerHTML.replace(oldToggleText, newToggleText);
      }
    },
    documentClick(e) {
      const dropdownEl = document.querySelector(`[ref="${this.dropdownRef}"]`);
      if (dropdownEl && !dropdownEl.contains(e.target)) {
        this.isDropdownOpen = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdown {
  position: relative;
  display: inherit;

  &.open {
    .dropdown__menu {
      display: block;
    }
    .button {
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    }
  }

  .button {
    line-height: 25px;
  }
}

.dropdown__menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  float: left;
  min-width: 160px;
  padding: 5px 0;
  margin: 2px 0 0;
  font-size: 14px;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
  display: none;

  > li > a {
    padding: 5px 10px;
    display: block;
    color: #333;

    &:hover {
      text-decoration: none;
      color: #fff;
      background-color: #00aff0;
    }

    .fa-icon {
      margin-right: 8px;
      width: 22px;
      text-align: center;
    }
  }
}

.dropdown__divider {
  height: 1px;
  margin: 7.5px 0;
  overflow: hidden;
  background-color: #e5e5e5;
}
</style>
