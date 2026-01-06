<template>
  <div class="sbn-jobs">
    <router-link :to="{ name: 'sbn-jobs' }" class="sc-btn sc-btn-rounded sc-btn-primary sc-btn-md sc-mb-15">
      <span class="fa fa-arrow-left"></span> back
    </router-link>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="float-right mt-2"></ball-pulse-loader>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <colgroup>
          <col style="width: 25%" />
        </colgroup>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Level</th>
            <th>Email</th>
            <th>MoU</th>
            <th>State</th>
            <th>Confirmation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!loading && !(participants && participants.length)" :cols="8" />

          <TableRowParticipants v-for="item in participants" :key="item._id" :item="item" @show-modal="onShowModal" />
        </tbody>
      </table>
    </div>

    <!-- modal pdf -->
    <vuestic-modal
      ref="modal-pdf"
      cancel-class="btn btn-outline"
      ok-class="btn btn-danger"
      ok-text="Download MoU"
      large
      @ok="onDownload"
      @cancel="onCancel"
    >
      <template #title>{{ context.title }}</template>

      <pdf v-if="filetypes.pdf" :src="payload.mou"></pdf>

      <img v-else-if="filetypes.images" :src="payload.mou" class="img-fluid mx-auto d-block" :alt="payload.file.name" />
    </vuestic-modal>

    <!-- modal confirm -->
    <vuestic-modal ref="modal-confirm" cancel-class="btn btn-outline" no-buttons @cancel="onCancel">
      <template #title>Confirmation Detail</template>

      <table v-if="ref == 'modal-confirm'" class="table table-striped">
        <colgroup>
          <col style="width: 40%" />
          <col style="width: 60%" />
        </colgroup>
        <tbody>
          <tr>
            <th>Campaign Name</th>
            <td v-text="job.title"></td>
          </tr>
          <tr>
            <th>Submitted Date</th>
            <td v-text="payload.reviewSubmittedDate"></td>
          </tr>
          <tr>
            <th>Media</th>
            <td v-if="payload.media.length">
              <ul class="list-unstyled my-0">
                <li v-for="(item, index) in payload.media" :key="index">
                  <a :href="item.url" target="_blank">
                    {{ item.media_type }}
                    <span class="fa fa-external-link"></span>
                  </a>
                </li>
              </ul>
            </td>
            <td v-else>-</td>
          </tr>
          <tr>
            <th>Images</th>
            <td v-if="payload.image.length">
              <ul class="list-inline my-0">
                <li v-for="(item, index) in payload.image" :key="index" class="list-inline-item mb-2">
                  <a v-if="item.url" :href="item.url" target="_blank">
                    <img :src="item.url" class="img-thumbnail" :alt="item.media_type" width="50" />
                  </a>
                </li>
              </ul>
            </td>
            <td v-else>-</td>
          </tr>
        </tbody>
      </table>
    </vuestic-modal>

    <!-- modal participant -->
    <vuestic-modal
      ref="modal-participant"
      cancel-class="sc-btn sc-btn-md sc-btn-rounded sc-mb-20"
      ok-class="sc-btn sc-btn-md sc-btn-rounded sc-btn-danger sc-mb-20"
      ok-text="Update State"
      :ok-disabled="!payload.state"
      @ok="onOk"
      @cancel="onCancel"
    >
      <template #title>Participant Detail</template>

      <table v-if="ref == 'modal-participant'" class="table table-striped">
        <tbody>
          <tr>
            <th scope="row">Name</th>
            <td v-text="payload.user.name"></td>
          </tr>
          <tr>
            <th scope="row">Username</th>
            <td v-text="payload.user.user_name"></td>
          </tr>
          <tr>
            <th scope="row">Level</th>
            <td v-text="payload.user.user_level"></td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td v-text="maskEmail(payload.user.email)"></td>
          </tr>
          <tr>
            <th scope="row">State</th>
            <td>
              <select v-model="payload.state" class="form-control">
                <option value="">Choose state</option>
                <option v-for="(item, index) in states" :key="index" :value="item.value" v-text="item.text"></option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </vuestic-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import pdf from 'vue-pdf';
import TableRowParticipants from 'components/sbn/jobs/partial/TableRowParticipants';

export default {
  name: 'sbn-jobs-participants',

  components: {
    pdf,
    TableRowParticipants,
  },

  props: {
    id: {
      type: String,
      default: '',
    },
  },

  // mixins: [],

  data() {
    return {
      participants: [],
      job: {},
      payload: {},
      ref: '',
      //
      loading: false,
    };
  },

  computed: {
    filetypes() {
      if (this.ref == 'modal-pdf') {
        const { type } = this.payload.file;

        return {
          pdf: ['pdf'].indexOf(type) > -1,
          images: ['jpg', 'jpeg', 'png'].indexOf(type) > -1,
        };
      } else {
        return false;
      }
    },

    states() {
      // exclude in_review and review_submitted as this states require action from the participant
      return this.$store.state.jobs.states.filter(({ value }) => ['in_review', 'review_submitted'].indexOf(value) < 0);
    },

    context() {
      return {
        title: this.filetypes.pdf ? 'View PDF' : 'View Image',
      };
    },
  },

  watch: {
    $route: 'init',
  },

  created() {
    this.init();
  },

  methods: {
    ...mapActions('jobs', ['getJobParticipants', 'getJobDetail', 'updateState']),

    init() {
      this.loading = true;

      this.getJobParticipants({
        id: this.id,
      })
        .then((data) => {
          this.participants = data;
          return this.getJobDetail({
            id: this.id,
            payload: { fields: 'title' },
          });
        })
        .then(([title]) => {
          this.job = title;
          this.loading = false;
        });
    },

    onShowModal({ payload, ref }) {
      this.payload = payload;
      this.ref = ref;
      this.$refs[ref].open();
    },

    onDownload() {
      const {
        mou: url,
        file: { name },
      } = this.payload;

      this.$_forceDownload({ url, name }).catch((err) => {
        console.log(err);
        window.open(url, '_blank');
        // this.$toasted.global.error(e, {icon: 'warning'})
      });
    },

    onOk() {
      this.updateState({
        id: this.id,
        sbn_id: this.payload.user.sbn_id,
        payload: {
          state: this.payload.state,
        },
      })
        .then(() => {
          this.init();
          this.$toasted.global.show('State update successful', { icon: 'check' });
        })
        .catch(console.log);
    },

    onCancel() {
      this.payload = {};
      this.ref = '';
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/sbn-jobs';

.vuestic-modal {
  table {
    > tbody {
      > tr {
        > th,
        > td {
          font-size: initial;
        }
      }
    }
  }
}
</style>
