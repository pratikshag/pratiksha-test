<template>
  <div>
    <div class="sc-form-group">
      <label class="sc-form-label">Mobile Apps Link</label>
      <div class="sc-form-child-group">
        <select v-model="mobile_apps_link" class="sc-form-input">
          <option value="">-- Select Mobile Apps Link --</option>
          <option v-for="(item, i) in mobile_apps_link_options" :key="i" :value="item.value">
            {{ item.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="mobile_apps_link == 'landing_page'" class="sc-form-group">
      <label class="sc-form-label">Landing Page</label>
      <div class="sc-form-child-group">
        <input v-model="value" class="sc-form-input" type="text" placeholder="Tuliskan disini" />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'great_mission_landing_page'" class="sc-form-group">
      <label class="sc-form-label">Great Mission</label>
      <div class="sc-form-child-group">
        <select v-model="value" class="sc-form-input">
          <option value="">-- Select Great Mission --</option>
          <option v-for="(item, i) in great_mission_options" :key="i" :value="item.value">
            {{ item.name }}
          </option>
        </select>
        <!-- <multiselect
                    v-model="value"
                    :options="great_mission_options"
                    :searchable="true" :multiple="false"
                    placeholder="" open-direction="bottom"
                    :clear-on-select="true" :close-on-select="true"
                    :show-no-results="true" :hide-selected="true"
                    label="name"
                    class="sc-form-input" style="width:95%">
                </multiselect> -->
      </div>
    </div>

    <div v-if="mobile_apps_link == 'partner_page'" class="sc-form-group">
      <label class="sc-form-label">Partner Page</label>
      <div class="sc-form-child-group">
        <input v-model="value" class="sc-form-input" placeholder="sociolla.com/partners" type="text" readonly />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'partner_detail'" class="sc-form-group">
      <label class="sc-form-label">Partner Promo ID</label>
      <div class="sc-form-child-group">
        <input v-model="value" class="sc-form-input" type="text" placeholder="Tuliskan disini" />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'mask_subscription_landing_page'" class="sc-form-group">
      <label class="sc-form-label">Mask Subscription</label>
      <div class="sc-form-child-group">
        <input v-model="value" class="sc-form-input" type="text" placeholder="Tuliskan disini" />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'product_by_manufacturer'" class="sc-form-group">
      <label class="sc-form-label">Brand</label>
      <div class="sc-form-child-group">
        <SocoMultiselect type="brand" :data="(value_temp.brand && value_temp.brand.name) || ''" @callback="setValue" />
      </div>
    </div>

    <div v-if="['show_product', 'egift'].includes(mobile_apps_link)" class="sc-form-group">
      <label class="sc-form-label">{{ mobile_apps_link == 'show_product' ? 'Product' : 'E-Gift' }}</label>
      <div class="sc-form-child-group">
        <SocoMultiselect
          type="product"
          :sub-type="mobile_apps_link == 'egift' ? 'egift' : ''"
          :data="
            (value_temp.show_product && value_temp.show_product.name) ||
            (value_temp.egift && value_temp.egift.name) ||
            ''
          "
          @callback="setValue"
        />
      </div>
    </div>

    <div v-if="['product_by_category', 'product_by_main_category'].includes(mobile_apps_link)" class="sc-form-group">
      <label class="sc-form-label">{{
        mobile_apps_link == 'product_by_category' ? 'Category' : 'Main Category'
      }}</label>
      <div class="sc-form-child-group">
        <SocoMultiselect
          type="category"
          :sub-type="mobile_apps_link == 'product_by_main_category' ? 'main' : ''"
          :data="
            (value_temp.product_by_category && value_temp.product_by_category.name) ||
            (value_temp.product_by_main_category && value_temp.product_by_main_category.name) ||
            ''
          "
          @callback="setValue"
        />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'tactical_promo'" class="sc-form-group">
      <label class="sc-form-label">Tactical Promo Type</label>
      <div class="sc-form-child-group">
        <SocoMultiselect
          type="campaign"
          :data="(value_temp.tactical_promo && value_temp.tactical_promo.name) || ''"
          @callback="setValue"
        />
      </div>
    </div>

    <div v-if="mobile_apps_link == 'mgm_page'" class="sc-form-group">
      <label class="sc-form-label">MGM Page</label>
      <div class="sc-form-child-group">
        <input v-model="value" class="sc-form-input" type="text" placeholder="Tuliskan disini" />
      </div>
    </div>
  </div>
</template>

<script>
import SocoMultiselect from './soco-multiselect';
import great_mission_code from '../../data/GreatMissionCode';

export default {
  name: 'mobile-apps-link-picker',
  components: {
    SocoMultiselect,
  },
  props: {
    data: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data() {
    return {
      mobile_apps_link_options: [
        { name: 'Landing Page', value: 'landing_page' },
        { name: 'Brand', value: 'product_by_manufacturer' },
        { name: 'Product Detail', value: 'show_product' },
        { name: 'Category', value: 'product_by_category' },
        { name: 'Main Category', value: 'product_by_main_category' },
        { name: 'In-App Browser', value: 'in_app_browser' },
        { name: 'Partner Page', value: 'partner_page' },
        { name: 'Partner Detail', value: 'partner_detail' },
        { name: 'Egift', value: 'egift' },
        {
          name: 'Mask Subscription Landing Page',
          value: 'mask_subscription_landing_page',
        },
        { name: 'Tactical Promo', value: 'tactical_promo' },
        { name: 'Promotion page', value: 'promotion_landing_page' },
        {
          name: 'See More Flash Sale page',
          value: 'see_more_flash_sale_banner',
        },
        {
          name: 'Great Mission Landing Page',
          value: 'great_mission_landing_page',
        },
        { name: 'MGM Page', value: 'mgm-page' },
        { name: 'Expert Review Page', value: 'expert-page' },
        { name: 'Recently bought need to review page', value: 'recently-bought-need-to-review-page' },
      ],
      mobile_apps_link: '',
      great_mission_options: great_mission_code,
      value: '',
      value_temp: this.resetVar(),
      has_load_more: false,
      data_changed: false,
    };
  },
  watch: {
    data: {
      handler(val) {
        if (val && val.page_type) {
          this.mobile_apps_link = val.page_type;
          setTimeout(() => {
            if (!this.data_changed) {
              this.data_changed = true;
              const temp = Object.assign({}, this.value_temp);
              const keys = Object.keys(val);
              for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (val[key]) {
                  temp[key] = val[key];
                }
              }
              this.value_temp = temp;
            }
          }, 500);
        }
      },
      deep: true,
    },
    mobile_apps_link(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.value = '';
        this.value_temp = this.resetVar();
        this.value_temp.code = '';
        this.value_temp.page_type = newVal;
        this.value_temp.value_type = '';
        if (newVal == 'partner_page') {
          this.value = `${Config.default.SOCIOLLA_WEB_URL}/partners-promo`;
        }
        if (newVal == 'landing_page') {
          this.value = this.data.landing_page ?? '';
        }
      }
    },
    value(val) {
      const type = this.mobile_apps_link;
      this.value_temp.value_type = val;
      if (type == 'great_mission_landing_page') {
        this.value_temp.great_mission_landing_page = val;
      } else if (type == 'partner_page') {
        this.value_temp.partner_page = val;
      } else if (type == 'partner_detail') {
        this.value_temp.partner_promo_id = val;
      } else if (type == 'mask_subscription_landing_page') {
        this.value_temp.mask_subscription_landing_page = val;
      } else if (type == 'landing_page') {
        this.value_temp.landing_page = val;
      } else if (type == 'mgm_page') {
        this.value_temp.mgm_page = val;
      } else if (type == 'product_by_manufacturer') {
        this.value_temp.brand = {
          id: val._id || val.id,
          name: val.name,
          slug: val.slug,
        };
        this.value_temp.value_type = val._id || val.id;
      } else if (['show_product', 'egift'].includes(type)) {
        this.value_temp[type] = {
          id: val._id || val.id,
          name: val.name,
          slug: val.slug,
        };
        this.value_temp.value_type = val.id;
      } else if (['product_by_category', 'product_by_main_category'].includes(type)) {
        this.value_temp[type] = {
          id: val._id || val.id,
          name: val.name,
          my_sociolla_sql_id: val.my_sociolla_sql_id,
          slug: val.slug,
        };
        this.value_temp.value_type = val._id || val.id;
      } else if (type == 'tactical_promo') {
        this.value_temp.tactical_promo_id = val._id || val.id;
        this.value_temp.tactical_promo = {
          id: val._id || val.id,
          name: val.name,
          slug: val.slug,
        };
        this.value_temp.value_type = val._id || val.id;
      }
    },
    value_temp: {
      handler(val) {
        if (this.mobile_apps_link == 'great_mission_landing_page') {
          this.value = val.great_mission_landing_page;
        }
        this.$emit('callback', val);
      },
      deep: true,
    },
  },
  mounted() {
    this.data_changed = false;
  },
  methods: {
    resetVar() {
      return {
        code: '',
        page_type: '',
        value_type: '',
        landing_page: '',
        great_mission_landing_page: '',
        partner_promo_id: '',
        partner_page: '',
        mask_subscription_landing_page: '',
        brand: {},
        show_product: {},
        egift: {},
        product_by_category: {},
        product_by_main_category: {},
        tactical_promo: {},
        tactical_promo_id: '',
        mgm_page: '',
      };
    },
    setValue(value) {
      this.value = value;
    },
  },
};
</script>

<style lang="scss" scoped></style>
