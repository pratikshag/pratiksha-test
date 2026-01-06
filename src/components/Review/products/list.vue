<template src="./list.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import { Carousel, Slide } from 'vue-carousel';
import Multiselect from 'vue-multiselect';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

let cancelSearchResource;

export default {
  name: 'product-list',
  components: {
    sortField,
    Carousel,
    Slide,
    Multiselect,
    DisplayPerPage,
    Pagination,
  },

  data() {
    return {
      checkedIds: [],
      currentContent: 'all',
      data: [],
      is_loading: true,
      is_loading_relocate: false,
      manageCollection: false,
      producttab: 1,
      shownImage: null,

      filter: {
        id: 0,
        name: '',
        brand: '',
        category: '',
        status: 'all',
        author: '',
        date: {
          from: '',
          to: '',
        },
        type: '',
        active_in: '',
      },
      sortField: '-created_at',
      all: 0,

      pagination: {
        skip: 0,
        limit: 10,
        totalPage: 0,
        showNextPage: true,
        currentPage: 1,
        currentTotalRecord: 0,
      },

      totalCount: {
        all: 0,
        active: 0,
        inactive: 0,
        waiting_approval: 0,
      },

      criteria: {
        is_deleted: false,
      },
      criteriaStatus: {
        all: {},
        active: {
          is_active_in_review: true,
          status: 'approved',
          is_deleted: false,
        },
        inactive: {
          is_active_in_review: false,
          is_deleted: false,
        },
        waiting_approval: {
          is_active_in_review: false,
          status: 'waiting-approval',
          is_deleted: false,
        },
      },
      postPreview: {},
      showModalRelocate: false,
      relocateProduct: {
        source: {},
        target: {},
      },
      options: {
        products: {
          data: [],
          is_loading: false,
          disabled: false,
        },
      },
    };
  },

  computed: {
    queryString() {
      return this.$route.query;
    },
    averageRating() {
      // return 2.5
      if (this.postPreview.review_stats && this.postPreview.review_stats.average_rating) {
        return this.postPreview.review_stats.average_rating;
      } else {
        return 0;
      }
    },
  },

  watch: {
    queryString: function (oldVal, newVal) {
      this.extractFilters();
      // console.log('queryString', newVal);
    },
  },

  created: function () {
    this.extractFilters();
    this.getAllWidgetCount();
  },

  methods: {
    setSkip(data) {
      this.skip = Number(data || 0);
      this.currentPage = Math.floor(this.pagination.skip / this.pagination.limit) + 1;
      this.loadInitialData(this.pagination.skip);
    },
    display(newLimit) {
      this.is_loading = true;
      this.pagination.limit = newLimit || 10;
      this.$nextTick(() => {
        this.loadInitialData().then(() => {
          this.is_loading = false;
        });
      });
    },
    formatCombinations(row) {
      const relocationlog = row.relocation_log || {};
      let combis = [];
      relocationlog.source_combination?.attributes &&
        (Object.keys(relocationlog.source_combination.attributes) || []).forEach((attrib) => {
          if (combis.indexOf(attrib) < 0) {
            combis.push(attrib);
          }
        });
      combis = combis.length ? combis.join(', ') : '-';
      return {
        sourceName: relocationlog.source?.name || '-',
        combinations: combis,
        targetName: relocationlog.target?.name || '-',
        count: relocationlog.relocated_review_count || '-',
      };
    },
    bulkUpdate(isActive) {
      Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/products/bulk', {
        products: this.checkedIds,
        is_active_in_review: isActive,
      }).then((response) => {
        this.checkedIds = [];
        this.fetchData(this.criteria);
      });
    },
    selectAll() {
      if (this.checkedIds.length >= 5) {
        this.checkedIds = [];
      } else {
        this.checkedIds = this.data.map((data) => data._id);
      }
    },
    sourcename(product) {
      if (product.id) {
        return `${product.id} (${product.name})`;
      }
      return '';
    },

    extractFilters() {
      const params = this.queryString;
      //        console.log(`route params: `, params);

      this.criteria = {
        is_deleted: { $ne: true },
      };
      this.filter.id = params.id;
      this.filter.name = params.name;
      // this.filter.brand = params.brand
      this.filter.category = params.category;
      this.filter.status = params.status;
      this.filter.author = params.author;
      this.filter.active_in = params.active_in || '';
      this.sortField = '-created_at';

      if (params.brand) {
        if (typeof params.brand === 'object' && params.brand.$exists === false) {
          this.criteria['brand.name'] = { $exists: false };
        } else {
          this.criteria['brand.name'] = {
            $regex: '^' + params.brand,
            $options: 'i',
          };
        }
      }

      if (params.id) {
        this.criteria.id = params.id;
      }
      if (params.name) {
        this.criteria.name = { $regex: '^' + params.name, $options: 'i' };
      }
      // if(params.brand) this.criteria['brand.name'] = { "$regex": '^'+params.brand, "$options": "i"}
      //    if(params.type == nobrand) this.criteria['brand.name'] = { $exists : false }
      if (params.category) {
        this.criteria['categories.name'] = {
          $regex: '^' + params.category,
          $options: 'i',
        };
      }
      if (params.author) {
        this.criteria['user_contribution.user_name'] = {
          $regex: '^' + params.author,
          $options: 'i',
        };
      }
      if (params.active_in) {
        this.criteria[params.active_in] = true;
      }
      if (params.page) {
        this.pagination.currentPage = params.page;
      }
      if (params.sort) {
        this.sortField = params.sort;
      }
      if (params.type == 'userContribution') {
        this.criteria['user_contribution.is_user_contribution'] = {
          $eq: true,
        };
      }
      const criteria_date = {};
      if (params.from) {
        criteria_date['$gte'] = `${params.from} 00:00:00`;
        this.filter.date.from = params.from;
      } else {
        this.filter.date.from = null;
      }
      if (params.to) {
        criteria_date['$lte'] = `${params.to} 23:59:59`;
        this.filter.date.to = params.to;
      } else {
        this.filter.date.to = null;
      }
      if (Object.keys(criteria_date).length > 0) {
        this.criteria.created_at = criteria_date;
      }

      if (params.status && this.criteriaStatus[params.status]) {
        this.criteria = {
          ...this.criteria,
          ...this.criteriaStatus[params.status],
        };
      } else {
        this.criteria = {
          ...this.criteria,
          ...this.criteriaStatus.all,
        };
      }

      this.calculatePage();
      this.fetchData(this.criteria);
      this.getCount(this.criteria, 'table');
    },

    getCount: function (criteria, section) {
      if (criteria == null) {
        criteria = this.criteria;
      }

      this.is_loading = true;

      let api_url = `${Config.default.MS_SOCO_ADMIN_API_URL}/products/count`;

      if (this.filter.type == 'duplicate') {
        api_url = `${Config.default.MS_SOCO_ADMIN_API_URL}/products/duplicate/count`;
      }

      return Axios.get(api_url, {
        params: {
          section: section,
          filter: criteria,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            let count = parseInt(response.data.data);
            if (isNaN(count)) {
              count = 0;
            }

            if (section == 'table') {
              this.pagination.currentTotalRecord = count;
              this.pagination.totalPage = Math.ceil(count / this.pagination.limit);
              return count;
            } else {
              return count;
            }
          } else {
            return 0;
          }
        })
        .catch((err) => {
          this.$Progress.finish();
          throw err;
        });
    },

    fetchData: function (criteria) {
      if (!criteria) {
        criteria = this.criteria;
      }
      this.is_loading = true;
      this.data = [];

      if (this.filter.type == 'duplicate') {
        return this.getProductDuplicate(this.criteria);
      }

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/products', {
        params: {
          filter: criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortField,
          fields:
            '_id my_sociolla_sql_id id name images brand status categories review_stats is_active is_deleted name content ingredients how_to_use created_at user_contribution is_active_in_review',
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;
            this.data.map((row) => {
              if (row.hasOwnProperty('user_contribution')) {
                row.user_contribution.url = `${Config.default.SOCO_ADMIN_URL}/users/detail/${row.user_contribution.user_id}`;
              }
            });
            if (response.data.data.length < this.pagination.limit) {
              this.pagination.showNextPage = false;
            } else {
              this.pagination.showNextPage = true;
            }
          }
        })
        .catch((err) => {
          // console.log(err);
          throw err;
        });
    },

    filterAction(pagination = false) {
      const query = this.queryString || {};
      if (this.filter.id) {
        query.id = this.filter.id;
      } else {
        delete query.id;
      }

      if (this.filter.name) {
        query.name = this.filter.name;
      } else {
        delete query.name;
      }

      if (this.filter.active_in) {
        query.active_in = this.filter.active_in;
      } else {
        delete query.active_in;
      }

      if (this.filter.brand) {
        query.brand = this.filter.brand;
      } else {
        delete query.brand;
      }

      if (this.filter.category) {
        query.category = this.filter.category;
      } else {
        delete query.category;
      }

      if (this.filter.date.from) {
        query.from = this.filter.date.from;
      } else {
        delete query.from;
      }

      if (this.filter.date.to) {
        query.to = this.filter.date.to;
      } else {
        delete query.to;
      }

      if (this.filter.status) {
        query.status = this.filter.status;
      } else {
        delete query.status;
      }

      if (this.filter.author) {
        query.author = this.filter.author;
      } else {
        delete query.author;
      }

      if (pagination) {
        if (this.pagination.currentPage) {
          query.page = this.pagination.currentPage;
        } else {
          delete query.page;
        }
      } else {
        query.page = 1;
      }

      if (this.sortField) {
        query.sort = this.sortField;
      } else {
        delete query.sort;
      }
      this.$router.push({ query });

      if (this.filter.type == 'nobrand') {
        query.brand = { $exists: false };
      }

      if (this.filter.type == 'duplicate') {
        this.filter.is_deleted = { $ne: true };
      }

      if (this.filter.type == 'userContribution') {
        query.type = 'userContribution';
      } else {
        delete query.type;
      }

      // else {
      // force call extractFilters, because queryString in browser url can not update
      this.extractFilters();
      // }
    },

    gotoPage: function (page) {
      this.pagination.currentPage = page;
      this.filterAction(true);
    },

    calculatePage() {
      let page = this.pagination.currentPage;
      if (page > this.pagination.totalPage || page < 0) {
        return;
      }
      page = parseInt(page);
      if (isNaN(page)) {
        page = 1;
      }
      this.pagination.skip = this.pagination.limit * (page - 1);
      this.pagination.currentPage = page;
    },

    sort(sort) {
      this.sortField = sort;
      this.filterAction();
    },

    getAllWidgetCount() {
      const self = this;

      // countAll
      self.getCount(self.criteriaStatus.all, 'countAll').then((count) => {
        self.totalCount.all = count;
      });

      // countActive
      self.getCount(self.criteriaStatus.active, 'countActive').then((count) => {
        self.totalCount.active = count;
      });

      // countInactive
      self.getCount(self.criteriaStatus.inactive, 'countInactive').then((count) => {
        self.totalCount.inactive = count;
      });

      // countWaitingApproval
      self.getCount(self.criteriaStatus.waiting_approval, 'countWaitingApproval').then((count) => {
        self.totalCount.waiting_approval = count;
      });
    },

    filterStatus(status) {
      this.filter.status = status;
      this.filterAction();
      this.currentContent = status;
    },

    toggleStatus(product) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/products/${product._id}`, {
            is_active_in_review: !product.is_active_in_review,
          }).then((response) => {
            product.is_active_in_review = !product.is_active_in_review;
            self.$toasted.global.show('Sucessfully toggle product');

            self.fetchData(self.criteria);
            self.getCount(self.criteria, 'table');
            self.getAllWidgetCount();
          });
        })
        .catch(function () {
          // console.log('Clicked on cancel');
        });
    },
    deleteProduct(product) {
      const self = this;
      if (product.review_stats.total_reviews) {
        self.$toasted.global.show('Kamu harus relocate user review terlebih dahulu');
        return;
      }

      self.$dialog
        .confirm(`Are you sure, want to delete "${product.name}"?`)
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/products/${product.id}`).then((response) => {
            self.$toasted.global.show('Sucessfully delete product');

            self.fetchData(self.criteria);
            self.getCount(self.criteria, 'table');
            self.getAllWidgetCount();
          });
        })
        .catch(function () {
          // console.log('Clicked on cancel');
        });
    },
    showModalAddCollection(product) {
      if (product) {
        this.postPreview = product;
        if (product.images && product.images[0]) {
          this.shownImage = product.images[0].url;
        } else {
          this.shownImage = null;
        }
      }
      if (this.manageCollection == false) {
        this.manageCollection = true;
      } else {
        this.manageCollection = false;
      }
    },
    toggleModalRelocate(product) {
      this.relocateProduct.target = {};

      if (product) {
        this.relocateProduct.source = {
          id: product.id,
          _id: product._id,
          name: product.name,
        };
      } else {
        this.relocateProduct.source = {};
      }

      this.options.products.disabled = false;
      this.is_loading_relocate = false;

      this.showModalRelocate = !this.showModalRelocate;
    },
    goToReviewList(id) {
      this.$router.push(`/review/product/list/${id}`);
    },
    findProducts(query) {
      if (query) {
        this.options.products.is_loading = true;

        if (typeof cancelSearchResource === 'object') {
          cancelSearchResource.cancel();
        }
        const CancelToken = Axios.CancelToken;
        cancelSearchResource = CancelToken.source();

        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/products`, {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              is_deleted: false,
              _id: { $ne: this.relocateProduct.source._id },
              name: {
                $regex: '^' + query,
                $options: 'i',
              },
            },
            fields: '_id id name',
            skip: 0,
            limit: 10,
          },
        })
          .then((response) => {
            this.options.products.is_loading = false;
            if (response.status === 200 && response.data.data) {
              this.options.products.data = response.data.data;
            }
          })
          .catch((error) => {
            if (Axios.isCancel(error)) {
              return 'cancel';
            }
            this.options.products.is_loading = false;
            // console.log('Error: ' + error);
          });
      }
    },

    processRelocateProduct() {
      const self = this;

      self.showModalRelocate = false;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.options.products.disabled = true;
          self.is_loading_relocate = true;
          self.showModalRelocate = true;

          Axios.put(
            Config.default.MS_SOCO_ADMIN_API_URL +
              `/products/${self.relocateProduct.source._id}/relocate/${self.relocateProduct.target._id}`
          )
            .then((response) => {
              self.is_loading_relocate = false;
              self.toggleModalRelocate();
              self.$toasted.global.show('Sucessfully relocate product');
              self.fetchData(self.criteria);
            })
            .catch((err) => {
              self.options.products.disabled = false;
              self.is_loading_relocate = false;
              alert(err.response.data.message);
            });
        })
        .catch(function () {
          self.options.products.disabled = false;
          self.is_loading_relocate = false;
          self.toggleModalRelocate(self.relocateProduct.source);
        });
    },
    recalculateReviewStats(productId) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          self.is_loading_relocate = true;
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/products/${productId}/review_stats`)
            .then((response) => {
              self.is_loading_relocate = false;
              self.$toasted.global.show('Sucessfully recalculate review stat product');
              self.fetchData(self.criteria);
            })
            .catch((err) => {
              self.is_loading_relocate = false;
              alert(err.response.data.message);
            });
        })
        .catch(function () {
          self.is_loading_relocate = false;
          // console.log('Clicked on cancel');
        });
    },
    getProductDuplicate(filter) {
      this.is_loading = true;
      this.data = [];

      Axios.get(`${Config.default.MS_SOCO_ADMIN_API_URL}/products/duplicate`, {
        params: {
          filter: filter,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
        },
      }).then((response) => {
        this.is_loading = false;
        if (response.status == 200) {
          this.data = response.data.data;

          if (response.data.data.length < this.pagination.limit) {
            this.pagination.showNextPage = false;
          } else {
            this.pagination.showNextPage = true;
          }
        }
      });
    },
    reset() {
      this.filter.id = 0;
      this.filter.name = '';
      this.filter.brand = '';
      this.filter.active_in = '';
      this.filter.category = '';
      this.filter.status = 'all';
      this.filter.date.from = '';
      this.filter.date.to = '';
      this.filter.type = '';
      this.filter.author = '';
      this.filterAction();
    },
    productCategories(categories) {
      if (categories.length) {
        // egories" v-if = "!cat.is_promotion"><u>{{ (
        const onlyProductCategory = categories
          .filter((cat) => 'is_promotion' in cat && !cat.is_promotion)
          .map((cat) => cat.name);
        return onlyProductCategory ? onlyProductCategory.join(', ') : '';
      }
    },
    loadInitialData() {
      this.extractFilters();
    },
  },
};
</script>
<style scoped>
input[type='checkbox']:checked {
  background: darkcyan;
}
input[type='checkbox']:after {
  background-color: transparent;
}
input[type='number'] {
  -moz-appearance: textfield;
}
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.btn-action {
  padding: 4px;
}
</style>
