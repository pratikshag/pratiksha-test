<template>
  <div class="help-categories">
    <router-link :to="button.to" class="sc-btn sc-btn-primary sc-btn-rounded sc-btn-lg sc-uppercase sc-mb-15">
      <span :class="button.iconClass"></span> {{ button.text }}
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <TableFilter v-if="!isSubCategory" @filter="$_onFilter" />
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th v-if="isSubCategory" v-text="sort.name.text"></th>
            <TableSort v-else :field="sort.name" @sort="onSort" />
            <th v-if="!isSubCategory">Sub Categories</th>
            <th v-if="isSubCategory" v-text="sort.count.text"></th>
            <TableSort v-else :field="sort.count" @sort="onSort" />
            <th>Icon Image</th>
            <th v-if="isSubCategory" v-text="sort.country.text"></th>
            <TableSort v-else :field="sort.country" @sort="onSort" />
            <TableSort v-if="isSortPosition" :key="sort.position.key" :field="sort.position" @sort="onSort" />
            <th v-else>Position</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!(categories && categories.length)" :cols="7" />
          <TableRow
            v-for="item in categories"
            :key="item._id"
            :item="item"
            :sub-category="isSubCategory"
            @update:is_active="toggleActive"
            @delete-category="deleteHelpCategories"
          />
        </tbody>
      </table>
    </div>

    <TablePagination v-if="!category_id" v-model="$_currentPage" :paginate="$_paginate" />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TableFilter from 'components/help/categories/partial/TableFilter';
import TableSort from 'components/tables/TableSort';
import TableRow from 'components/help/categories/partial/TableRow';
import filter from 'mixins/filter';
import paginate from 'mixins/paginate';

export default {
  name: 'help-categories',

  components: {
    TableFilter,
    TableSort,
    TableRow,
  },

  mixins: [filter, paginate],

  props: {
    category_id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      categories: [],
      //
      sort: {
        name: {
          text: 'Name',
          key: 'name',
        },
        count: {
          text: 'Article Count',
          key: 'count',
        },
        country: {
          text: 'Country',
          key: 'created_from',
        },
        position: {
          text: 'Position',
          key: 'position',
        },
      },
      loading: false,
    };
  },

  computed: {
    params() {
      // destruct needed query
      const { name, created_from, platform, sort } = this.$route.query;

      return {
        filter: {
          ...(name
            ? {
                name: {
                  $regex: name,
                  $options: 'i',
                },
              }
            : false),
          ...(created_from ? { created_from } : false),
          ...(platform ? { platform } : false),
          type: 'help_page_article',
        },
        sort: sort || '-updated_at',
        limit: this.$data.$_limit,
        skip: this.$data.$_limit * (this.$_currentPage - 1),
      };
    },

    isSubCategory() {
      return !!this.category_id;
    },

    isSortPosition() {
      return !!this.$route.query?.created_from && !this.isSubCategory;
    },

    button() {
      return this.isSubCategory
        ? {
            to: { name: 'help-categories' },
            text: 'Back',
            iconClass: 'fa fa-arrow-left',
          }
        : {
            to: { name: 'help-category-create' },
            text: 'Add Category',
            iconClass: 'fa fa-plus',
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
          this.sort.position.key = newValue == 'sociolla_vn' ? 'position_vn' : 'position';
        } else {
          this.sort.position.key = 'position';
        } // default key
      },
    },
  },

  created() {
    this.getCount(this.params).then((count) => {
      // paginate
      this.$data.$_count = count;
      this.$data.$_lastPage = Math.ceil(count / this.$data.$_limit);

      this.init();
    });
  },

  methods: {
    // category
    ...mapActions('categories', ['getCount', 'getCategories', 'putCategories', 'deleteCategories']),

    // sub category
    ...mapActions('categories', ['getSubCategory', 'putSubCategory', 'deleteSubCategory']),

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

    init() {
      this.loading = true;

      if (this.isSubCategory) {
        this.getSubCategory({ id: this.category_id }).then((data) => {
          (this.categories = data.map(this.mapPosition)), (this.loading = false);
        });
      } else {
        this.getCategories(this.params).then((data) => {
          (this.categories = data.map(this.mapPosition)), (this.loading = false);
        });
      }
    },

    mapPosition(item) {
      return {
        ...item,
        ...(item?.position || { position: 1 }),
        ...(item?.position_vn || { position_vn: 1 }),
      };
    },

    deleteHelpCategories(item) {
      this.$dialog
        .confirm('Please confirm to continue')
        .then(() =>
          this.isSubCategory ? this.deleteSubCategory({ id: item._id }) : this.deleteCategories({ id: item._id })
        )
        .then(() => this.init())
        .catch(console.log);
    },

    toggleActive(item) {
      const payload = { is_active: !item.is_active };

      this.$dialog
        .confirm('Please confirm to continue')
        .then(() =>
          this.isSubCategory
            ? this.putSubCategory({
                id: [this.category_id, item._id],
                payload,
              })
            : this.putCategories({
                id: item._id,
                payload,
              })
        )
        .then(() => this.init())
        .catch(console.log);
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/help-categories';
</style>
