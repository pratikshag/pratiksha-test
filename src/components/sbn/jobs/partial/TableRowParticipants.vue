<template>
  <tr>
    <td v-text="item.user.name"></td>
    <td>
      <a :href="$_userLink(item.user.user_name)" target="_blank">
        {{ item.user.user_name }} <span class="fa fa-external-link"></span>
      </a>
    </td>
    <td v-text="item.user.user_level"></td>
    <td v-text="maskEmail(item.user.email)"></td>
    <td v-if="isFormatSupported">
      <a href="javascript:" @click="$emit('show-modal', { payload: payload.pdf, ref: 'modal-pdf' })">
        <span class="fa fa-search"></span> View
      </a>
    </td>
    <td v-else>-</td>
    <td v-text="state.text"></td>
    <td v-if="hasJobConfirmation">
      <a
        href="javascript:"
        @click="
          $emit('show-modal', {
            payload: payload.confirm,
            ref: 'modal-confirm',
          })
        "
      >
        <span class="fa fa-search"></span> View
      </a>
    </td>
    <td v-else>-</td>
    <td>
      <ul class="actions">
        <li>
          <a
            href="javascript:"
            @click="
              $emit('show-modal', {
                payload: payload.participant,
                ref: 'modal-participant',
              })
            "
          >
            <span class="fa fa-pencil-square-o"></span> Edit
          </a>
        </li>
      </ul>
    </td>
  </tr>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'table-row-participants',

  props: {
    item: {
      type: Object,
    },
  },

  data() {
    return {
      loading: false,
    };
  },

  computed: {
    ...mapState('jobs', ['states']),

    payload() {
      return {
        pdf: {
          file: {},
          mou: '',
        },
        confirm: {
          media: [],
          image: [],
        },
        participant: {},
      };
    },

    state() {
      return this.states.find(({ value }) => value == this.item.state);
    },

    isFormatSupported() {
      return ['pdf', 'jpg', 'jpeg', 'png'].indexOf(this.payload.pdf.file.type) > -1;
    },

    hasJobConfirmation() {
      return Object.keys(this.item.job_confirmation).length > 0;
    },

    reviewSubmittedDate() {
      return this.item.state_histories.find(({ to_status }) => to_status == 'review_submitted').created_at || '';
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      // payload modal-pdf
      this.payload.pdf.file = this.$_file(this.item.mou || '');
      this.payload.pdf.mou = this.item.mou || '';

      // payload modal-confirm
      if (this.hasJobConfirmation) {
        this.payload.confirm.reviewSubmittedDate = moment(this.reviewSubmittedDate).format('D MMMM YYYY');
        this.item.job_confirmation.map((item) => {
          if (item.media_type == 'image') {
            this.payload.confirm.image.push(item);
          } else {
            this.payload.confirm.media.push(item);
          }
        });
      }

      // payload modal-participant
      this.payload.participant = this.$_deepClone(this.item);
      this.payload.participant.state =
        ['in_review', 'review_submitted'].indexOf(this.payload.participant.state) > -1
          ? ''
          : this.payload.participant.state;
    },
  },
};
</script>
