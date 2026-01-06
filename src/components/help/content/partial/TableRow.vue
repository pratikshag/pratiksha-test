<template>
  <tr>
    <td :title="item.title" v-text="item.title"></td>
    <td v-text="country"></td>
    <td v-text="status"></td>
    <td v-text="category"></td>
    <td v-text="subcategory"></td>
    <td v-text="rating"></td>
    <td v-text="item.total_views"></td>
    <td v-text="published_at"></td>
    <td v-text="position"></td>
    <td>
      <ul class="actions">
        <li>
          <router-link :to="to">
            <span title="Edit" aria-hidden="true" class="fa fa-pencil"></span>
          </router-link>
        </li>
        <li style="margin: 0 5px">
          <a href="javascript:;" @click="$emit('delete-content', item)">
            <span aria-hidden="true" class="fa fa-trash"></span>
          </a>
        </li>
        <li>
          <a href="javascript:;" @click="$emit('update:is_active', item)">
            <span :class="[item.is_active ? 'fa-toggle-on' : 'fa-toggle-off']" class="fa"></span>
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
  },

  data() {
    return {
      context: {
        country: {
          sociolla: 'Indonesia',
          sociolla_vn: 'Vietnam',
        },
        status: {
          draft: 'Draft',
          publish: 'Published',
        },
      },
    };
  },

  computed: {
    country() {
      return Object.keys(this.item).indexOf('created_from') > -1 ? this.context.country[this.item.created_from] : '-';
    },

    status() {
      return this.context.status[this.item.status];
    },

    category() {
      return Object.keys(this.item).indexOf('category') > -1 ? this.item.category.name : '-';
    },

    subcategory() {
      return Object.keys(this.item).indexOf('subcategory') > -1 ? this.item.subcategory.name : '-';
    },

    rating() {
      return 'Thumbs Up: ' + this.item.total_likes;
    },

    published_at() {
      return moment(this.item.published_at).format('DD-MM-YYYY hh:mm:ss');
    },

    position() {
      return this.item.created_from == 'sociolla_vn' ? this.item.position_vn : this.item.position;
    },

    to() {
      return {
        name: 'help-content-edit',
        params: {
          id: this.item._id,
        },
      };
    },
  },
};
</script>
