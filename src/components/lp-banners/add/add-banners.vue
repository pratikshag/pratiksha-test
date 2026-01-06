<template>
  <div class="sc-form">
    <div class="sc-form-title">Banner</div>
    <ball-pulse-loader v-if="is_loading" class="banner-form__loader" color="#000000" size="20px"></ball-pulse-loader>

    <form id="formBanner" data-vv-scope="formBanner" class="sc-form-container">
      <div class="sc-form-group" :class="{ 'has-error': errors.has('formBanner.banner_name') }">
        <label class="sc-form-label" for="banner_name">Name</label>
        <input
          id="banner_name"
          v-model="banner.name"
          v-validate="'required'"
          class="sc-form-input"
          name="banner_name"
          type="text"
        />
        <p v-show="errors.has('formBanner.banner_name')" class="alert">
          {{ errors.first('formBanner.banner_name') }}
        </p>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="banner_url">Redirect URL</label>
        <input id="banner_url" v-model="banner.url" class="sc-form-input" name="banner_url" type="text" />
      </div>

      <div class="sc-form-group" :class="{ 'has-error': errors.has('formBanner.banner_type') }">
        <label class="sc-form-label" for="banner_type">Type</label>
        <select
          id="banner_type"
          v-model="banner.screen_type"
          v-validate="'required'"
          class="sc-form-input"
          name="banner_type"
        >
          <option value="">Pilih</option>
          <option value="mobile">Mobile Apps</option>
          <option value="desktop-web">Desktop Web</option>
          <option value="mobile-web">Mobile Web</option>
        </select>
        <p v-show="errors.has('formBanner.banner_type')" class="alert">
          {{ errors.first('formBanner.banner_type') }}
        </p>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="banner_status">Status</label>
        <select id="banner_status" v-model="banner.status" class="sc-form-input" name="banner_status" required>
          <option value="active">Active</option>
          <option value="inactive">Not Active</option>
        </select>
      </div>

      <div class="sc-form-group" :class="{ 'has-error': errors.has('formBanner.banner_image') }">
        <div class="image-selector" :class="{ 'image-selector_selected': !!banner.image }">
          <div class="image-selector__title">Upload AD image</div>
          <div v-if="banner.image" class="image-selector__image" @click.prevent="triggerUpload">
            <img :src="banner.image" />
          </div>
          <div v-else class="image-selector__image image-selector__image_placeholder" @click.prevent="triggerUpload">
            <img :src="require(`@/img/icon-upload-cover-image.png`)" />
            <p>
              Upload ad image
              <span class="required">*</span>
              <br />Recommended size 825 x 140 px (max. 5MB)
            </p>
          </div>
          <a v-if="banner.image" class="image-selector__trigger" @click.prevent="triggerUpload"
            >Click here to change cover image</a
          >
        </div>
        <input
          ref="banner_file_input"
          class="banner-form__file-input"
          type="file"
          accept="image/*"
          @change="onFileSelected($event)"
        />
        <input v-model="banner.image" v-validate="'required'" type="hidden" name="banner_image" />
        <p v-show="errors.has('formBanner.banner_image')" class="alert">
          {{ errors.first('formBanner.banner_image') }}
        </p>
      </div>
    </form>

    <div class="sc-form-group sc-mt-15">
      <button
        id="form_submit_btn"
        class="sc-btn sc-btn-md sc-btn-secondary sc-btn-rounded"
        type="submit"
        :disabled="is_loading"
        @click.prevent="onSubmit"
      >
        Submit
      </button>
    </div>
  </div>
</template>
<script src="./add-banners.js"></script>
<style src="./add-banners.scss" lang="scss" scoped></style>
