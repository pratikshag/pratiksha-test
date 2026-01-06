<template>
  <div class="sc-form">
    <div v-show="isLoading">
      <p>Loading data...</p>
    </div>
    <div v-show="!isLoading" class="grouped-input">
      <div class="sc-form-title">Milestones</div>
      <div class="sc-form-group">
        <label class="sc-form-label">Cari Brand</label>
        <div class="sc-form-child-group" style="flex: 1">
          <multiselect
            v-model="currentMileStone.brand"
            :close-on-select="true"
            :internal-search="false"
            :loading="isLoadingBrand"
            :option-height="104"
            :options="brands"
            :searchable="true"
            :show-labels="false"
            label="name"
            name="brand"
            placeholder="Cari brand..."
            track-by="name"
            @search-change="onSearchBrand"
          >
            <span slot="noResult">Oops! Hasil pencarian ini tidak ditemukan. Coba cari dengan keywords lain.</span>
            <span v-if="isLoadingBrand" slot="afterList" class="nbtn vue-multiselect-load-more">Loading...</span>
            <span
              v-if="!isLoadingBrand && hasMoreBrand"
              slot="afterList"
              class="nbtn vue-multiselect-load-more"
              @click="doFindBrand(brands.length)"
              >load more brand</span
            >
          </multiselect>
        </div>
      </div>
      <div class="sc-form-group">
        <label class="sc-form-label">Cari Produk</label>
        <div class="sc-form-child-group" style="flex: 1">
          <multiselect
            v-model="currentMileStone.product"
            :close-on-select="true"
            :internal-search="false"
            :loading="isLoadingProduct"
            :option-height="104"
            :options="products"
            :searchable="true"
            :show-labels="false"
            label="name"
            name="product"
            placeholder="Cari produk..."
            track-by="name"
            @search-change="onSearchProduct"
          >
            <span slot="noResult">Oops! Hasil pencarian ini tidak ditemukan. Coba cari dengan keywords lain.</span>
            <span v-if="isLoadingProduct" slot="afterList" class="nbtn vue-multiselect-load-more">Loading...</span>
            <span
              v-if="!isLoadingProduct && hasMoreProduct"
              slot="afterList"
              class="nbtn vue-multiselect-load-more"
              @click="doFindProduct(products.length)"
              >load more product</span
            >
          </multiselect>
        </div>
      </div>
      <div class="sc-form-group">
        <label class="sc-form-label">Aksi</label>
        <div class="sc-form-child-group" style="flex: 1">
          <multiselect
            v-model="currentMileStone.action"
            :close-on-select="true"
            :internal-search="false"
            :option-height="104"
            :options="actions"
            :searchable="true"
            :show-labels="false"
            label="name"
            name="action"
            placeholder="Cari aksi..."
            track-by="name"
          />
        </div>
      </div>
      <div class="sc-form-group">
        <label class="sc-form-label">Goal</label>
        <input v-model="currentMileStone.goal" class="sc-form-input" type="text" />
      </div>
      <div class="sc-form-group">
        <label class="sc-form-label">Text</label>
        <input v-model="currentMileStone.text" class="sc-form-input" type="text" />
      </div>
      <div
        v-if="
          currentMileStone &&
          currentMileStone.action &&
          missionLinkActions.find((a) => a == currentMileStone.action.name)
        "
        class="sc-form-group"
      >
        <label class="sc-form-label">Link Continue Mission</label>
        <input v-model="currentMileStone.link_continue_mission" class="sc-form-input" type="text" />
      </div>
      <div class="sc-form-group">
        <div>
          <button class="sc-btn sc-btn-rounded sc-btn-white sc-btn-md sc-uppercase" @click.prevent="onUpdateMilestone">
            {{ currentMileStone.idx === null ? 'Add' : 'Update' }}
          </button>
        </div>
      </div>
      <div v-if="tables.length" class="sc-form-group">
        <div class="sc-table-responsive">
          <table class="sc-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Action</th>
                <th>Goal</th>
                <th>Text</th>
                <th>Link Continue Mission</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(table, idx) in tables" :key="idx">
                <td v-for="(td, idxChild) in table" :key="`${idx}-${idxChild}`">
                  <template v-if="idxChild < table.length - 1">
                    {{ td }}
                  </template>
                  <template v-else>
                    <button class="btn-white nbtn" @click.prevent="onEditMilestone(idx)">Edit</button>
                    <button class="btn-white nbtn" @click.prevent="onDeleteMileStone(idx)">Delete</button>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Multiselect from 'vue-multiselect';
import axios from 'axios';
import { debounce } from '../../../shared/util';

const Config = require('../../../../config/default.env').default;
const generateMilestone = () => {
  return {
    action: null,
    action_id: '',
    product: null,
    product_id: '',
    brand: null,
    brand_id: '',
    goal: 0,
    text: '',
    link_continue_mission: '',
    idx: null,
    getData() {
      const { goal, text, link_continue_mission, action, product, brand } = this;

      return {
        goal: Number(goal) || 0,
        text,
        link_continue_mission,
        action_id: action && action._id,
        product_id: product && product.id,
        brand_id: brand && brand._id,
      };
    },
    setData(param) {
      ['action', 'product', 'brand', 'goal', 'text', 'link_continue_mission'].forEach((key) => {
        if (param[key]) {
          this[key] = param[key];
        }
      });
    },
    validUpate() {
      const { action, goal, text } = this;

      return Boolean(action && goal && text);
    },
  };
};

export default {
  name: 'form-freebies-milestones',
  components: {
    Multiselect,
  },
  props: {
    milestonesProps: {
      default: () => [],
    },
  },
  computed: {
    ...mapState('freebies', ['actions', '$in']),

    getMileStones() {
      return (this.mileStones || []).reduce((accu, item) => accu.concat(item.getData()), []);
    },
    tables() {
      // product, brand, action, goal, text
      return this.mileStones.reduce((accu, milestone) => {
        const { product, brand, action, goal, text, link_continue_mission } = milestone;

        accu.push([
          (product && product.name) || '',
          (brand && brand.name) || '',
          (action && action.name) || '',
          goal,
          text,
          link_continue_mission,
          '',
        ]);

        return accu;
      }, []);
    },
  },
  data() {
    return {
      // milestone
      mileStones: [],
      currentMileStone: generateMilestone(),
      // product
      isLoadingProduct: false,
      products: [],
      hasMoreProduct: false,
      productName: '',
      // brand
      isLoadingBrand: false,
      missionLinkActions: [
        'comment-article',
        'comment-collection',
        'comment-add-review',
        'comment-photo-tagging',
        'comment-freebies',
        'comment-pid_quiz',
        'comment-vote',
        'upvote-vote',
        'comment-video',
      ],
      brands: [],
      hasMoreBrand: false,
      brandName: '',
      // actions
      // actions: [],
      // url
      endpointBrand: Config.MS_SOCO_ADMIN_API_URL + '/brands',
      endpointProduct: Config.MS_SOCO_ADMIN_API_URL + '/products',
      isLoading: true,
    };
  },
  mounted() {
    this.doFindAction().finally(() => {
      if (this.milestonesProps.length) {
        this.doFindMileStoneProps().finally(() => (this.isLoading = false));
      } else {
        this.isLoading = false;
      }
    });
  },
  methods: {
    onEditMilestone(idx) {
      this.currentMileStone.setData(this.mileStones[idx]);
      this.currentMileStone.idx = idx;
    },
    onDeleteMileStone(idx) {
      this.mileStones.splice(idx, 1);
    },
    onUpdateMilestone() {
      if (!this.currentMileStone.validUpate()) {
        this.$toasted.global.show('Check again some field');

        return;
      }

      if (this.currentMileStone.idx === null) {
        this.mileStones.push(this.currentMileStone);
      } else {
        this.mileStones.splice(this.currentMileStone.idx, 1, this.currentMileStone);
      }

      this.currentMileStone = generateMilestone();
    },
    onSearchBrand(keyword) {
      this.brandName = keyword;

      return debounce(() => {
        if (keyword.length < 3) {
          return;
        }

        this.doFindBrand();
      }, 500)();
    },
    async doFindMileStoneProps() {
      const product_ids = this.milestonesProps.reduce((accu, item) => accu.concat(item['product_id']), []);
      const brand_ids = this.milestonesProps.reduce((accu, item) => accu.concat(item['brand_id']), []);
      let products = [];
      let brands = [];

      if (product_ids.length) {
        try {
          const responseProduct = await axios.get(this.endpointProduct, {
            params: { filter: { id: { $in: product_ids } } },
          });
          products = responseProduct.data && responseProduct.data.data;

          if (!Array.isArray(products)) {
            products = [];
          }
        } catch (e) {
          console.log(e);
        }
      }

      if (brand_ids.length) {
        try {
          const responseBrands = await axios.get(this.endpointBrand, {
            params: { filter: { _id: { $in: brand_ids } } },
          });
          brands = responseBrands.data && responseBrands.data.data;

          if (!Array.isArray(brands)) {
            brands = [];
          }
        } catch (e) {
          console.log(e);
        }
      }

      this.mileStones = this.milestonesProps.reduce((accu, item) => {
        const { action_id, brand_id, product_id } = item;
        const mileStone = generateMilestone();

        mileStone.setData({
          ...item,
          action: action_id && this.actions.find((action) => action._id === action_id),
          brand: brand_id && brands.find((brand) => brand._id === brand_id),
          product: product_id && products.find((product) => product.id === product_id),
        });

        accu.push(mileStone);

        return accu;
      }, []);
    },
    async doFindAction() {
      try {
        const url = Config.MS_SOCO_ADMIN_API_URL + '/actions';
        const params = {
          filter: { name: { $in: this.$in } },
          limit: this.$in.length,
        };
        const response = await axios.get(url, { params });
        const actions = response.data && response.data.data;

        // if (!Array.isArray(actions)) actions = [];

        // this.actions = actions;
        this.$store.commit('freebies/setState', ['actions', actions]);
      } catch (e) {
        console.log();
      }
    },
    async doFindBrand(skip = 0) {
      if (!this.isLoadingBrand) {
        if (skip === 0) {
          this.brands = [];
        }

        this.isLoadingBrand = true;
        const params = {
          filter: {
            name: {
              $regex: `^${(this.brandName || '').toLowerCase()}`,
              $options: 'i',
            },
          },
          skip,
          limit: 10,
          fields: 'name,_id',
        };

        try {
          const response = await axios.get(this.endpointBrand, { params });
          let brands = response.data && response.data.data;
          if (!Array.isArray(brands)) {
            brands = [];
          }

          this.brands = this.brands.concat(brands);
          this.hasMoreBrand = brands.length % 10 === 0 && brands.length > 0;
        } catch (e) {
          console.log(e);
        }

        this.isLoadingBrand = false;
      }
    },
    onSearchProduct(keyword) {
      this.productName = keyword;

      return debounce(() => {
        if (keyword.length < 3) {
          return;
        }

        this.doFindProduct();
      }, 500)();
    },
    async doFindProduct(skip = 0) {
      if (!this.isLoadingProduct) {
        if (skip === 0) {
          this.products = [];
        }

        this.isLoadingProduct = true;
        const params = {
          filter: { keyword: this.productName },
          skip,
          limit: 10,
        };

        try {
          const response = await axios.get(this.endpointProduct, { params });
          let products = response.data && response.data.data;
          if (!Array.isArray(products)) {
            products = [];
          }

          this.products = this.products.concat(products);
          this.hasMoreProduct = products.length % 10 === 0 && products.length > 0;
        } catch (e) {
          console.log(e);
        }

        this.isLoadingProduct = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.form-freebies-milestones /deep/ {
  .table-post {
    td:last-child {
      display: flex !important;

      button + button {
        margin-left: 8px;
      }
    }
  }
}
</style>
