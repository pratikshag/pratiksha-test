<template>
  <div class="form-editor sc-form-group">
    <ul class="list-inline">
      <li v-for="(list, index) in views" :key="index" :class="{ active: index == viewIndex }" class="list-inline-item">
        <a href="javascript:;" @click="viewIndex = index" v-text="list"></a>
      </li>
    </ul>

    <textarea
      v-if="viewIndex"
      v-model="text"
      v-bind="$attrs"
      class="sc-form-input"
      rows="7"
      aria-describedby="content"
    ></textarea>

    <VueEditor v-else v-model="text" v-bind="$attrs" :editor-toolbar="customToolbar" :editor-options="editorSettings" />
  </div>
</template>

<script>
import { VueEditor, Quill } from 'vue2-editor';

import { ImageDrop } from 'quill-image-drop-module';
import ImageResize from 'quill-image-resize-module';

Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);

export default {
  name: 'text-editor',

  components: { VueEditor },

  inheritAttrs: false,

  props: {
    value: {
      required: true,
    },
    label: {
      required: true,
    },
  },

  data() {
    return {
      viewIndex: 0,
      views: [this.label, 'Html'],
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
      ],
      editorSettings: {
        modules: {
          imageDrop: true,
          imageResize: {
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
          },
        },
      },
    };
  },

  computed: {
    text: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },
  },
};
</script>
