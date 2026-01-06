<template>
  <label class="soco-switch">
    <input type="checkbox" :checked="isChecked" @change="handleChange" />
    <span class="slider"></span>
  </label>
</template>

<script>
export default {
  name: 'socoSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isChecked: this.modelValue,
    };
  },
  watch: {
    modelValue(newVal) {
      this.isChecked = newVal; // Sync prop changes to internal state
    },
  },
  methods: {
    handleChange(event) {
      this.isChecked = event.target.checked; // Update local state
      this.$emit('update:modelValue', this.isChecked); // Emit the new state
    },
  },
};
</script>

<style scoped>
.soco-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.soco-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #da709e;
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
