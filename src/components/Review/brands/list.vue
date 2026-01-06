<template src="./list.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';
import Modal from '@/vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
import Multiselect from 'vue-multiselect';
import DisplayPerPage from '@/components/tables/display_per_page';
import Pagination from '@/components/tables/pagination';

let cancelSearchResource;

export default {
  name: 'brand-list',
  components: { sortField, Modal, Multiselect, DisplayPerPage, Pagination },

  data() {
    return {
      brandPreview: null,
      data: [],
      is_loading: true,

      filter: {
        my_soco_sql_id: 0,
        name: '',
        type: '',
        location: '',
      },
      sortField: '-created_at',

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
      },
      all: 0,
      currentContent: '',

      criteria: {},
      criteriaStatus: {
        all: {},
        active: {
          is_active_in_review: true,
        },
        inactive: {
          is_active_in_review: false,
        },
      },
      is_loading_relocate: false,
      relocateBrand: {
        source: {},
        target: {},
      },
      options: {
        brands: {
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
  },

  watch: {
    queryString: function (oldVal, newVal) {
      this.extractFilters();
      console.log('queryString', newVal);
    },
  },

  created() {
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
    closeBrandPreview() {
      this.brandPreview = null;
    },
    showBrandPreview(id) {
      this.$refs.brand_preview.open();

      // console.log(id)
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/brands`, {
        params: {
          filter: {
            _id: id,
          },
        },
      })
        .then((res) => {
          if (res.data.success) {
            this.brandPreview = res.data.data[0];
          } else {
            throw { res };
          }
          // console.log(res.data)
        })
        .catch((err) => {
          console.error(err);
        });
    },
    extractFilters() {
      const params = this.queryString;
      console.log(`route params: `, params);

      this.criteria = {};

      this.filter.my_soco_sql_id = params.my_soco_sql_id;
      this.filter.name = params.name;
      this.filter.brand = params.brand;
      this.filter.category = params.category;
      this.filter.status = params.status;
      this.sortField = '-created_at';
      this.filter.location = params.location ? params.location : this.filter.location || '';

      if (params.my_soco_sql_id) {
        this.criteria.my_soco_sql_id = params.my_soco_sql_id;
      }
      if (params.name) {
        this.criteria.name = { $regex: '^' + params.name, $options: 'i' };
      }
      if (params.page) {
        this.pagination.currentPage = params.page;
      }
      if (params.sort) {
        this.sortField = params.sort;
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
      if (params.is_active_in_sociolla) {
        this.criteria = {
          ...this.criteria,
          is_active_in_sociolla: true,
        };
      } else if (params.is_active_in_sociolla_vn) {
        this.criteria = {
          ...this.criteria,
          is_active_in_sociolla_vn: true,
        };
      }

      this.calculatePage();

      // console.log('extractFilters', this.criteria)
      this.fetchData(this.criteria);
      this.getCount(this.criteria, 'table');
    },

    getCount: function (criteria, section) {
      if (!criteria) {
        criteria = this.criteria;
      }

      let url = Config.default.MS_SOCO_ADMIN_API_URL + '/brands/count';
      if (this.filter.type == 'duplicate') {
        url = Config.default.MS_SOCO_ADMIN_API_URL + '/brands/duplicate/count';
      }

      this.is_loading = true;
      return Axios.get(url, {
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

      let url = Config.default.MS_SOCO_ADMIN_API_URL + '/brands';
      if (this.filter.type == 'duplicate') {
        url = Config.default.MS_SOCO_ADMIN_API_URL + '/brands/duplicate';
      }

      Axios.get(url, {
        params: {
          filter: criteria,
          skip: this.pagination.skip,
          limit: this.pagination.limit,
          sort: this.sortField,
          fields:
            'my_sociolla_sql_id my_soco_sql_id name logo status total_products is_active_in_review is_active_in_sociolla is_active_in_sociolla_vn short_description description',
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status == 200) {
            this.data = response.data.data;
            if (this.filter.type == 'duplicate') {
              const currentPage = Math.ceil((this.pagination.skip + this.pagination.limit) / this.pagination.limit);
              console.log('currentPage', currentPage);
              console.log('this.pagination.totalPage', this.pagination.totalPage);
              if (currentPage < this.pagination.totalPage) {
                this.pagination.showNextPage = true;
              } else {
                this.pagination.showNextPage = false;
              }
            } else {
              if (response.data.data.length < this.pagination.limit) {
                this.pagination.showNextPage = false;
              } else {
                this.pagination.showNextPage = true;
              }
            }
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    filterAction(pagination = false) {
      const query = this.queryString || {};
      if (this.filter.my_soco_sql_id) {
        query.my_soco_sql_id = this.filter.my_soco_sql_id;
      } else {
        delete query.my_soco_sql_id;
      }

      if (this.filter.name) {
        query.name = this.filter.name;
      } else {
        delete query.name;
      }

      if (this.filter.status) {
        query.status = this.filter.status;
      } else {
        delete query.status;
      }
      if (this.filter.location === 'ID') {
        query.is_active_in_sociolla = true;
      }
      if (this.filter.location === 'VN') {
        query.is_active_in_sociolla_vn = true;
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

      console.log('filterData', query);
      this.$router.push({ query });

      // force call extractFilters, because queryString in browser url can not update
      this.extractFilters();
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
      self.getCount(null, 'countAll').then((count) => {
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
    },

    filterStatus(status) {
      this.filter.status = status;
      this.filterAction();
      this.currentContent = status;
    },

    toggleStatus(brand) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + `/brands/${brand._id}`, {
            is_active_in_review: !brand.is_active_in_review,
            status: brand.is_active_in_review ? 'publish' : 'pending',
          }).then((response) => {
            brand.is_active_in_review = !brand.is_active_in_review;
            self.$toasted.global.show('Sucessfully toggle brand');
            self.fetchData(self.criteria);
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },
    deleteBrand(brand) {
      const self = this;
      if (brand.total_products) {
        self.$toasted.global.show('Sorry, Brand tidak bisa kamu hapus karena ada produk didalamnya');
        return;
      }

      self.$dialog
        .confirm(`Are you sure, want to delete "${brand.name}"?`)
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/brands/${brand._id}`).then((response) => {
            self.$toasted.global.show('Sucessfully delete Brand');

            self.fetchData(self.criteria);
            self.getCount(self.criteria, 'table');
            self.getAllWidgetCount();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    toggleModalRelocate(brand) {
      this.relocateBrand.target = {};

      if (brand) {
        this.relocateBrand.source = {
          _id: brand._id,
          name: brand.name,
          my_soco_sql_id: brand.my_soco_sql_id,
          total_products: brand.total_products,
        };

        this.findBrands(brand.name);
      } else {
        this.relocateBrand.source = {};
      }

      this.options.brands.disabled = false;
      this.is_loading_relocate = false;

      this.$refs.brand_relocate.open();
    },

    findBrands(query) {
      if (query) {
        this.options.brands.is_loading = true;

        if (typeof cancelSearchResource === 'object') {
          cancelSearchResource.cancel();
        }
        const CancelToken = Axios.CancelToken;
        cancelSearchResource = CancelToken.source();

        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/brands`, {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              is_deleted: { $ne: true },
              _id: {
                $ne: this.relocateBrand.source && this.relocateBrand.source._id,
              },
              name: {
                $regex: '^' + query,
                $options: 'i',
              },
            },
            fields: '_id name total_products my_soco_sql_id',
            skip: 0,
            limit: 10,
          },
        })
          .then((response) => {
            this.options.brands.is_loading = false;
            if (response.status === 200 && response.data.data) {
              this.options.brands.data = response.data.data;
            }
          })
          .catch((error) => {
            if (Axios.isCancel(error)) {
              return 'cancel';
            }
            this.options.brands.is_loading = false;
            console.log('Error: ' + error);
          });
      }
    },

    sourcename(brand) {
      if (brand._id) {
        return `${brand.name} - ${brand.my_soco_sql_id} [${brand.total_products || 0} products]`;
      }
      return '';
    },

    processRelocateBrand() {
      const self = this;

      if (self.relocateBrand.target && self.relocateBrand.target._id) {
        self.$dialog
          .confirm('Please confirm to continue')
          .then(function (dialog) {
            self.options.brands.disabled = true;
            self.is_loading_relocate = true;

            Axios.put(
              Config.default.MS_SOCO_ADMIN_API_URL +
                `/brands/${self.relocateBrand.source._id}/relocate/${self.relocateBrand.target._id}`
            )
              .then((response) => {
                self.is_loading_relocate = false;
                self.$refs.brand_relocate.close();
                self.$toasted.global.show('Sucessfully relocate brand');
                self.fetchData(self.criteria);
              })
              .catch((err) => {
                self.options.brands.disabled = false;
                self.is_loading_relocate = false;
                alert(err.response.data.message);
              });
          })
          .catch(function () {
            self.options.brands.data = [];
            self.options.brands.disabled = false;
            self.is_loading_relocate = false;
            console.log('Clicked on cancel');
            self.toggleModalRelocate(self.relocateBrand.source);
          });
      }
    },
  },
};
</script>
