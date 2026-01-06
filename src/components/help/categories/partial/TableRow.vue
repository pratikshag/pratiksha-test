<template>
  <tr>
    <td v-text="item.name"></td>
    <td v-if="hasSubCategory">
      Total: {{ item.sub_categories.length }}
      <router-link
        :to="{ name: 'help-sub-categories', params: { category_id: item._id } }"
        v-text="'View Sub-Category'"
      ></router-link>
    </td>
    <td v-else-if="!subCategory">none</td>
    <td v-text="item.count"></td>
    <td class="category-icon">
      <img v-if="hasImage" :src="item.image.url" alt="Icon Image" width="30" height="30" />
    </td>
    <td v-text="country"></td>
    <td v-text="position"></td>
    <td>
      <ul class="actions">
        <li>
          <router-link :to="to">
            <span aria-hidden="true" class="fa fa-pencil"></span>
          </router-link>
        </li>
        <li>
          <a href="javascript:;" @click="$emit('delete-category', item)">
            <span aria-hidden="true" class="fa fa-trash"></span>
          </a>
        </li>
        <li>
          <a href="javascript:;" @click="$emit('update:is_active', item)">
            <span :class="isToggle"></span>
          </a>
        </li>
      </ul>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'table-row',

  props: {
    item: {
      type: Object,
    },
    subCategory: {
      type: Boolean,
    },
  },

  data() {
    return {
      context: {
        country: {
          sociolla: 'Indonesia',
          sociolla_vn: 'Vietnam',
        },
      },
    };
  },

  computed: {
    hasSubCategory() {
      return Object.keys(this.item).indexOf('sub_categories') > -1 ? this.item.sub_categories.length > 0 : false;
    },

    hasImage() {
      return this.item.image && this.item.image.url;
    },

    country() {
      return Object.keys(this.item).indexOf('created_from') > -1 ? this.context.country[this.item.created_from] : '-';
    },

    position() {
      return this.item.created_from == 'sociolla_vn' ? this.item.position_vn : this.item.position;
    },

    isToggle() {
      return this.item.is_active ? 'fa fa-toggle-on' : 'fa fa-toggle-off';
    },

    to() {
      return this.subCategory
        ? {
            name: 'help-sub-category-edit',
            params: {
              subcategory_id: this.item._id,
            },
          }
        : {
            name: 'help-category-edit',
            params: {
              category_id: this.item._id,
            },
          };
    },
  },
};
</script>
