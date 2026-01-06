<template>
  <div class="form-address">
    <form @submit.prevent="doSave">
      <!-- <div class="form-wrapper-address">
				<label class="control-label title-cl">
					<span>Judul Alamat</span>
				</label>
				<div class="form-wrapper-address">
					<label class="control-label">
						<span>Nama Alias (ex, Alamat Kantor)</span>
					</label>
					<div>
						<input class="form-control" required="required" type="text" v-model="address.name" />
					</div>
				</div>
			</div> -->
      <!-- <div class="form-wrapper-address">
				<label class="control-label title-cl">
					<span>Informasi Penerima</span>
				</label>
				<div class="row">
					<div class="col-xs-6">
						<div class="form-wrapper-address">
							<label class="control-label">
								<span>Nama Depan</span>
							</label>
							<div>
								<input class="form-control" type="text" v-model="address.first_name" />
							</div>
						</div>
					</div>
					<div class="col-xs-6">
						<div class="form-wrapper-address">
							<label class="control-label">
								<span>Nama Belakang</span>
							</label>
							<div>
								<input class="form-control" type="text" v-model="address.last_name" />
							</div>
						</div>
					</div>
					<div class="col-xs-12">
						<div class="form-wrapper-address">
							<label class="control-label">
								<span>Nomor Hp</span>
							</label>
							<div>
								<input
									class="form-control"
									required="required"
									type="text"
									v-model="address.phone"
								/>
							</div>
						</div>
					</div>
				</div>
			</div> -->
      <div class="form-wrapper-address">
        <label class="control-label title-cl">
          <span>Alamat Lengkap</span>
        </label>
        <div class="row px-4">
          <div class="col-12">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>Address</span>
              </label>
              <div>
                <textarea v-model="address.address" class="form-control" required="required" />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>Negara</span>
              </label>
              <div>
                <select class="form-control">
                  <option disabled selected>{{ address.country.name }}</option>
                </select>
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>Provinsi</span>
              </label>
              <div>
                <input-auto-complete
                  v-model="provinceName"
                  :data="provincesFilter"
                  field="name"
                  open-on-focus
                  required="required"
                  @select="(data) => onSelect('province', data)"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>City</span>
              </label>
              <div>
                <input-auto-complete
                  v-model="cityName"
                  :data="citiesFilter"
                  :readonly="Object.keys(address.province).length === 0"
                  field="name"
                  open-on-focus
                  required="required"
                  @select="(data) => onSelect('city', data)"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>District</span>
              </label>
              <div>
                <input-auto-complete
                  v-model="districtName"
                  :data="districtsFilter"
                  :readonly="Object.keys(address.city).length === 0"
                  field="name"
                  open-on-focus
                  required="required"
                  @select="(data) => onSelect('district', data)"
                />
              </div>
            </div>
          </div>
          <div class="col-6">
            <div class="form-wrapper-address">
              <label class="control-label">
                <span>Postal Code</span>
              </label>
              <div>
                <input v-model="address.postal_code" class="form-control" required="required" type="text" />
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="bt-wrp">
              <slot name="action" />
              <div v-if="isLoading" class="button button_inset btn-load">
                <loaderspin />
              </div>
              <input
                v-else
                :class="hasValid ? 'btn-success' : 'btn-danger'"
                class="btn-dark py-2 px-4 rounded"
                type="submit"
                value="Save"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { get, omit } from 'lodash';
import Axios from 'axios';
const Config = require('../../../../config/default.env');
const generateAddress = () => {
  return {
    // _id: "",
    country: {
      id: '5b7b9732e0f641daab541a47',
      name: 'Indonesia',
    },
    province: {},
    city: {},
    district: {},
    // is_default: false,
    // is_deleted: false,
    // name: "",
    // contact_person: "",
    // phone: "",
    address: '',
    postal_code: '',
    // first_name: "",
    // last_name: "",
    getData() {
      const data = omit(this, ['getData', 'setData']);
      return data;
    },
    setData(param) {
      ['province', 'city', 'district', 'address', 'postal_code'].forEach((key) => {
        if (param.hasOwnProperty(key)) {
          this[key] = param[key];
        }
      });
    },
  };
};

export default {
  name: 'form-address',
  components: {
    InputAutoComplete: () => import('@/components/forms/input-autocomplete/input-autocomplete'),
  },
  props: {
    addressProps: {
      default: null,
      type: Object,
    },
    isLoading: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      endpoint: Config.default.MS_SOCO_PUBLIC_API_URL,
      provinces: [],
      provinceName: '',
      provinceId: null,
      cityId: null,
      cities: [],
      cityName: '',
      districts: [],
      districtName: '',
      address: generateAddress(),
    };
  },
  computed: {
    hasValid() {
      const {
        address: { province, city, district, address, postal_code },
      } = this;

      return [
        Boolean(province && province.name),
        Boolean(city && city.name),
        Boolean(district && district.name),
        address,
        postal_code,
      ].every((item) => Boolean(item));
    },
    districtsFilter() {
      if (this.districtName.length > 3) {
        return this.districts.filter((item) => {
          return item.name.toLowerCase().includes(this.districtName.toLowerCase());
        });
      }

      return this.districts;
    },
    citiesFilter() {
      if (this.cityName.length > 3) {
        return this.cities.filter((item) => {
          return item.name.toLowerCase().includes(this.cityName.toLowerCase());
        });
      }

      return this.cities;
    },
    provincesFilter() {
      if (this.provinceName.length > 3) {
        return this.provinces.filter((item) => {
          return item.name.toLowerCase().includes(this.provinceName.toLowerCase());
        });
      }

      return this.provinces;
    },
  },
  watch: {
    addressProps: {
      handler: function (value) {
        if (value) {
          this.address = generateAddress();
          this.address.setData(value);
          const { province, city, district } = value;
          this.provinceName = get(province, 'name', '');
          this.cityName = get(city, 'name', '');
          this.districtName = get(district, 'name', '');
        }
      },
      immediate: true,
    },
  },
  created() {
    this.doFind();
  },
  methods: {
    doSave() {
      if (this.hasValid) {
        this.$emit('save', this.address.getData());
      }
    },
    onSelect(type, data) {
      if (type === 'province') {
        this.cities = [];
        this.cityName = '';
        this.districts = [];
        this.districtName = '';
        this.address.province = Object.assign({}, data);

        this.doFind('cities');
      } else if (type === 'city') {
        this.districts = [];
        this.districtName = '';
        this.address.city = Object.assign({}, data);

        this.doFind('districts');
      } else if (type === 'district') {
        this.address.district = Object.assign({}, data);
      }
    },
    async doFind(types = 'provinces') {
      try {
        let params = { limit: 999, sort: 'name' };
        const { province, city } = this.address;

        if (types === 'cities' && province._id) {
          params['filter'] = { province_id: province._id };
        } else if (types === 'districts' && city._id) {
          params = { city_id: city._id };
        }

        const response = await Axios.get(this.endpoint + '/' + types, {
          params,
        });

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          if (types === 'provinces') {
            this.provinces = response.data.data;
          } else if (types === 'cities') {
            this.cities = response.data.data;
          } else if (types === 'districts') {
            this.districts = response.data.data;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>

<style lang="scss">
.form-address {
  .form-control {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #ffffff;
    background-clip: padding-box;
    border: 1px solid #ddd !important;
    border-radius: 0.25rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
  .bt-wrp {
    display: flex;
    justify-content: flex-end;
    margin: 0;

    .button {
      width: auto;

      & + .button {
        margin-left: 0.75rem;
      }
    }
  }

  .btn-load {
    min-width: 60px;

    .loaderspinwrap {
      display: flex;
      align-items: center;
      justify-content: center;

      .loaderspin {
        width: 18px;
        height: 18px;
        border-width: 4px;
        margin: 0;
      }
    }
  }

  .form-wrapper-address {
    & + .form-wrapper-address {
      margin-top: 1.25rem;
    }

    label.control-label {
      font-weight: bold;
      margin-bottom: 0.5rem;

      display: block;

      &.title-cl {
        font-size: 18px;
        margin-bottom: 0.75rem;
      }
    }

    div[class^='col-xs'],
    div[class*=' col-xs'] {
      &:not(:last-child) {
        margin-bottom: 0.75rem;
      }
    }

    input[readonly] {
      background-color: #fff;
    }
  }
}
</style>
