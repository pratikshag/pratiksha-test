<template>
  <div class="help-content">
    <router-link
      :to="{ name: 'help-content-create' }"
      class="sc-btn sc-btn-primary sc-btn-rounded sc-btn-lg sc-uppercase sc-mb-15"
    >
      <span class="fa fa-plus"></span> Add Content
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <TableFilter @filter="$_onFilter" />

    <div class="sc-table-responsive">
      <table class="sc-table">
        <colgroup>
          <col style="width: 25%" />
        </colgroup>
        <thead>
          <tr>
            <TableSort v-for="item in sort" :key="item.key" :field="item" @sort="onSort" />
            <TableSort v-if="isSortPosition" :key="sortPosition.key" :field="sortPosition" @sort="onSort" />
            <th v-else>Position</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!(posts && posts.length)" :cols="10" />
          <TableRow
            v-for="item in posts"
            :key="item._id"
            :item="item"
            @update:is_active="toggleActive"
            @delete-content="deleteContent"
          />
        </tbody>
      </table>
    </div>

    <TablePagination v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TableFilter from 'components/help/content/partial/TableFilter';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/help/content/partial/TableRow';
import filter from 'mixins/filter';
import paginate from 'mixins/paginate';

export default {
  name: 'help-content',

  components: {
    TableFilter,
    TableSort,
    TableRow,
  },

  mixins: [filter, paginate],

  data() {
    return {
      posts: [],
      //
      loading: false,
      sort: {
        title: {
          text: 'Title',
          key: 'title',
        },
        country: {
          text: 'Country',
          key: 'created_from',
        },
        status: {
          text: 'Status',
          key: 'status',
        },
        category: {
          text: 'Category',
          key: 'category.name',
        },
        subcategory: {
          text: 'Sub-Category',
          key: 'subcategory.name',
        },
        rating: {
          text: 'Rating',
          key: 'total_likes',
        },
        views: {
          text: 'Views',
          key: 'total_views',
        },
        date: {
          text: 'Date',
          key: 'published_at',
        },
      },
    };
  },

  computed: {
    params() {
      // destruct needed query
      const { title, created_from, status, category, subcategory, platform, sort } = this.$route.query;

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
          ...(created_from ? { created_from } : false),
          ...(status ? { status } : false),
          ...(category ? { 'category.slug': category } : false),
          ...(subcategory ? { 'subcategory.slug': subcategory } : false),
          ...(platform ? { platform } : false),
          post_type: 'help_page_article',
        },
        //
        sort: sort || '-updated_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },

    isSortPosition() {
      return !!this.$route.query?.created_from;
    },

    sortPosition() {
      return {
        text: 'Position',
        key: 'position',
      };
    },
  },

  watch: {
    $route: 'init',

    // sort position based on created_from query
    '$route.query.created_from': {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.sortPosition.key = newValue == 'sociolla_vn' ? 'position_vn' : 'position';
        } else {
          this.sortPosition.key = 'position';
        } // default key
      },
    },
  },

  created() {
    this.getCount(this.params).then((count) => {
      this.$_updateCount(count);

      this.init();
    });
  },

  methods: {
    ...mapActions('posts', ['getCount', 'getPosts', 'updatePost', 'deletePost']),

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

      this.getPosts(this.params).then((data) => {
        (this.posts = data.map((item) => ({
          ...item,
          ...(item?.position || { position: 1 }),
          ...(item?.position_vn || { position_vn: 1 }),
        }))),
          (this.loading = false);
      });
    },

    deleteContent(item) {
      this.$dialog
        .confirm('Please confirm to continue')
        .then(() => this.deletePost({ id: item._id }))
        .then(() => this.init())
        .catch(console.log);
    },

    toggleActive(item) {
      this.$dialog
        .confirm('Please confirm to continue')
        .then(() =>
          this.updatePost({
            id: item._id,
            payload: {
              is_active: !item.is_active,
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
@import 'scss/help-content';
</style>
