<template>
  <modalv2 class="custom-modal modal-mask modal--edit-translation">
    <div slot="body">
      <div class="modal-header">
        <button type="button" class="close" aria-label="Close">
          <img src="/assets/img/icon-close-white.svg" alt="icon-close-modal" @click.prevent="closeModal" />
        </button>
        <span class="modal-heading">Edit Translation</span>
      </div>
      <div class="product-preview">
        <form class="sc-form" @submit.prevent="handleSubmit">
          <div class="sc-form-container sc-form-center">
            <div class="sc-form-group">
              <label class="sc-form-label" for="source_language">Source Language</label>
              <input
                id="source_language"
                v-model="form.sourceLanguage"
                class="sc-form-input"
                name="source_language"
                type="text"
                placeholder=""
                required
              />
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="vietnamese_translation">Vietnamese Translation</label>
              <div class="textarea-container">
                <textarea
                  id="vietnamese_translation"
                  v-model="form.vietnameseTranslation"
                  class="sc-form-input"
                  name="vietnamese_translation"
                  required
                ></textarea>
                <span class="text-helped-counter" :class="{ passed: form.vietnameseTranslation.length >= 150 }">
                  {{ form.vietnameseTranslation.length }} / <b>150</b>
                </span>
                <span
                  v-if="form.vietnameseTranslation && form.vietnameseTranslation.length < 150"
                  class="error-message"
                >
                  Vietnamese Translation must be at least 150 characters.
                </span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="create-review-text">
              <button type="submit" class="btn btn-red" :disabled="!isFormValid">SUBMIT</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </modalv2>
</template>

<script>
import modalv2 from '../../ui/global/modal';
import axios from 'axios';
const Config = require('../../../../config/default.env');

export default {
  name: 'ModalEditTranslation',
  components: { modalv2 },
  props: {
    id: {
      type: String,
      required: true,
    },
    sourceLanguage: {
      type: String,
      default: '',
    },
    vietnameseTranslation: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      form: {
        sourceLanguage: this.sourceLanguage || '',
        vietnameseTranslation: this.vietnameseTranslation || '',
      },
    };
  },
  computed: {
    isFormValid() {
      return this.form.sourceLanguage && this.form.vietnameseTranslation.length >= 150;
    },
  },
  watch: {
    sourceLanguage(newVal) {
      this.form.sourceLanguage = newVal || '';
    },
    vietnameseTranslation(newVal) {
      this.form.vietnameseTranslation = newVal || '';
    },
  },
  methods: {
    handleSubmit() {
      if (this.isFormValid) {
        const sourceLanguage = this.form.sourceLanguage.trim().toLowerCase();
        const payload = {
          textToTranslate: this.form.vietnameseTranslation,
          sourceLanguage: sourceLanguage,
        };
        axios
          .put(Config.default.MS_SOCO_ADMIN_API_URL + `/newsfeeds/${this.id}/translate`, payload)
          .then((response) => {
            this.closeModal();
          })
          .catch((error) => {
            console.error('Error translating newsfeed:', error);
          });
      }
    },
    closeModal() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/modal-edit-translation';
</style>
