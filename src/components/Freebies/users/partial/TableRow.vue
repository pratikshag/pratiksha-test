<template>
  <tr :class="{ 'table-primary': isSelected }">
    <td>
      <input v-model="checked" :value="payload" :disabled="disabledCheckbox" type="checkbox" />
    </td>
    <td v-text="registrationDate"></td>
    <td v-text="item.user_id"></td>
    <td>
      <a target="_blank" :href="$_userLink(item.user.user_name)">
        {{ item.user.user_name }} <span class="fa fa-external-link"></span>
      </a>
    </td>
    <td v-text="item.user.first_name"></td>
    <td v-text="item.user.last_name"></td>
    <td>{{ maskEmail(item.user.email) }}</td>
    <td v-text="winCount"></td>
    <td>
      <ul class="missions">
        <li v-for="item in missions" :key="item.action_id">{{ item.name }} {{ item.progress }}</li>
      </ul>
    </td>
    <td>
      {{ item.survey_answers && item.survey_answers.length ? 'Filled' : 'Not Filled' }}
    </td>
    <td class="state">
      <span v-if="isWinner" class="badge badge-success" v-text="item.current_state"></span>

      <template v-else-if="availableQuota > 0">
        <a v-if="isWaitingWinner" href="javascript:" class="btn btn-sm btn-outline" @click="setWinner"
          >Set as a winner</a
        >

        <span v-else class="badge badge-info" v-text="item.current_state"></span>
      </template>

      <span v-else class="badge badge-danger" v-text="item.current_state"></span>
    </td>
  </tr>
</template>

<script>
export default {
  name: 'table-row',

  props: {
    item: {
      type: Object,
    },
    value: {
      type: Array,
    },
    availableQuota: {
      type: Number,
    },
  },

  // data () {},

  computed: {
    actions() {
      return this.$store.state.freebies.actions;
    },

    checked: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      },
    },

    isSelected() {
      return this.checked.some(({ user_id }) => user_id == this.item.user_id);
    },

    isWaitingWinner() {
      return this.item.current_state == 'waiting_for_winner_announcement';
    },

    isWinner() {
      return (
        ['won', 'ordered-by-admin', 'delivered', 'product_accepted_by_user', 'waiting-review', 'reviewed'].indexOf(
          this.item.current_state
        ) > -1
      );
    },

    winCount() {
      return Object.keys(this.item).indexOf('win') > -1 ? this.item.win : 0;
    },

    missions() {
      return (this.item.milestone_states || []).map(({ action_id, goal, achieved }) => ({
        action_id,
        name: this.actions.find(({ _id }) => _id === action_id)?.name || '',
        completed: goal == achieved,
        progress: `(${achieved}/${goal})`,
      }));
    },

    registrationDate() {
      return moment(this.item.user.created_at).format('DD-MM-YYYY');
    },

    payload() {
      const { id: user_id, email, name, user_name } = this.item.user;

      return {
        user_id,
        user_name,
        email,
        name,
      };
    },

    disabledCheckbox() {
      return this.availableQuota && !this.isWaitingWinner;
    },
  },

  methods: {
    setWinner() {
      this.$emit('set-winner', this.payload);
    },
  },
};
</script>
