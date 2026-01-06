<template>
  <div>
    <div class="sc-table-title">
      Rewards List
      <template v-if="reward_name">({{ reward_name }})</template>
    </div>

    <router-link
      v-if="reward_name !== 'level'"
      :to="`/gamification/add/${reward_id}`"
      class="sc-btn sc-btn-lg sc-btn-rounded sc-btn-primary sc-mb-15"
    >
      + ADD
    </router-link>

    <div class="sc-pagination">
      <h1 class="sc-pagination-label">Pagination</h1>
      <div class="sc-pagination-form">
        <input
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Prev"
          @click="gotoPage(current_page - 1)"
        />
        <input
          v-model="current_page"
          class="sc-pagination-input"
          type="number"
          min="1"
          :max="totalPage"
          name=""
          @keyup.enter.prevent="gotoPage(current_page)"
        />
        <input
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Next"
          @click="gotoPage(current_page + 1)"
        />
      </div>
    </div>

    <div class="sc-filter">
      <div class="sc-filter-item">
        <label class="sc-filter-label">Search: </label>
        <input v-model="keyword" class="sc-filter-input" type="text" placeholder="Search Name" @keyup="searchQuery" />
      </div>
    </div>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th width="300px">Name</th>
            <th>Image</th>
            <th>Status</th>
            <th>Requirements</th>
            <th>How to Unlock</th>
            <th v-if="reward_name !== 'level'" width="140px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(reward, key) in rewardsList" :key="key">
            <td>{{ reward.name }}</td>
            <td>
              <img v-if="reward.image" :src="reward.image" style="width: 100px; height: 100px" />
            </td>
            <td>{{ reward.status }}</td>
            <td>
              <table>
                <tr v-for="(rule, key) in reward.rules" :key="key">
                  <td style="vertical-align: middle; padding: 3px">
                    {{ rule.name }}
                  </td>
                </tr>
              </table>
            </td>
            <td>
              <table>
                <tr v-for="(rule, key) in reward.rules" :key="key">
                  <td v-if="rule.gt_point" style="vertical-align: middle; padding: 3px">
                    <template v-if="rule.name_slug === 'shoppping-amount'">
                      {{ currencyFilter(rule.gt_point) }}
                    </template>
                    <template v-else>
                      {{ currencyFilter(rule.gt_point) }}
                    </template>
                  </td>
                  <td v-if="rule.gt_count" style="vertical-align: middle; padding: 3px">
                    {{ rule.gt_count }}
                  </td>
                </tr>
              </table>
            </td>
            <td v-if="reward_name !== 'level'">
              <div>
                <router-link :to="`/gamification/editreward/${reward._id}/${reward.reward_type_id}`">
                  <span title="Edit" aria-hidden="true" class="fa fa-pencil btn_edit"></span>
                </router-link>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <br /><br />
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
const Config = require('../../../../../config/default.env');

export default {
  data() {
    return {
      rewardsList: [],
      is_loading: true,
      rewards: [],
      keyword: '',
      total_page: 0,
      current_page: 1,
      reward_id: '',
      reward_name: '',
    };
  },
  created: function () {
    this.reward_id = this.$route.params.id;
    this.getrewardsList();
  },
  methods: {
    getrewardsList: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/rewards`, {
        params: {
          filter: {
            reward_type_id: this.reward_id,
          },
          skip: 0,
          limit: 20,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status === 200 && response.data.data.length > 0) {
            this.reward_name = response.data.data[0].reward_name;
            this.rewardsList = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    searchQuery: function () {
      this.$Progress.start();
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/rewards`, {
        params: {
          filter: {
            name: {
              $regex: this.keyword,
              $options: 'i',
            },
            reward_name: this.reward_name,
          },
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.rewardsList = response.data.data;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    pagination: function (page) {
      this.$Progress.start();
      page = parseInt(page);
      const skip = 2 * (page - 1);
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/rewards`, {
        params: {
          filter: {
            reward_name: this.reward_name,
          },
          skip: skip,
          limit: 10,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.rewardsList = response.data.data;
            this.current_page = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    currencyFilter: function (value) {
      const res = parseInt(value)
        .toString()
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
      return res == '0' ? '0' : res;
    },
  },
};
</script>
