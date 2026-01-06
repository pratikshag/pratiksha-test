<template>
  <div>
    <div class="sc-table-title">Featured Categories</div>
    <div class="sc-mb-15">
      <label class="sc-form-label">Data Featured Popular Product Category Are Not Valid: </label>
      <button
        type="button"
        class="sc-btn sc-btn-rounded sc-btn-md sc-btn-secondary"
        @click="doGeneratePopularProductCategory"
      >
        <i class="fa fa-cog"></i> Regenerate
      </button>
    </div>
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Slug</th>
            <th>Link rewrite</th>
            <th>Time generate popular product</th>
          </tr>
        </thead>
        <tbody>
          <div v-if="loading" class="loader" style="text-align: center">
            <ball-pulse-loader color="#000000" size="20px"></ball-pulse-loader>
          </div>

          <TableEmpty v-if="!loading && !(items && items.length)" :cols="5" />

          <tr v-for="(item, index) in items" v-else :key="index">
            <td v-text="item.my_soco_sql_id"></td>
            <td v-text="item.name"></td>
            <td v-text="item.slug"></td>
            <td v-text="item.link_rewrite"></td>
            <td v-text="dateFormat(item.last_generate_popular_product_category_at)"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'category-featured-list',

  data() {
    return {
      items: [],

      loading: false,

      params: {
        filter: {
          is_popular: true,
        },
        fields: 'my_soco_sql_id name slug link_rewrite last_generate_popular_product_category_at',
        limit: 4,
      },
    };
  },

  created() {
    this.loadCategories();
  },

  methods: {
    ...mapActions('categories/featured', ['getCategories', 'generatePopularProductCategory']),

    dateFormat: (payload) => moment(payload).tz('Asia/Jakarta').format('MM-DD-YYYY hh:mm'),

    doGeneratePopularProductCategory: function () {
      this.loading = true;
      this.generatePopularProductCategory().then(() => this.loadCategories());
    },

    loadCategories: function () {
      this.loading = true;
      this.getCategories(this.params).then((data) => {
        this.items = data;
        this.loading = false;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '~@/sass/partial/help-reset';
.table100.ver1 {
  overflow: visible;
}
</style>
