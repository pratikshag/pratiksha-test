<template>
  <tr>
    <td v-text="created_at"></td>
    <td>{{ maskEmail(item.user.email) }}</td>
    <td v-text="item.user.name"></td>
    <td v-text="item.user.username"></td>
    <td v-text="category"></td>
    <td v-text="item.description"></td>
    <td v-if="item.images.length" class="image">
      <img v-for="(image, index) in item.images" :key="index" :src="image" width="30" height="30" />
    </td>
    <td v-else>-</td>
    <td v-if="item.order_reference">
      <a v-if="$parent.referenceUrl" href="javascript:;" @click="gotoReference">
        {{ item.order_reference }} <i class="fa fa-external-link"></i>
      </a>
      <span v-else v-text="item.order_reference"></span>
    </td>
    <td v-else>-</td>
    <td :class="status.active">{{ status.text }} <i :class="status.icon"></i></td>
    <td class="action">
      <a href="javascript:;" @click="$emit('update:status', item)">
        <i :class="action"></i>
      </a>
    </td>
  </tr>
</template>

<script>
import Api from '@/api/Api';

const api = new Api({
  name: 'MS_ORDER_API_URL',
  endpoint: '/orders',
});

export default {
  name: 'table-row',

  props: {
    item: {
      type: Object,
    },
  },

  computed: {
    created_at() {
      return moment(this.item.created_at).format('DD/MM/YYYY hh:mm:ss');
    },

    category() {
      return Object.keys(this.item).indexOf('category') > -1 ? this.item.category.name : '-';
    },

    status() {
      return this.item.status == 'resolved'
        ? {
            text: 'Resolved',
            icon: 'fa fa-check-circle-o',
            active: 'status active',
          }
        : {
            text: 'Not Resolved',
            icon: 'fa fa-exclamation-circle',
            active: 'status',
          };
    },

    action() {
      return this.item.status == 'resolved' ? 'fa fa-toggle-on' : 'fa fa-toggle-off';
    },
  },

  methods: {
    gotoReference() {
      api
        .getData({
          params: {
            filter: {
              reference_code: this.item.order_reference,
            },
            fields: '_id',
          },
        })
        .then(
          ({
            data: {
              data: [item],
            },
          }) => window.open(this.$parent.referenceUrl + this.item._id)
        )
        .catch(console.log);
    },
  },
};
</script>

<style lang="scss" scoped>
tr {
  > td {
    &.action {
      color: #28a745;
      white-space: nowrap;
    }
  }
}
</style>
