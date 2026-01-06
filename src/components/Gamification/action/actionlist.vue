<template>
  <div>
    <div class="sc-table-title">Action Point Rules List</div>
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th width="300px">Action Name</th>
            <th>Point Type</th>
            <th>Milestone Nth</th>
            <th>Point Value</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(actionPointRuleslist && actionPointRuleslist.length)" :cols="4" />
          <tr v-for="(apr, key) in actionPointRuleslist" :key="key">
            <td>{{ apr.action.name }}</td>
            <td>{{ apr.type }}</td>
            <td>{{ apr.milestone_nth || '-' }}</td>
            <td>{{ apr.points }}</td>
          </tr>
        </tbody>
      </table>
      <br /><br />
    </div>
  </div>
</template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'action-list',
  data() {
    return {
      actionPointRuleslist: [],
      is_loading: true,
    };
  },
  created: function () {
    this.getactionlist();
  },
  methods: {
    getactionlist: function () {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/action-point-rules`, {
        params: {
          skip: 0,
          limit: 100,
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status === 200) {
            this.actionPointRuleslist = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
  },
};
</script>
