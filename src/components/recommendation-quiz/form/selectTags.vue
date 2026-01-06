<template>
  <dropdown :class-name="'select'">
    <template slot="btn" class="btn" width="150px">{{ selectedText }}</template>
    <template slot="body">
      <li class="option" @click="$emit('category', null, 'All')">All</li>
      <template v-if="tags">
        <ul v-for="(tag, key) in tags" :key="key">
          <li
            v-if="tag.subtags.length == 0"
            class="option"
            style="cursor: pointer"
            @click="$emit('tagsChange', indexOption, tag.code)"
          >
            {{ tag.name }}
          </li>
          <li v-else>
            <dropdown :trigger="'hover'" :role="'sublist'" :align="'right'">
              <template slot="btn">{{ tag.name }}</template>
              <template slot="body">
                <li class="option" style="cursor: pointer" @click="$emit('tagsChange', indexOption, tag.code)">
                  {{ tag.name }}
                </li>
                <ul v-for="(subtag, keyS) in tag.subtags" :key="keyS">
                  <li class="option" style="cursor: pointer" @click="$emit('tagsChange', indexOption, subtag.code)">
                    {{ subtag.name }}
                  </li>
                </ul>
              </template>
            </dropdown>
          </li>
        </ul>
      </template>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from 'bp-vuejs-dropdown';

export default {
  name: 'select-tags',
  components: { Dropdown },
  props: ['selectedText', 'tags', 'indexOption'],
  data() {
    return {};
  },
};
</script>
