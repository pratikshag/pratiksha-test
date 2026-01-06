<template>
  <div class="soco-point-injection-add">
    <div class="soco-point-injection-add__form">
      <div class="sc-form">
        <div class="action-list">
          <a
            href="https://soc-uat-uploads.s3.amazonaws.com/241125172256 - [sample point injection or deduction.csv].csv"
            download
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-primary"
          >
            Example CSV
          </a>
        </div>
        <div class="sc-form-title">{{ injectionId ? 'Edit' : 'Add' }} injection</div>
        <!-- the form -->
        <form class="sc-form-container" @submit.prevent="save()">
          <div class="sc-form-group">
            <label for="date-picker-basic" class="sc-form-label"><sup>*</sup>Date of Injection</label>
            <vuestic-date-picker
              id="date-picker-basic"
              v-model="payload.insert_date"
              class="sc-form-input"
              :config="dateInjectionConfig"
            />
          </div>
          <div class="sc-form-group">
            <label for="name" class="sc-form-label"><sup>*</sup>Project Name</label>
            <input
              id="name"
              v-model="payload.name"
              class="sc-form-input"
              name="name"
              type="text"
              size="40"
              aria-required="true"
            />
          </div>
          <div class="sc-form-group">
            <label for="action" class="sc-form-label"><sup>*</sup>Action</label>
            <select id="action" v-model="payload.action" class="sc-form-input" aria-required="true" name="action">
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          <div class="sc-form-group">
            <label for="csv_link" class="sc-form-label"><sup>*</sup>CSV File</label>
            <input
              id="thisFile"
              ref="select-csv"
              hidden
              type="file"
              name="thisFile"
              class="sc-form-input"
              accept=".csv"
              @change="selectCsv($event.target.files)"
            />
            <div class="sc-row-items" style="width: max-content">
              <button class="sc-btn sc-btn-rounded sc-btn-sm sc-mr-10" @click.prevent="$refs['select-csv'].click()">
                Browse
              </button>
              <span>{{ csv_name || 'No file selected' }}</span>
            </div>
          </div>
          <div class="sc-form-group">
            <label for="is_enable" class="sc-form-label">Enabled</label>
            <div class="sc-form-input sc-form-radio">
              <div>
                <input id="yes" v-model="payload.is_enable" type="radio" name="enabled" :value="true" />
                <label for="yes">Yes</label>
              </div>
              <div>
                <input id="no" v-model="payload.is_enable" type="radio" name="enabled" :value="false" />
                <label for="no">No</label>
              </div>
            </div>
          </div>
        </form>
        <div class="sc-form-container">
          <div class="sc-form-group sc-form-group-full">
            <label for="is_enable" class="sc-form-label">Injected Soco Point List</label>
            <div class="sc-table-responsive">
              <table class="sc-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Title Message</th>
                    <th>Message</th>
                    <th>SP Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="csv_loading">
                    <td colspan="8">
                      <div class="loaderspin csv-loader"></div>
                    </td>
                  </tr>
                  <template v-else>
                    <TableEmpty v-if="!is_loading && !(data && data.length)" :cols="8" />
                    <tr v-for="(person, index) in data" :key="index">
                      <td>{{ person.no }}</td>
                      <td>{{ person.unique_id }}</td>
                      <td>{{ person.username }}</td>
                      <td>{{ person.email }}</td>
                      <td>{{ person.phone_number }}</td>
                      <td v-html="person.title_message"></td>
                      <td v-html="person.message"></td>
                      <td>{{ person.sp_value }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div v-if="is_loading" class="loaderspin button-loader"></div>
        <div v-else class="sc-filter-button sc-mt-20 sc-align-right">
          <input
            type="submit"
            value="BACK"
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-secondary sc-mr-10"
            @click="back"
          />
          <input
            type="submit"
            :value="injectionId ? 'UPDATE' : 'SUBMIT'"
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-primary"
            :disabled="disableToSubmit"
            @click="submit"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const Config = require('../../../config/default.env').default;
import { isEmpty, get } from 'lodash';
import Axios from 'axios';
export default {
  name: 'SocoPointInjectionAdd',
  data() {
    return {
      payload: {
        name: '',
        insert_date: '',
        action: 'increase',
        csv_link: '',
        is_enable: false,
        total_point: 0,
      },
      data: [],
      is_loading: false,
      csv_loading: false,
      csv_name: '',
      endpoint: `${Config.MS_SOCO_ADMIN_API_URL}/soco-point-injection`,
    };
  },
  computed: {
    injectionId() {
      return this.$route.params.id;
    },
    mandatoryField() {
      return ['name', 'insert_date', 'action', 'csv_link'];
    },
    disableToSubmit() {
      return this.mandatoryField.some((field) => isEmpty(this.payload[field]));
    },
    dateInjectionConfig() {
      const config = { dateFormat: 'd-M-Y' };
      if (!this.injectionId) {
        config.minDate = 'today';
      }
      return config;
    },
  },
  created() {
    if (this.injectionId) {
      this.fetchData();
    }
  },
  methods: {
    back() {
      this.$router.push({ name: 'injection-list' });
    },
    async submit() {
      return new Promise((resolve, reject) => {
        try {
          this.is_loading = true;
          const method = this.injectionId ? 'put' : 'post';
          const endpoint = this.injectionId ? `${this.endpoint}/${this.injectionId}` : this.endpoint;
          resolve(
            Axios[method](endpoint, {
              ...this.payload,
              total_point: this.getTotalPoint(),
            })
          );
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        this.is_loading = false;
        this.$router.push({ name: 'injection-list' });
        this.$toasted.global.show('Successfully submitted');
      });
    },
    async fetchData() {
      return new Promise((resolve, reject) => {
        try {
          resolve(
            Axios.get(this.endpoint, {
              params: {
                filter: { _id: this.injectionId },
              },
            })
          );
        } catch (error) {
          reject(error);
        }
      }).then((response) => {
        const data = get(response, 'data.data[0]', {});
        if (data.csv_link) {
          this.readCsv(data.csv_link);
        } else {
          this.data.push({
            no: 1,
            unique_id: data.campaign_injection.user.id,
            username: data.campaign_injection.user.name,
            email: data.campaign_injection.user.email,
            phone_number: data.campaign_injection.user.phone_number,
            sp_value: data.total_point,
            title_message: data.title_message,
            message: data.message,
          });
        }
        for (const key of Object.keys(this.payload)) {
          this.payload[key] = Array.isArray(data[key]) ? data[key][0] : data[key];
        }
      });
    },
    async readCsv(url) {
      if (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const splitUrl = String(url).split('/');
        const fileName = splitUrl[splitUrl.length - 1];
        const file = new File([blob], fileName);
        this.selectCsv([file]);
        this.payload.csv_link = url;
      }
    },
    selectCsv(file) {
      if (file && file[0]) {
        this.csv_loading = true;
        const reader = new FileReader();
        reader.onload = () => {
          const fileName = get(file[0], 'name', '');
          const timestamp = this.generateTimestamp();
          const newFileName = `${timestamp} - [${fileName}].csv`;
          this.$store
            .dispatch('files/putFile', {
              filename: newFileName,
              blob: file[0],
            })
            .then(({ url }) => {
              this.payload.csv_link = url;
              this.csv_name = newFileName;
            })
            .then(() => (this.data = this.parseCsv(reader.result)))
            .finally(() => (this.csv_loading = false));
        };
        reader.readAsText(file[0]);
        reader.onerror = (error) => {
          console.error(error);
        };
      }
    },
    generateTimestamp() {
      const now = new Date();
      const year = now.getFullYear().toString().slice(2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      return `${year}${month}${day}${hours}${minutes}${seconds}`;
    },
    parseCsv(csv = '') {
      const lines = csv.split('\n').filter((line) => Boolean(line.length));
      const getValueFromLine = (line) => {
        return line.split(';').map((ln) => {
          return ln.replace(/\"|\r$/g, '');
        });
      };
      const headers = getValueFromLine(lines[0]);
      // START PARSING THE DATA
      // BY REMOVE THE HEADER FIRST
      lines.shift();
      return lines.map((line) => {
        const lineValue = getValueFromLine(line);
        return lineValue.reduce((result, value, index) => {
          result[headers[index]] = String(value).trim();
          return result;
        }, {});
      });
    },
    getTotalPoint() {
      return this.data.reduce((result, dt) => {
        result += isNaN(Number(dt.sp_value)) ? 0 : Number(dt.sp_value);
        return result;
      }, 0);
    },
  },
};
</script>

<style lang="scss" scoped>
sup {
  color: red;
  font-size: 15px;
}
.sc-form-radio {
  display: flex;
  align-items: center;
  > div {
    display: flex;
    align-items: center;
    margin-right: 1rem;
    input {
      margin-right: 5px;
    }
  }
}
.loaderspin {
  &.button-loader {
    margin: 24px 24px 0px auto;
  }
  &.csv-loader {
    margin-bottom: 24px;
  }
}
.action-list {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
</style>
