<template>
  <div class="input-auto-complete-common">
    <div class="input-wrapper">
      <template v-if="$slots.iconLeft || $scopedSlots.iconLeft" slot="iconLeft">
        <slot name="iconLeft"></slot>
      </template>
      <input
        ref="input"
        v-model="newValue"
        :disabled="disabledInput"
        :inputClass="classNameInput"
        autocomplete="off"
        class="form-control"
        :placeholder="placeholder"
        v-bind="$attrs"
        @blur="onBlur"
        @focus="focused"
        @keydown.down="keyArrows('down')"
        @keydown.enter.prevent="enterPressed"
        @keydown.tab="tabPressed"
        @keydown.up="keyArrows('up')"
        @keyup.esc.prevent="isActive = false"
      />
      <div v-if="isLoading" class="loaderspin"></div>
      <slot v-else-if="$slots.iconRight || $scopedSlots.iconRight" name="iconRight"></slot>
    </div>
    <div ref="dropdown" :class="{ open: showDropdown }" class="dropdown">
      <ul class="dropdown__menu">
        <li v-if="hasHeaderSlot">
          <a>
            <slot name="header" />
          </a>
        </li>
        <li v-for="(option, index) in data" v-show="isActive" :key="index" @click="setSelected(option, closeOnSelect)">
          <a :class="{ 'is-hovered': option === hovered }" class="dropdown-item-select">
            <slot v-if="$slots.default || $scopedSlots.default" :option="option"></slot>
            <span v-else v-html="getValue(option, true)"></span>
          </a>
        </li>
        <li v-if="hasFooterSlot">
          <a>
            <slot name="footer" />
          </a>
        </li>
        <li v-if="data.length === 0 && hasEmptySlot">
          <a>
            <slot name="empty" />
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'input-auto-complete',
  props: {
    placeholder: {
      type: String,
      default: 'Type something...',
    },
    value: {
      type: String,
    },
    // eslint-disable-next-line vue/require-valid-default-prop
    data: { type: Array, default: [] },
    field: {
      type: String,
      default: 'value',
    },
    classNameInput: { type: String, default: '' },
    keepFirst: {
      type: Boolean,
      default: false,
    },
    clearOnSelect: {
      type: Boolean,
      default: false,
    },
    openOnFocus: {
      type: Boolean,
      default: false,
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    clearOnFocus: {
      type: Boolean,
      default: false,
    },
    clearOnBlurIfNotFound: {
      type: Boolean,
      default: true,
    },
    disabledInput: {
      type: Boolean,
      default: false,
    },
    closeOnSelect: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selected: null,
      hovered: null,
      isValid: true,
      inSelected: false,
      newValue: this.value,
      newValueTemp: this.value,
      isListInViewportVertically: true,
      hasFocus: false,
      isActive: false,
      // eslint-disable-next-line vue/no-reserved-keys
      _isAutocomplete: true,
      // eslint-disable-next-line vue/no-reserved-keys
      _elementRef: 'input',
    };
  },
  computed: {
    hasHeaderSlot() {
      return !!this.$slots.header;
    },
    showDropdown() {
      const { data, hasEmptySlot, hasHeaderSlot, hasFooterSlot, isActive } = this;

      return isActive && (data.length > 0 || hasEmptySlot || hasHeaderSlot || hasFooterSlot);
    },
    hasEmptySlot() {
      return !!this.$slots.empty;
    },
    hasFooterSlot() {
      return !!this.$slots.footer;
    },
    /// cek
    whiteList() {
      const whiteList = [];
      whiteList.push(this.$refs.input);
      whiteList.push(this.$refs.dropdown);

      // Add all chidren from dropdown
      if (this.$refs.dropdown !== undefined) {
        const children = this.$refs.dropdown.querySelectorAll('*');
        for (const child of children) {
          whiteList.push(child);
        }
      }

      return whiteList;
    },
  },
  watch: {
    /**
     * When updating input's value
     *   1. Emit changes
     *   2. If value isn't the same as selected, set null
     *   3. Close dropdown if value is clear or else open it
     */
    newValue(value) {
      this.$emit('input', value);

      // Check if selected is invalid
      const currentValue = this.getValue(this.selected);
      if (currentValue && currentValue !== value) {
        this.setSelected(null, false);
      }

      // Close dropdown if input is clear or else open it
      if (this.hasFocus && (!this.openOnFocus || value)) {
        this.isActive = !!value;
      }
    },
    value(value) {
      this.newValue = value;
    },
    data(value) {
      // Keep first option always pre-selected
      if (this.keepFirst) {
        this.selectFirstOption(value);
      }

      this.hovered = null;
    },
  },
  created() {
    document.addEventListener('click', this.clickedOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.clickedOutside);
  },
  methods: {
    /**
     * Get value of an object property/path even if it's nested
     */
    getValueByPath(obj, path) {
      return path.split('.').reduce((o, i) => o[i], obj);
    },

    /**
     * Escape regex characters
     * http://stackoverflow.com/a/6969486
     */
    escapeRegExpChars(value) {
      if (!value) {
        return value;
      }

      return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    },

    /**
     * Return display text for the input.
     * If object, get value from path, or else just the value.
     * If hightlight, find the text with regex and make bold.
     */
    getValue(option, isHighlight = false) {
      if (!option) {
        return;
      }

      const value = typeof option === 'object' ? this.getValueByPath(option, this.field) : option;

      const escapedValue = typeof this.newValue === 'string' ? this.escapeRegExpChars(this.newValue) : this.newValue;
      const regex = new RegExp(`(${escapedValue})`, 'gi');

      return isHighlight ? value.replace(regex, '<b>$1</b>') : value;
    },

    /**
     * Arrows keys listener.
     * If dropdown is active, set hovered option, or else just open.
     */
    keyArrows(direction) {
      const sum = direction === 'down' ? 1 : -1;

      if (this.isActive) {
        let index = this.data.indexOf(this.hovered) + sum;
        index = index > this.data.length - 1 ? this.data.length : index;
        index = index < 0 ? 0 : index;

        this.setHovered(this.data[index]);

        const list = this.$refs.dropdown;
        const element = list.querySelectorAll('.dropdown-item-select')[index];

        if (!element) {
          return;
        }

        const visMin = list.scrollTop;
        const visMax = list.scrollTop + list.clientHeight - element.clientHeight;

        if (element.offsetTop < visMin) {
          list.scrollTop = element.offsetTop;
        } else if (element.offsetTop >= visMax) {
          list.scrollTop = element.offsetTop - list.clientHeight + element.clientHeight;
        }
      } else {
        this.isActive = true;
      }
    },

    /**
     * Set which option is currently hovered.
     */
    setHovered(option) {
      if (option === undefined) {
        return;
      }

      this.hovered = option;
    },

    /**
     * Select first option
     */
    selectFirstOption(options) {
      this.$nextTick(() => {
        if (options.length) {
          // If has visible data or open on focus, keep updating the hovered
          if (this.openOnFocus || (this.newValue !== '' && this.hovered !== options[0])) {
            this.setHovered(options[0]);
          }
        } else {
          this.setHovered(null);
        }
      });
    },

    /**
     * Close dropdown if clicked outside.
     */
    clickedOutside(event) {
      if (this.whiteList.indexOf(event.target) < 0) {
        this.isActive = false;
      }
    },

    /**
     * Enter key listener.
     * Select the hovered option.
     */
    enterPressed() {
      if (this.hovered === null) {
        if (this.data.length === 1) {
          this.hovered = this.data[0];
        } else {
          this.$emit('enter');

          return;
        }
      }

      this.setSelected(this.hovered);
      this.$nextTick(() => {
        this.$emit('enter');
      });
    },

    /**
     * Tab key listener.
     * Select hovered option if it exists, close dropdown, then allow
     * native handling to move to next tabbable element.
     */
    tabPressed() {
      if (this.hovered === null) {
        this.isActive = false;
        return;
      }

      this.setSelected(this.hovered);
    },
    onBlur(event) {
      this.hasFocus = false;
      this.$emit('blur', event);

      setTimeout(() => {
        if (this.clearOnFocus && !Boolean(this.newValue)) {
          this.newValue = this.newValueTemp;
        }

        if (this.clearOnBlurIfNotFound) {
          const skipClear = Boolean(this.selected);

          if (!skipClear) {
            this.newValue = '';
          }
        }
      }, 150);
    },

    /**
     * Focus listener.
     * If value is the same as selected, select all text.
     */

    focused(event) {
      if (this.getValue(this.selected) === this.newValue) {
        this.$el.querySelector('input').select();
      }

      if (this.openOnFocus) {
        this.isActive = true;
        if (this.keepFirst) {
          this.selectFirstOption(this.data);
        }
      }

      if (Boolean(this.newValue) && this.clearOnFocus) {
        this.newValueTemp = this.newValue;
        this.newValue = '';
      }

      this.hasFocus = true;
      this.$emit('focus', event);
    },
    setSelected(option, closeDropdown = true) {
      if (option === undefined) {
        return;
      }

      this.selected = option;
      this.$emit('select', this.selected);
      if (this.selected !== null) {
        this.newValue = this.clearOnSelect ? '' : this.getValue(this.selected);
      }

      closeDropdown &&
        this.$nextTick(() => {
          this.isActive = false;
        });
    },
  },
};
</script>

<style lang="scss">
.input-auto-complete-common {
  .input-wrapper {
    position: relative;
  }
  .form-control {
    background: #fff;
  }

  a.dropdown-item-select.is-hovered {
    text-decoration: none;
    color: #ffffff;
    background-color: #00aff0;
  }

  .dropdown {
    &.open {
      .dropdown__menu {
        display: block;
        width: 100%;
      }
      .button {
        box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
      }
    }
  }
  .dropdown__menu {
    min-width: 100%;
    padding: 0.5rem;
    max-height: 200px;
    overflow: auto;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    float: left;
    min-width: 160px;
    padding: 5px;
    margin: 2px 0 0;
    font-size: 16px;
    text-align: left;
    list-style: none;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ccc;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 3px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    display: none;

    li {
      cursor: pointer;
      color: #000;
      a {
        color: #000;
      }
    }
    li + li {
      margin-top: 0.5rem;
    }
  }

  .loaderspin {
    width: 12px;
    height: 12px;
    position: absolute;
    right: 8px;
    top: 8px;
    margin: 0;
    border-width: 3px;
  }
}
</style>
