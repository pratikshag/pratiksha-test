<template>
  <div class="help-contact-us">
    <div class="sc-table-title">Contact Us</div>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <TableFilter @filter="$_onFilter" />

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <TableSort v-for="item in sort" :key="item.key" :field="item" @sort="onSort" />
            <th>Images</th>
            <th>Order Ref</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!(contacts && contacts.length)" :cols="12" />

          <TableRow v-for="item in contacts" :key="item._id" :item="item" @update:status="toggleStatus" />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TableFilter from 'components/help/contact-us/partial/TableFilter';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/help/contact-us/partial/TableRow';
import filter from 'mixins/filter';
import paginate from 'mixins/paginate';

export default {
  name: 'help-contactus',

  components: {
    TableFilter,
    TableSort,
    TableRow,
  },

  mixins: [filter, paginate],

  // props: {},

  data() {
    return {
      contacts: [],
      //
      loading: false,
      sort: {
        date: {
          text: 'Date',
          key: 'created_at',
        },
        email: {
          text: 'Email',
          key: 'user.email',
        },
        fullname: {
          text: 'Fullname',
          key: 'user.name',
        },
        username: {
          text: 'Username',
          key: 'user.username',
        },
        category: {
          text: 'Category',
          key: 'category.name',
        },
        problem: {
          text: 'Problem',
          key: 'description',
        },
      },
    };
  },

  computed: {
    createdAt() {
      const { from, to } = this.$route.query;

      return from || to
        ? {
            created_at: {
              ...(from ? { $gte: moment(from).endOf('day').toISOString() } : false),
              ...(to ? { $lte: moment(to).endOf('day').toISOString() } : false),
            },
          }
        : false;
    },

    params() {
      const { sort, category } = this.$route.query;

      return {
        filter: {
          ...this.createdAt,
          ...(category ? { 'category.slug': category } : false),
        },
        sort: sort || '-created_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },

    referenceUrl() {
      return this.$store.state.SOCIOLLA_ADMIN_URL ? this.$store.state.SOCIOLLA_ADMIN_URL + '/orders/detail/' : false;
    },
  },

  watch: {
    $route: 'init',
  },

  created() {
    console.log(this.$store.state.SOCIOLLA_ADMIN_URL, this.referenceUrl);

    this.getCount(this.params).then((count) => {
      this.$_updateCount(count);

      this.init();
    });
  },

  methods: {
    ...mapActions('contacts', ['getCount', 'getContacts', 'updateContact']),

    async init() {
      this.loading = true;

      if (this.$data.$_recount) {
        await this.getCount(this.params).then((count) => this.$_updateCount(count));
      }

      this.getContacts(this.params)
        .then((data) => (this.contacts = data))
        .catch(
          ({
            response: {
              data: { data },
            },
          }) =>
            this.$toasted.global.error(`${data.statusCode}: ${data.errorCode}`, {
              icon: 'warning',
            })
        )
        .finally(() => (this.loading = false));
    },

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

    toggleStatus(item) {
      this.$dialog
        .confirm('Please confirm to continue')
        .then(() =>
          this.updateContact({
            id: item._id,
            payload: {
              status: item.status == 'resolved' ? 'unresolved' : 'resolved',
            },
          })
        )
        .then(() => this.init())
        .catch(console.log);
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/help-contact-us';
</style>
