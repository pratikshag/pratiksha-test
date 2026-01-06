<template>
  <tr>
    <td class="banner">
      <img :src="banner" :alt="item.title" />
    </td>
    <td class="job-title" :title="item.title" v-text="item.title"></td>
    <td v-text="created_at"></td>
    <td v-text="registration_date"></td>
    <td v-if="total_participants">
      <router-link :to="{ name: 'sbn-job-participants', params: { id: item._id } }">
        <span class="fa fa-search"></span> view ({{ total_participants }})</router-link
      >
    </td>
    <td v-else>none</td>
    <td class="job-type" :title="textJobType" v-text="textJobType"></td>
    <td v-text="state.text"></td>
    <td :class="{ 'is-job-over': isJobOver }" :title="titleReportDeadline" v-text="publish_date"></td>
    <td>
      <ul class="actions">
        <li>
          <router-link :to="to">
            <span title="Edit" aria-hidden="true" class="fa fa-pencil"></span>
          </router-link>
        </li>
        <li>
          <a href="javascript:;" @click="$emit('delete-job', item)">
            <span aria-hidden="true" class="fa fa-trash"></span>
          </a>
        </li>
      </ul>
    </td>
  </tr>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'table-row',

  props: {
    item: {
      type: Object,
    },
  },

  // data () {},

  computed: {
    ...mapState('jobs', ['options']),

    banner() {
      return this.item.cover.url ? this.item.cover.url : 'https://via.placeholder.com/80x30?text=';
    },

    created_at() {
      return moment(this.item.created_at).tz('Asia/Jakarta').format('DD-MM-YYYY');
    },

    start_date() {
      return moment(this.item.start_date).tz('Asia/Jakarta').format('DD-MM-YYYY');
    },

    end_date() {
      return moment(this.item.end_date).tz('Asia/Jakarta').format('DD-MM-YYYY');
    },

    job_type() {
      return typeof this.item.job_type == 'string' ? [] : this.item.job_type;
    },

    isJobOver() {
      const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');
      const publish_date = moment(this.item.publish_date).tz('Asia/Jakarta').format('YYYY-MM-DD');

      return moment(today).diff(publish_date, 'days') >= 0;
    },

    textJobType() {
      return this.job_type.length
        ? this.job_type.length > 1
          ? this.job_type.map(({ text }) => text).join(', ')
          : this.job_type[0].text
        : '-';
    },

    titleReportDeadline() {
      return this.isJobOver ? 'Job is over' : 'Job is valid';
    },

    state() {
      return this.item.state ? this.options.state.find(({ value }) => value == this.item.state) : { text: '-' };
    },

    publish_date() {
      return moment(this.item.publish_date).tz('Asia/Jakarta').format('DD-MM-YYYY');
    },

    registration_date() {
      return this.start_date + ' - ' + this.end_date;
    },

    total_participants() {
      return Object.keys(this.item).indexOf('total_participants') > -1 ? this.item.total_participants : 0;
    },

    to() {
      return {
        name: 'sbn-job-edit',
        params: {
          id: this.item._id,
        },
      };
    },
  },

  // created () {},

  // methods: {}
};
</script>
