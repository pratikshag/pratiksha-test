<template src="./leaderboard.html"></template>
<script>
import Axios from 'axios';
import { get } from 'lodash';
const Config = require('../../../../config/default.env');
import sortField from '../../ui/global/sortField';

export default {
  name: 'get-member-leaderboard',
  components: { sortField },
  data() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return {
      endpoint: `${Config.default.MS_SOCO_PUBLIC_API_URL}/referrals-history`,
      filter: {
        month: months[new Date().getMonth()],
        year: new Date().getFullYear(),
        keywords: '',
        country: '',
      },
      start_year: 2014,
      months: months,
      loading: false,
      limit: 100,
      skip: 0,
      numPages: 0,
      page: 1,
      sortParam: '-referrals_count',
      leaderboard: [],
      totalPage: 1,
      currentPage: 1,
      currentTotalRecord: 0,
    };
  },
  created: function () {
    this.getLeaderboard();
  },
  methods: {
    getDefaultAddress(address) {
      const addr = address.street1 ? `${address.street1}` : '';
      const district = get(address, 'district.name', '') ? `, ${get(address, 'district.name', '')}` : '';
      const city = get(address, 'city.name', '') ? `, ${get(address, 'city.name', '')}` : '';
      const province = get(address, 'province.name', '') ? `, ${get(address, 'province.name', '')}` : '';
      const country = get(address, 'country.name', '') ? `, ${get(address, 'country.name', '')}` : '';
      const postal_code = address.postal_code ? ` ${address.postal_code}` : '';
      return `${addr}${district}${city}${province}${country}${postal_code}`;
    },
    setFilter() {
      const result = {};
      const filter = JSON.parse(JSON.stringify(this.filter));
      const obj = Object.keys(filter);
      let data_filter = '';
      const regexemail = new RegExp(/@([a-zA-Z0-9_\-\.]+)?/, 'gi');
      for (let i = 0; i < obj.length; i++) {
        const key = obj[i];
        if (filter[key]) {
          if (key == 'keywords') {
            data_filter = filter[key];
            const matchedInput = data_filter.match(regexemail);
            if (Boolean(matchedInput)) {
              result['user.email'] = data_filter;
            } else {
              result['user.user_name'] = data_filter;
            }
            // result['$or'] = [
            // 	{ 'user.user_name': { $regex: filter[key], $options: 'i' } },
            // 	{ 'user.email': { $regex: filter[key], $options: 'i' } }
            // ]
          } else if (key == 'country') {
            result['user.locale'] = filter[key];
          } else {
            result[key] = filter[key];
          }
        }
      }
      return result;
    },
    getLeaderboard() {
      this.loading = true;
      Axios.get(`${this.endpoint}`, {
        params: {
          limit: this.limit,
          skip: this.skip,
          sort: this.sortParam,
          filter: this.setFilter(),
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.leaderboard = response.data.data;
            this.getLeaderboardCount();
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        })
        .finally(() => (this.loading = false));
    },
    getLeaderboardCount() {
      return Axios.get(`${this.endpoint}/count`, {
        params: {
          filter: this.setFilter(),
        },
      }).then((response) => {
        this.loading = false;
        if (response.status == 200) {
          let count = parseInt(response.data.data);
          if (isNaN(count)) {
            count = 0;
          }

          this.currentTotalRecord = count;
          this.totalPage = Math.ceil(count / this.limit);
          return count;
        }
      });
    },
    exportData() {
      this.$Progress.start();
      this.loading = true;
      Axios.get(`${this.endpoint}`, {
        params: {
          filter: {
            is_email: true,
            ...this.setFilter(),
          },
          sort: this.sortParam,
          limit: 100,
        },
      })
        .then((response) => {
          if (response.status === 200) {
            this.$toasted.global.show(`report emailed to the logged in user's email`);
          }
          this.$Progress.finish();
          this.loading = false;
        })
        .catch((err) => {
          console.log(err);
          this.$toasted.global.show(err.message);
        });
    },
    pagination(page) {
      const params = {
        sort: this.sortParam,
        skip: this.skip,
        limit: this.limit,
        filter: this.setFilter(),
      };

      this.$Progress.start();
      page = parseInt(page);
      const skip = this.limit * (page - 1);
      this.posts = {};
      params.skip = skip;
      this.skip = params.skip;

      return Axios.get(`${this.endpoint}`, {
        params: params,
      })
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.leaderboard = response.data.data;
            this.currentPage = page;
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    sort(sort) {
      this.sortParam = sort;
      this.pagination(1);
    },
  },
};
</script>
