<template>
  <div class="sc-form">
    <div class="sc-form-title" v-text="context.heading"></div>

    <ball-pulse-loader v-if="loading.edit" color="#F083A6" size="10px" class="ml-2"></ball-pulse-loader>

    <form data-vv-scope="form-job" class="sc-form-container" @submit.prevent="onSubmit">
      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label" for="job-title">Job Title <span class="required">*</span></label>
        <input
          id="job-title"
          v-model="title"
          v-validate="'required'"
          name="title"
          type="text"
          class="sc-form-input"
          aria-describedby="jobTitle"
        />
        <small class="invalid-feedback" v-text="errors.first('form-job.title')"></small>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label" for="job-type">Job Type <span class="required">*</span></label>
        <multiselect
          id="job-type"
          v-model="job_type"
          :options="options.job_type"
          name="job-type"
          label="text"
          track-by="value"
          multiple
        ></multiselect>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Registration date</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-form-group sc-row-item">
            <label class="sc-form-label" for="category">From <span class="required">*</span></label>
            <input
              id="start-date"
              v-model="start_date"
              v-validate="'required'"
              name="start-date"
              type="date"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.start-date')"></small>
          </div>
          <div class="sc-form-group sc-row-item">
            <label class="sc-form-label" for="category">To <span class="required">*</span></label>
            <input
              id="end-date"
              v-model="end_date"
              v-validate="'required'"
              name="end-date"
              type="date"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.end-date')"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Publish and Report deadline <span class="required">*</span></label>
        <div class="sc-form-child-group">
          <input
            id="publish-date"
            v-model="publish_date"
            v-validate="'required'"
            name="publish-date"
            type="date"
            class="sc-form-input"
          />
          <small class="invalid-feedback" v-text="errors.first('form-job.publish-date')"></small>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Quota <span class="required">*</span></label>
        <div class="sc-form-child-group">
          <input
            id="total-quota"
            v-model="total_quota"
            v-validate="'required'"
            name="total-quota"
            type="number"
            class="sc-form-input"
          />
          <small class="invalid-feedback" v-text="errors.first('form-job.total-quota')"></small>
        </div>
      </div>

      <!--
            <div class="sc-form-group sc-form-group-half">
                <label class="col-md-3 custom-label">Available Quota <span class="required">*</span></label>
                <div class="sc-form-child-group">
                    <input
                        v-model="total_quota_available"
                        v-validate="'required'"
                        id="total-quota-available"
                        name="total-quota-available"
                        type="number"
                        class="sc-form-input">
                    <small
                        class="invalid-feedback"
                        v-text="errors.first('form-job.total-quota-available')"></small>
                </div>
            </div>
            -->

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Rewards <span class="required">*</span></label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div v-for="(item, index) in ['first-reward', 'second-reward']" :key="index" class="sc-row-item">
            <input
              v-model="info.rewards[index]"
              v-validate="index > 0 ? '' : 'required'"
              :name="item"
              type="text"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.' + item)"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-title-section">Eligible participant</div>

      <div class="sc-form-group sc-form-group-half">
        <div class="sc-form-child-group">
          <label class="sc-form-label" for="hijab">Hijab</label>
          <select
            id="criteria-is-hijab"
            v-model="criteria.is_hijab"
            v-validate="'required'"
            name="criteria-is-hijab"
            class="sc-form-input"
          >
            <option
              v-for="(item, index) in options.is_hijab"
              :key="index"
              :value="item.value"
              v-text="item.text"
            ></option>
          </select>
          <small class="invalid-feedback" v-text="errors.first('form-job.criteria-is-hijab')"></small>
        </div>

        <div class="sc-form-child-group">
          <label class="sc-form-label" for="content">Content Category <span class="required">*</span></label>
          <multiselect
            id="criteria-content"
            v-model="selected.content"
            :options="options.content"
            name="criteria-content"
            label="text"
            track-by="value"
            multiple
          ></multiselect>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Instagram folllower</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-row-item">
            <label class="sc-form-label" for="category">From</label>
            <input
              id="instagram-follower-from"
              v-model="criteria.insta_followers.min"
              v-validate="'required'"
              name="instagram-follower-from"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.instagram-follower-from')"></small>
          </div>

          <div class="sc-row-item">
            <label class="sc-form-label" for="category">To</label>
            <input
              id="instagram-follower-to"
              v-model="criteria.insta_followers.max"
              v-validate="'required'"
              name="instagram-follower-to"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.instagram-follower-to')"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Tiktok folllower</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-row-item">
            <label class="sc-form-label" for="category">From</label>
            <input
              id="tiktok-follower-from"
              v-model="criteria.tiktok_followers.min"
              v-validate="'required'"
              name="tiktok-follower-from"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.tiktok-follower-from')"></small>
          </div>

          <div class="sc-row-item">
            <label class="sc-form-label" for="category">To</label>
            <input
              id="tiktok-follower-to"
              v-model="criteria.tiktok_followers.max"
              v-validate="'required'"
              name="tiktok-follower-to"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.tiktok-follower-to')"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Monthly page views</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-row-item">
            <label class="sc-form-label" for="category">From</label>
            <input
              id="page-view-from"
              v-model="criteria.monthly_page_views.min"
              v-validate="'required'"
              name="page-view-from"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.page-view-from')"></small>
          </div>

          <div class="sc-row-item">
            <label class="sc-form-label" for="category">To</label>
            <input
              id="page-view-to"
              v-model="criteria.monthly_page_views.max"
              v-validate="'required'"
              name="page-view-to"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.page-view-to')"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Youtube Subscriber</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-row-item">
            <label class="sc-form-label" for="category">From</label>
            <input
              id="youtube-subscriber-from"
              v-model="criteria.youtube_subscribers.min"
              v-validate="'required'"
              name="youtube-subscriber-from"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.youtube-subscriber-from')"></small>
          </div>

          <div class="sc-row-item">
            <label class="sc-form-label" for="category">To</label>
            <input
              id="youtube-subscriber-to"
              v-model="criteria.youtube_subscribers.max"
              v-validate="'required'"
              name="youtube-subscriber-to"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.youtube-subscriber-to')"></small>
          </div>
        </div>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label">Age</label>
        <div class="sc-form-group sc-form-group-full sc-row">
          <div class="sc-row-item">
            <label class="sc-form-label" for="category">From</label>
            <input
              id="age-from"
              v-model="criteria.age.min"
              v-validate="'required'"
              name="age-from"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.age-from')"></small>
          </div>

          <div class="sc-row-item">
            <label class="sc-form-label" for="category">To</label>
            <input
              id="age-to"
              v-model="criteria.age.max"
              v-validate="'required'"
              name="age-to"
              type="number"
              class="sc-form-input"
            />
            <small class="invalid-feedback" v-text="errors.first('form-job.age-to')"></small>
          </div>
        </div>
      </div>

      <TextEditor
        v-for="item in editors"
        :id="item.key"
        :key="item.key"
        v-model="info[item.key]"
        :label="item.label"
        class="sc-form-group sc-form-group-half"
      />

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label" for="job-mou">Upload MoU <span class="required">*</span></label>

        <p v-if="info.mou">
          {{ info.mou }}
          <a href="javascript:" class="btn btn-sm btn-primary" title="Download MoU" @click="$_forceDownload(infoMou)"
            ><span class="fa fa-download"></span
          ></a>
          <a href="javascript:" class="btn btn-sm btn-danger mx-2" title="Remove MoU" @click="info.mou = ''"
            ><span class="fa fa-close"></span
          ></a>
        </p>

        <input
          v-else
          id="job-mou"
          ref="file-mou"
          v-validate="'required'"
          name="mou"
          type="file"
          class="sc-form-input"
          accept="application/pdf"
          aria-describedby="jobMou"
          @change="onMouChange"
        />
        <small class="invalid-feedback" v-text="errors.first('form-job.mou')"></small>
      </div>

      <hr class="col-md-6" />

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label" for="job-banner">Job banner (825x285) px</label>

        <croppa
          v-model="croppa"
          :disabled="isDisabled"
          :file-size-limit="5242880"
          :disable-scroll-to-zoom="false"
          prevent-white-space
          :remove-button-size="30"
          :input-attrs="attrs"
          :width="825"
          :height="285"
          :quality="1"
          accept="image/jpg,image/jpeg,image/png"
          remove-button-color="#f780a7"
          placeholder="Click here to upload an image."
          initial-size="contain"
          @file-choose="onFileChoose"
          @image-remove="onImageRemove"
        >
          <img slot="initial" :src="cover.url" />
        </croppa>
        <small id="job-banner" class="form-text text-muted"></small>
      </div>

      <div class="sc-form-group sc-form-group-half">
        <label class="sc-form-label" for="active">Job status</label>
        <select id="state" v-model="selected.state" name="state" class="sc-form-input">
          <option v-for="(item, index) in options.state" :key="index" :value="item.value" v-text="item.text"></option>
        </select>
      </div>

      <!-- <pre v-text="payload"></pre> -->

      <div class="sc-form-group sc-mt-15">
        <div>
          <button
            v-for="(item, index) in buttons.submit"
            :key="index"
            :class="item.btnClass"
            :disabled="loading.submit"
            type="submit"
            v-text="item.text"
          ></button>
          <ball-pulse-loader v-if="loading.submit" color="#F083A6" size="10px" class="pt-2 pl-2"></ball-pulse-loader>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Croppa from 'vue-croppa';
import Multiselect from 'vue-multiselect';
import TextEditor from 'components/forms/editor/TextEditor';

const errorCode = {
  SLUG_ALREADY_EXISTS: 'Slug already exists',
};

export default {
  name: 'sbn-jobs-form',

  components: {
    croppa: Croppa.component,
    Multiselect,
    TextEditor,
  },

  props: {
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      title: '',
      job_type: [],
      start_date: '',
      end_date: '',
      publish_date: '',
      tag_used: '',
      total_quota: 0,
      // total_quota_available: 0,
      // total_participants: 0,
      criteria: {
        is_hijab: false,
        content: [],
        insta_followers: { min: 0, max: 0 },
        tiktok_followers: { min: 0, max: 0 },
        monthly_page_views: { min: 0, max: 0 },
        youtube_subscribers: { min: 0, max: 0 },
        age: { min: 0, max: 0 },
      },
      info: {
        description: '',
        requirement: '',
        how_to_join: '',
        mou: '',
        mou_tnc: '',
        hashtags: [],
        phototags: [],
        rewards: Array(2),
      },
      cover: { url: '' },
      state: '',
      //
      croppa: {},
      filename: '',
      mou_name: '',
      selected: {
        is_hijab: false,
        content: [],
        state: 'in_active',
      },
      editors: [
        {
          label: 'About Job',
          key: 'description',
        },
        {
          label: 'Requirement',
          key: 'requirement',
        },
        {
          label: 'How to join',
          key: 'how_to_join',
        },
        {
          label: 'MoU between SBN and Sociolla',
          key: 'mou_tnc',
        },
      ],
      // params: {},
      attrs: {
        id: 'job-banner',
        'aria-describedby': 'job-banner',
      },
      loading: {
        edit: false,
        submit: false,
      },
    };
  },

  computed: {
    ...mapState('jobs', ['options']),

    isEdit() {
      return this.id != '';
    },

    infoMou() {
      const url = this.info.mou;
      const { name } = this.$_file(url);

      return { url, name };
    },

    payload() {
      return {
        title: this.title,
        job_type: this.job_type,
        start_date: this.start_date,
        end_date: this.end_date,
        publish_date: this.publish_date,
        tag_used: this.tag_used,
        total_quota: this.total_quota,
        total_quota_available: this.total_quota,
        // total_participants: this.total_participants,
        criteria: this.criteria,
        info: this.info,
        cover: this.cover,
        state: this.selected.state,
      };
    },

    isDisabled() {
      return this.cover.url ? !/data:image/.test(this.cover.url) : false;
    },

    heading() {
      return this.isEdit ? 'Edit Job' : 'Create New Job';
    },

    context() {
      return this.isEdit
        ? {
            heading: 'Edit Job',
            submit: 'Update Job',
          }
        : {
            heading: 'Add Job',
            submit: 'Create Job',
          };
    },

    buttons() {
      return {
        submit: [
          {
            text: 'Submit',
            btnClass: 'sc-btn sc-btn-lg sc-btn-rounded sc-btn-primary sc-uppercase',
          },
        ],
      };
    },
  },

  watch: {
    'selected.content'(newValue) {
      this.criteria.content = newValue.map(({ value }) => value);
    },
  },

  created() {
    this.init();
  },

  methods: {
    ...mapActions('jobs', ['getJobs', 'createJob', 'updateJob']),

    init() {
      if (this.isEdit) {
        this.loading.edit = true;

        this.getJobs({
          filter: { _id: this.id },
        })
          .then(([edit]) => {
            this.title = edit.title;
            this.job_type =
              typeof edit.job_type == 'string' ? [] : edit.job_type.map(({ text, value }) => ({ text, value }));
            (this.start_date = moment(edit.start_date).tz('Asia/Jakarta').format('YYYY-MM-DD')),
              (this.end_date = moment(edit.end_date).tz('Asia/Jakarta').format('YYYY-MM-DD')),
              (this.publish_date = moment(edit.publish_date).tz('Asia/Jakarta').format('YYYY-MM-DD')),
              (this.total_quota = edit.total_quota || this.total_quota);
            // this.total_quota_available = edit.total_quota_available || this.total_quota_available
            this.criteria = edit.criteria || this.criteria;
            this.selected.content =
              typeof this.criteria.content == 'string' // hit watcher
                ? []
                : this.options.content.filter(({ value }) => this.criteria.content.indexOf(value) > -1);
            this.info.description = edit.info.description || this.info.description;
            this.info.requirement = edit.info.requirement || this.info.requirement;
            this.info.how_to_join = edit.info.how_to_join || this.info.how_to_join;
            this.info.mou = edit.info.mou || this.info.mou;
            this.info.mou_tnc = edit.info.mou_tnc || this.info.mou_tnc;
            this.info.rewards = edit.info.rewards || this.info.rewards;
            this.cover = edit.cover;
            this.selected.state = edit.state;
            //
            this.loading.edit = false;
          })
          .catch(
            ({
              response: {
                data: { data },
              },
            }) =>
              this.response({
                message: `${data.statusCode}: ${data.errorCode}`,
              })
          );
      }
    },

    onFileChoose(file) {
      this.filename = Math.ceil(Math.random() * 1000) + '-' + file.name.replace(/ /g, '-').replace(/('|\(|\))/g, '');
    },

    onImageRemove() {
      this.filename = '';
      if (this.isEdit) {
        this.cover.url = '';
      }
      this.croppa.refresh(); // unlink s3 initial image due cors issue
    },

    uploadImage() {
      if (this.croppa.hasImage()) {
        if (this.isDisabled) {
          return Promise.resolve(true);
        } else {
          return this.croppa
            .promisedBlob()
            .then((blob) =>
              this.$store.dispatch('files/putFile', {
                filename: this.filename,
                blob,
              })
            )
            .then(({ url }) => (this.payload.cover.url = url));
        }
      } else {
        return Promise.resolve(false);
      }
    },

    onMouChange(e) {
      const file = e.target.files[0];

      if (file) {
        this.mou_name = Math.ceil(Math.random() * 1000) + '-' + file.name.replace(/ /g, '-').replace(/('|\(|\))/g, '');
      }
    },

    uploadMou() {
      const file = this.$refs['file-mou'];

      if (file) {
        return this.$store
          .dispatch('files/putFile', {
            filename: this.mou_name,
            blob: file.files[0],
          })
          .then(({ url }) => (this.info.mou = url));
      }

      return Promise.resolve({});
    },

    onSubmit(e) {
      this.$validator.validate().then(async (valid) => {
        if (valid) {
          this.loading.submit = true;

          if (this.job_type.length < 1) {
            return this.response({ message: 'Job type is required' });
          }

          if (this.criteria.content < 1) {
            return this.response({ message: 'Content category is required' });
          }

          if (!(await this.uploadImage())) {
            return this.response({ message: 'Job banner is required' });
          }

          await this.uploadMou();

          if (this.isEdit) {
            this.updateJob({
              id: this.id,
              payload: this.payload,
            })
              .then(() =>
                this.response({
                  to: { name: 'sbn-jobs' },
                  message: `Job "${this.payload.title}" was successfully updated!`,
                })
              )
              .catch(
                ({
                  response: {
                    data: { data },
                  },
                }) =>
                  this.response({
                    message: `${data.statusCode}: ${data.errorCode}`,
                  })
              );
          } else {
            this.createJob(this.payload)
              .then(() =>
                this.response({
                  to: { name: 'sbn-jobs' },
                  message: `Job "${this.payload.title}" was successfully created!`,
                })
              )
              .catch(
                ({
                  response: {
                    data: { data },
                  },
                }) =>
                  this.response({
                    message: errorCode[data.errorCode],
                  })
              );
          }
        } else {
          this.response({
            message: this.errors.items[0].msg,
          });
        }
      });
    },

    response({ to = false, message = '' } = {}) {
      if (to) {
        this.croppa.refresh(); // fix undefined value from croppa
        this.$router.push(to, () => this.$toasted.global.show(message, { icon: 'check' }));
      } else {
        this.$toasted.global.error(message, { icon: 'warning' });
        this.loading.edit = false;
        this.loading.submit = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/sbn-jobs-form';
</style>
