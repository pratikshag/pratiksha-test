<template>
  <div class="freebies-user-list">
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead class="thead-dark">
          <tr>
            <th scope="col">Username</th>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Email Address</th>
            <th scope="col">Win</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(subs, key) in subscriberFiltered" :key="key">
            <th scope="row">{{ subs.user.user_name }}</th>
            <td>{{ subs.user.first_name }}</td>
            <td>{{ subs.user.last_name }}</td>
            <td>{{ maskEmail(subs.user.email) }}</td>
            <td v-if="typeof subs.win !== 'undefined'">{{ subs.win }}</td>
            <td v-else>0</td>
            <td>
              <template v-if="subs.freebies.type == 'lottery'">
                <a
                  v-if="subs.current_state == 'waiting_for_winner_announcement'"
                  href
                  class="nbtn btn-sm btn-white"
                  @click.prevent="
                    setAsWinner({
                      user_id: subs.user._id,
                      name: subs.user.name,
                      user_name: subs.user.user_name,
                      email: subs.user.email,
                    })
                  "
                  >SET AS WINNER</a
                >
                <a v-else href="#" class="nbtn btn-sm btn-black" @click.prevent>winner</a>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
const Config = require('../../../../config/default.env').default;

import axios from 'axios';

export default {
  name: 'freebies-subscriber',

  data() {
    return {
      subscriber: [],
    };
  },

  computed: {
    freebies_id() {
      return this.$route.params.id;
    },
    subscriberFiltered() {
      return this.subscriber.filter(({ current_state, milestone_states, freebies }) =>
        freebies.is_socobox
          ? milestone_states.every(({ goal, achieved }) => goal == achieved)
          : freebies.type == 'lottery'
          ? current_state == 'claimed'
          : true
      );
    },
  },
  mounted() {
    this.getSubscriber();
  },
  methods: {
    setAsWinner(payload) {
      axios
        .post(Config.MS_SOCO_ADMIN_API_URL + `/freebies/${this.freebies_id}/winners`, payload)
        .then((res) => {
          if (res.data.success && res.status == 200) {
            const resdata = res.data.data;
            console.log(resdata);
            this.$toasted.global.show('success set as winner');
          } else {
            throw { res };
          }
          this.getSubscriber();
        })
        .catch((err) => {
          if (err.response && err.response.data) {
            const res = err.response.data;
            this.$toasted.global.error(res.message);
          }
        });
    },
    getSubscriber() {
      axios.get(Config.MS_SOCO_ADMIN_API_URL + `/freebies/${this.freebies_id}/subscriber`).then((res) => {
        if (res.data.success && res.status == 200) {
          const resdata = res.data.data;
          this.$emit('data', resdata);
          this.subscriber = res.data.data.data;
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
