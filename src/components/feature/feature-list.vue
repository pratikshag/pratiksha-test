<template>
  <div class="feature-list-wrapper">
    <div class="sc-filter">
      <div class="sc-filter-item">
        <label class="sc-filter-label">Feature Name: </label>
        <select v-model="update.feature_name" class="sc-form-input">
          <option value="" selected="selected">-- Select Feature Name --</option>
          <option v-for="(feat, i) in features" :key="'feat-' + i" :value="feat.feature_name">
            {{ feat.feature_name }}
          </option>
        </select>
      </div>
      <div class="sc-filter-item">
        <label class="sc-filter-label">Platform: </label>
        <multiselect
          v-model="update.platform"
          :multiple="true"
          :options="listPlatform"
          label="name"
          track-by="name"
          placeholder="-- Select Platform --"
        ></multiselect>
      </div>
      <div class="sc-filter-item sc-filter-button">
        <input
          type="submit"
          value="Update Platform"
          class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
          :disabled="!update.feature_name || !update.platform.length"
          @click="doToggleFeature(null)"
        />
      </div>
    </div>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>Feature Name</th>
            <th>Platform</th>
            <th>Is Active</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!(features && features.length)" :cols="3" />
          <tr v-for="(feature, idx) in features" :key="idx">
            <td>{{ feature.feature_name }}</td>
            <td>{{ feature.platform }}</td>
            <td>
              <a
                class="sc-btn sc-btn-md sc-btn-rounded"
                :class="{
                  'sc-btn-secondary': feature.isToggleOn,
                  'sc-btn-danger': !feature.isToggleOn,
                }"
                @click="doToggleFeature(idx)"
              >
                <i :class="`fa fa-${feature.isToggleOn ? 'check' : 'times'}`"></i>
                <span style="margin-left: 8px">{{ feature.isToggleOn ? 'Active' : 'Non Active' }}</span>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <br />
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
import { get, startCase } from 'lodash';
import Multiselect from 'vue-multiselect';

const Config = require('../../../config/default.env');
const filterSearch = () => {
  return {
    feature_name: '',
    platform: '',
    isToggleOn: null,
  };
};

export default {
  name: 'feature-list',
  components: {
    Multiselect,
  },
  data() {
    return {
      features: [],
      isLoading: true,
      endpoint: Config.default.MS_SOCO_ADMIN_API_URL + '/feature-toggles',
      search: filterSearch(),
      update: {
        feature_name: '',
        platform: [],
      },
    };
  },
  computed: {
    listPlatform() {
      const list = [
        { name: 'all', $isDisabled: false },
        { name: 'sociolla', $isDisabled: false },
        { name: 'sociolla_vn', $isDisabled: false },
      ];
      if (this.update.platform.length) {
        const all = this.update.platform.filter((x) => x.name === 'all');
        return list.map((x) => {
          const xx = Object.assign({}, x);
          if (all.length) {
            if (xx.name === 'all') {
              xx['$isDisabled'] = false;
            } else {
              xx['$isDisabled'] = true;
            }
          } else {
            if (xx.name === 'all') {
              xx['$isDisabled'] = true;
            } else {
              xx['$isDisabled'] = false;
            }
          }
          return xx;
        });
      } else {
        return list;
      }
    },
    hasFilter() {
      const { search } = this;
      const validKey = (param) => (typeof param === 'string' ? Boolean(param) : param !== null);

      return Object.keys(search).some((key) => validKey(search[key]));
    },
    params() {
      const { search } = this;
      const validKey = (param) => (typeof param === 'string' ? Boolean(param) : param !== null);

      const filter = Object.keys(search).reduce((accu, key) => {
        if (validKey(search[key])) {
          const param = {};
          param[key] = search[key];

          Object.assign(accu, param);
        }

        return accu;
      }, {});

      return { filter, limit: 100 };
    },
  },
  created() {
    this.doFindFeatures();
  },
  methods: {
    async doToggleFeature(idx) {
      try {
        let feature_name = this.update.feature_name;
        let payload = {};
        if (idx) {
          feature_name = this.features[idx].feature_name;
        } else {
          const platform = [];
          this.update.platform.forEach((x) => platform.push(x.name));
          payload = { platform };
        }
        const response = await Axios.put(`${this.endpoint}/${feature_name}`, payload);
        this.update.feature_name = '';
        this.update.platform = [];
        this.$toasted.global.success('update feature success');
        if (get(response, 'data.success', false)) {
          this.doFindFeatures();
        }
      } catch (e) {
        console.log(e);
        this.$toasted.global.error('Toggle feature failed');
      }
    },
    async doFindFeatures() {
      try {
        const response = await Axios.get(this.endpoint, {
          params: this.params,
        });
        this.features = get(response, 'data.data', []);
      } catch (e) {
        console.log(e);
        this.$toasted.global.error('Get feature failed');
      }
    },
    formatCase(param) {
      return startCase(param);
    },
    onResetFilter() {
      this.search = filterSearch();
      this.doFindFeatures();
    },
  },
};
</script>

<style lang="scss">
.feature-list-wrapper {
  .btn-white {
    background: white;
    color: black;
  }

  table td .button {
    width: auto;
    max-width: 150px;
    padding: 6px 12px;
  }

  .feature-list-inner {
    padding: 12px 25px 25px;
  }

  .search-item {
    p {
      margin-bottom: 8px;
    }

    select {
      width: auto !important;
      min-width: 150px;
      padding: 4px 8px;
    }

    input {
      width: auto !important;
      padding: 4px 8px;
      min-height: 30px;
      border: 1px solid grey !important;
      border-radius: 2px;
    }

    & + .search-item {
      margin-left: 16px;
    }

    &.fl-end {
      display: flex;
      align-items: flex-end;
    }
  }
}
.upd-feature {
  height: 40px;
  & > select {
    height: 45px;
  }
}
.upd-feature.multi {
  width: 500px;
  & > .multiselect {
    border: 1px solid grey !important;
    input {
      border: none !important;
      width: unset !important;
      display: unset;
    }
  }
}
.fl-end > input {
  height: 45px;
}
</style>
