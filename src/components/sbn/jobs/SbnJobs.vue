<template>
  <div class="sbn-jobs">
    <router-link :to="{ name: 'sbn-job-create' }" class="sc-btn sc-btn-rounded sc-btn-primary sc-btn-lg sc-mb-15">
      <span class="fa fa-plus"></span> Create Job
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <TableFilter @filter="$_onFilter" />
    <div class="sc-table-responsive">
      <table class="sc-table">
        <colgroup>
          <col style="width: 10%" />
        </colgroup>
        <thead>
          <tr>
            <th>Banner</th>
            <TableSort :field="sort.title" @sort="onSort" />
            <TableSort :field="sort.createdAt" @sort="onSort" />
            <th>Registration Date</th>
            <th>Participants</th>
            <th>Job Type</th>
            <TableSort :field="sort.state" @sort="onSort" />
            <TableSort :field="sort.publishDate" @sort="onSort" />
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!loading && !(jobs && jobs.length)" :cols="9" />

          <TableRow v-for="item in jobs" :key="item._id" :item="item" @delete-job="onDeleteJob" />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TableFilter from 'components/sbn/jobs/partial/TableFilter';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/sbn/jobs/partial/TableRow';
import filter from 'mixins/filter';
import paginate from 'mixins/paginate';

export default {
  name: 'sbn-jobs',

  components: {
    TableFilter,
    TableSort,
    TableRow,
  },

  mixins: [filter, paginate],

  data() {
    return {
      jobs: [],
      //
      loading: false,
      sort: {
        title: {
          text: 'Job Title',
          key: 'title',
        },
        createdAt: {
          text: 'Created at',
          key: 'created_at',
        },
        state: {
          text: 'State',
          key: 'state',
        },
        publishDate: {
          text: 'Report Deadline',
          key: 'publish_date',
        },
      },
    };
  },

  computed: {
    params() {
      const { title, state, sort } = this.$route.query;

      return {
        filter: {
          ...(title
            ? {
                title: {
                  $regex: title,
                  $options: 'i',
                },
              }
            : false),
          ...(state ? { state } : false),
        },
        //
        sort: sort || '-updated_at',
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
    ...mapActions('jobs', ['getCount', 'getJobs', 'updateJob', 'deleteJob']),

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

      this.getJobs(this.params).then((data) => {
        this.jobs = data;
        this.loading = false;
      });
    },

    onDeleteJob(item) {
      this.$dialog
        .confirm('Please confirm to continue')
        .then(() => this.deleteJob({ id: item._id }))
        .then(() => this.init())
        .catch(console.log);
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/sbn-jobs';
</style>
