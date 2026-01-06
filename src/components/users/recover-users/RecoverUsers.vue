<template>
  <div class="recover-users pt-3">
    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <TableFilter @filter="$_onFilter" />

    <div class="sc-table-responsive">
      <table class="sc-table">
        <colgroup>
          <col style="width: 10%" />
        </colgroup>
        <thead>
          <tr>
            <TableSort v-for="item in sort" :key="item.key" :field="item" @sort="onSort" />
            <th>Actions</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!loading && !(users && users.length)" :cols="6" />
          <TableRow v-for="item in users" :key="item._id" :item="item" @recover-user="onRecoverUser" />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TableFilter from 'components/users/recover-users/partial/TableFilter';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/users/recover-users/partial/TableRow';
import filter from 'mixins/filter';
import paginate from 'mixins/paginate';

export default {
  name: 'recover-users',

  components: {
    TableFilter,
    TableSort,
    TableRow,
  },

  mixins: [filter, paginate],

  data() {
    return {
      users: [],
      //
      loading: false,
      sort: {
        id: { text: 'ID', key: 'id' },
        name: { text: 'Name', key: 'name' },
        userName: { text: 'Username', key: 'user_name' },
        email: { text: 'Email', key: 'email' },
        violation_count: { text: 'Spam review violation counter', key: 'violation_count' },
        deleted_by: { text: 'Deleted by', key: 'deleted_by.email' },
        deleted_at: { text: 'Deleted at', key: 'deleted_at' },
        register: { text: 'Register', key: 'created_at' },
        phoneNo: { text: 'Phone', key: 'phone_no' },
      },
    };
  },

  computed: {
    params() {
      const { id, name, email, violation_count, sort, phone_no, deleted_by, date_begin, date_end } = this.$route.query;

      return {
        filter: {
          ...(name ? { name } : false),
          ...(email ? { email } : false),
          ...(violation_count ? { violation_count: { violation_count } } : false),
          ...(deleted_by ? { 'deleted_by.email': deleted_by } : false),
          ...(date_begin && date_end ? { deleted_at: { gte: new Date(date_begin), lte: new Date(date_end) } } : false),
          is_deleted_user: true,
          is_deleted: true,
          phone_no,
          id,
        },
        //
        sort: sort || '-created_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },
  },

  watch: {
    $route: 'init',
  },

  created() {
    this.getCount(this.params).then((count) => {
      this.$_updateCount(count);

      this.init();
    });
  },

  methods: {
    ...mapActions('users', ['getCount', 'getUsers', 'updateStatus']),

    onSort(payload) {
      this.$data.$_recount = false;

      this.$router.replace(
        {
          query: {
            ...this.$route.query,
            sort: payload,
          },
        },
        () => {}
      );
    },

    async init() {
      this.loading = true;

      if (this.$data.$_recount) {
        await this.getCount(this.params).then((count) => this.$_updateCount(count));
      }

      this.getUsers(this.params)
        .then((data) => {
          for (let i = 0; i < data.length; i++) {
            if (data[i]?.deleted_at) {
              data[i]['deleted_at'] = moment(data[i]['deleted_at']).tz('Asia/Jakarta').format('D-M-YYYY HH:mm:ss');
            }
          }
          this.users = data;
          this.loading = false;
        })
        .catch((error) => {
          if (!error.response) {
            this.$toasted.global.error('Something went wrong!');
          }
          this.loading = false;
        });
    },

    onRecoverUser({ name, id }) {
      this.$dialog
        .confirm(`Do you want to recover ${name}?`)
        .then(() => this.updateStatus({ id, payload: { status: 'active', is_deleted: false } }))
        .then(() => this.init())
        .then(() =>
          this.$toasted.global.show(`Account ${name} successfully recover!`, {
            icon: 'check',
          })
        )
        .catch(console.log);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/sass/partial/help-reset';
@import '~@/sass/partial/help-mixin';
</style>
