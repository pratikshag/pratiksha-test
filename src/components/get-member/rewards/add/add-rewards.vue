<template src="./add-rewards.html"></template>
<script>
const Config = require('../../../../../config/default.env');
const ApiUrl = Config.default.MS_SOCO_PUBLIC_API_URL + `/mgm-rewards`;
const EditUrl = Config.default.MS_SOCO_PUBLIC_API_URL + `/mgm-rewards/`;
import Axios from 'axios';
import { VueEditor } from 'vue2-editor';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';

export default {
  name: 'event-detail',
  components: {
    VueEditor,
    Datetime,
  },
  data() {
    return {
      reward_for: [
        {
          name: 'Referrer',
          value: 'referrer',
        },
        {
          name: 'Referee',
          value: 'referee',
        },
      ],
      reward_type: [
        {
          name: 'SOCO Point',
          value: 'soco_point',
        },
        {
          name: 'Voucher',
          value: 'voucher',
        },
        {
          name: 'SOCO Point & Voucher',
          value: 'all',
        },
      ],
      reward_status: [
        {
          name: 'Active',
          value: true,
        },
        {
          name: 'Inactive',
          value: false,
        },
      ],
      discount_type: [
        {
          name: 'Percentage',
          value: 'percentage',
        },
        {
          name: 'Amount',
          value: 'amount',
        },
        {
          name: 'Free Shipping',
          value: 'free_shipping',
        },
      ],
      is_loading: true,
      event_id: null,
      rewards: {
        name: '',
        available_quota: 0,
        apply_discount_for: 'referrer',
        type: 'soco_point',
        soco_points: 0,
        voucher: {
          name: '',
          discount_type: '',
          to_date: '',
          rules: {
            order: {
              min_amount: 0,
              max_amount: 0,
            },
          },
          discount_info: {
            deduction_percentage: 0,
            deduction_amount: 0,
          },
          quota_per_user: 0,
        },
        from_date: '',
        to_date: '',
        is_active: false,
        locale: 'vi',
        description: '',
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }, { align: [] }],
        ['image', 'video', 'link'],
      ],
    };
  },
  computed: {
    validator() {
      const rewards = this.rewards;
      return Boolean(
        rewards.name &&
          rewards.available_quota &&
          rewards.apply_discount_for &&
          rewards.type &&
          rewards.from_date &&
          rewards.to_date
      );
    },
  },
  watch: {
    $route(route) {
      this.fetch();
    },
  },

  mounted() {
    this.fetch();
  },

  methods: {
    fetch() {
      this.formReset();
      this.event_id = this.$route.params.id;

      if (this.event_id) {
        this.is_loading = true;
        return Axios.get(ApiUrl, {
          params: { filter: { _id: this.event_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              const res = response.data.data[0];
              this.rewards = Object.assign({}, res);
              if (this.rewards.type === 'soco_point') {
                // this.rewards.voucher = {
                //   id: '',
                //   code: '',
                // };
                this.rewards.voucher = {
                  name: '',
                  discount_type: '',
                  to_date: '',
                  rules: {
                    order: {
                      min_amount: 0,
                      max_amount: 0,
                    },
                  },
                  discount_info: {
                    deduction_percentage: 0,
                    deduction_amount: 0,
                  },
                  quota_per_user: 0,
                };
              }
              // this.organizersTemp = this.event.organizers
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },
    save() {
      const self = this;
      // self.event.organizers = self.organizersTemp
      self.rewards.available_quota = Number(self.rewards.available_quota);
      self.rewards.soco_points = Number(self.rewards.soco_points);

      if (self.rewards.type === 'soco_point') {
        delete self.rewards.voucher;
      } else {
        self.rewards.voucher.rules.order.min_amount = Number(self.rewards.voucher.rules.order.min_amount);
        self.rewards.voucher.rules.order.max_amount = Number(self.rewards.voucher.rules.order.max_amount);
        self.rewards.voucher.discount_info.deduction_percentage = Number(
          self.rewards.voucher.discount_info.deduction_percentage
        );
        self.rewards.voucher.discount_info.deduction_amount = Number(
          self.rewards.voucher.discount_info.deduction_amount
        );
        self.rewards.voucher.quota_per_user = Number(self.rewards.voucher.quota_per_user);
      }

      if (self.rewards.is_deleted) {
        delete self.rewards.is_deleted;
      }

      if (this.validator) {
        if (self.event_id) {
          //   delete self.event._id;
          Axios.put(EditUrl + self.event_id, self.rewards)
            .then((response) => {
              if (response.status === 200) {
                self.$router.push('/get-member/rewards');
              }
            })
            .catch((err) => {
              self.$Progress.fail();
              this.$toasted.global.error(err);
              throw err;
            });
        } else {
          Axios.post(ApiUrl, self.rewards)
            .then((response) => {
              if (response.status === 200) {
                self.$router.push('/get-member/rewards');
              }
            })
            .catch((err) => {
              self.$Progress.fail();
              this.$toasted.global.error(err);
              throw err;
            });
        }
      } else {
        this.$toasted.global.error('Please fill all the mandatory fields');
      }
    },

    // .......................Operation Section....
    formReset() {
      this.event_id = null;
      (this.rewards = {
        name: '',
        available_quota: 0,
        apply_discount_for: 'referrer',
        type: 'soco_point',
        soco_points: 0,
        voucher: {
          name: '',
          discount_type: '',
          to_date: '',
          rules: {
            order: {
              min_amount: 0,
              max_amount: 0,
            },
          },
          discount_info: {
            deduction_percentage: 0,
            deduction_amount: 0,
          },
          quota_per_user: 0,
        },
        from_date: '',
        to_date: '',
        is_active: false,
        locale: 'vi',
        description: '',
      }),
        (this.is_loading = false);
    },
  },
};
</script>

<style lang="scss" scoped>
sup {
  color: red;
  font-size: 15px;
}

#form-right {
  float: left;
  margin-left: 50px;
}

.dropdown-item-select {
  img {
    height: 30px;
    margin-right: 10px;
  }
}

.title {
  line-height: 41px;
  font-family: 'lato-regular', sans-serif;
  font-size: 30px;
  text-transform: capitalize;
}

.detail-content {
  width: 700px;
}

.desc {
  float: left;
  max-width: 400px;
  text-align: justify;
}

.fieldarea {
  margin: 0 auto;
  display: block;
  text-align: center;
}
.field.fieldinfo {
  color: #999999;
  position: relative;
  top: 47px;
}
h2.title {
  display: flex;
  text-align: left;
  font-size: 23px;
  width: 100%;
  height: 52px;
  border-radius: 5px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.5);
  background-color: #fff4f7;
  align-items: center;
  padding: 0 20px;
  margin: 20px 0;
}

.label-post {
  color: #222 !important;
  font: 17px 'lato-regular', sans-serif !important;
  font-weight: bold !important;
  margin-bottom: 5px !important;
}
</style>
