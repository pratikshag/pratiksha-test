<template>
  <div class="help-categories">
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>platform</th>
            <th>Locale</th>
            <th>setting</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(setting, index) in settings" :key="index">
            <td>{{ setting.platform }}</td>
            <td>{{ setting.locale }}</td>
            <td>
              <a href="javascript:;" @click="toggleActive(setting._id, setting.is_active)">
                <span :class="isToggle(setting.is_active)"></span>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
const Config = require('../../../config/default.env');
export default {
  name: 'third-party-login',
  data() {
    return {
      loading: false,
      settings: [],
    };
  },
  created() {
    this.getSettings();
  },
  methods: {
    async toggleActive(id, isActive) {
      return new Promise((resolve, reject) => {
        try {
          this.loading = true;
          resolve(
            axios.put(`${Config.default.MS_SOCO_ADMIN_API_URL}/third-party-login/${id}`, {
              is_active: !isActive,
            })
          );
        } catch (error) {
          reject(error);
        }
      })
        .then(() => {
          this.getSettings();
        })
        .finally(() => {
          this.loading = false;
          this.$toasted.global.show('Data Updated');
        })
        .catch(() => {
          this.$toasted.global.error('Please Try Again Later');
        });
    },

    getSettings() {
      return axios.get(`${Config.default.MS_SOCO_ADMIN_API_URL}/third-party-login`).then((response) => {
        const data = response.data.data;
        this.settings = data;
      });
    },

    isToggle(isActive) {
      return isActive ? 'fa fa-toggle-on' : 'fa fa-toggle-off';
    },
  },
};
</script>
