<template>
  <tr>
    <td v-text="item.id"></td>
    <td v-text="item.name"></td>
    <td>
      <a target="_blank" :href="$_userLink(item.user_name)">
        {{ item.user_name }} <span class="fa fa-external-link"></span>
      </a>
    </td>
    <td>{{ maskEmail(item.email) }}</td>
    <td>{{ item.violation_counter ? item.violation_counter : 0 }}</td>
    <td>
      <b>{{ maskEmail(item.deleted_by && item.deleted_by.email ? item.deleted_by.email : '') }}</b>
    </td>
    <td>
      <b>{{ item.deleted_at || '' }}</b>
    </td>
    <td v-text="created_at"></td>
    <td>{{ (item.phone_code || '+62') + maskPhoneSimple(item.phone_no) }}</td>
    <td>
      <ul class="actions">
        <li>
          <a href="javascript:;" class="btn btn-sm btn-warning" @click="$emit('recover-user', item)">
            <span aria-hidden="true" class="fa fa-user-times"></span> Recover
          </a>
        </li>
      </ul>
    </td>
    <td>
      <a>
        <router-link :to="`/users/detail/${item.id}?from=recover`" style="color: #225d42"> View Detail </router-link>
      </a>
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

  // data () {},

  computed: {
    created_at() {
      return moment(this.item.created_at).tz('Asia/Jakarta').format('DD-MM-YYYY');
    },
  },

  // created () {},

  // methods: {}
};
</script>
