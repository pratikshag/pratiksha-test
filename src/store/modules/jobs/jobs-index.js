import Api from '@/api/Api';
import mixins from 'vuex-store/mixins';

const api = new Api({ name: 'MS_SOCO_ADMIN_API_URL' });

// initial state
const state = () => ({
  options: {
    job_type: [
      { text: 'Articles', value: 'articles' },
      { text: 'Videos', value: 'videos' },
      { text: 'Visual stories', value: 'visual_stories' },
      { text: 'Review', value: 'review' },
      { text: 'Event Attendance', value: 'event_attendance' },
      { text: 'Regular', value: 'regular' },
      { text: 'Other', value: 'other' },
    ],
    is_hijab: [
      { text: 'Hijab', value: true },
      { text: 'No Hijab', value: false },
      { text: 'All', value: 'all' },
    ],
    content: [
      { text: 'Skincare Enthusiast', value: 'skincare_enthusiast' },
      { text: 'Makeup Enthusiast', value: 'makeup_enthusiast' },
      { text: 'Lifestyle', value: 'lifestyle' },
      { text: 'Korean Beauty Enthusiast', value: 'korean_beauty_enthusiast' },
      { text: 'Travel', value: 'travel' },
      { text: 'Fasihon', value: 'fashion' },
      { text: 'Food Lover', value: 'food_lover' },
      { text: 'Health and Organic', value: 'health_and_organic' },
      { text: 'Kids and Mom', value: 'kids_and_mom' },
      { text: 'Other', value: 'other' },
    ],
    state: [
      { text: 'Inactive', value: 'in_active' },
      { text: 'Active', value: 'active' },
    ],
  },

  // user states
  states: [
    { text: 'In Review', value: 'in_review' },
    { text: 'MoU Approved', value: 'mou_approved' },
    { text: 'MoU Rejected', value: 'mou_rejected' },
    { text: 'Product Delivered', value: 'product_delivered' },
    { text: 'Review Submitted', value: 'review_submitted' },
    { text: 'Approved', value: 'approved' },
    { text: 'Rejected', value: 'rejected' },
  ],
});

const getters = {};

const actions = {
  getCount: (context, { filter }) =>
    api
      .getData({
        endpoint: '/sbn-jobs/count',
        params: { filter },
      })
      .then(({ data: { data } }) => data),

  getJobs: (context, payload) =>
    api
      .getData({
        endpoint: '/sbn-jobs',
        params: payload,
      })
      .then(({ data: { data } }) => data),

  getJobDetail: (context, { id = '', payload = {} } = {}) =>
    api
      .getData({
        endpoint: `/sbn-job/${id}`,
        params: payload,
      })
      .then(({ data: { data } }) => data),

  getJobParticipants: (context, { id = '', payload = {} } = {}) =>
    api
      .getData({
        endpoint: `/sbn-job/${id}/participants`,
        params: payload,
      })
      .then(({ data: { data } }) => data),

  createJob: (context, payload) =>
    api
      .postData({
        endpoint: '/sbn-job',
        payload,
      })
      .then(({ data: { data } }) => data),

  updateJob: (context, { id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/sbn-job/${id}`,
      payload,
    }),

  updateState: (context, { id = '', sbn_id = '', payload = {} } = {}) =>
    api.putData({
      endpoint: `/sbn-job/${id}/participant/${sbn_id}/state`,
      payload,
    }),

  deleteJob: (context, { id = '' }) =>
    api.deleteData({
      endpoint: `/sbn-job/${id}`,
    }),
};

const mutations = {
  ...mixins.mutations,
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
