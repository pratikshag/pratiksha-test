<template>
  <tr>
    <td v-text="item.user_id"></td>
    <td>
      <a target="_blank" :href="$_userLink(item.user.user_name)">
        {{ item.user.user_name }} <span class="fa fa-external-link"></span>
      </a>
    </td>
    <td>{{ maskEmail(item.user.email) }}</td>
    <td v-text="item.question_1.answer"></td>
    <td v-text="item.question_2.answer"></td>
    <td v-text="item.question_3.answer"></td>
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

  computed: {},

  methods: {},
};
</script>
