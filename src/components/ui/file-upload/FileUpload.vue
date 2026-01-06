<template>
  <div class="file-upload-page">
    <div class="row">
      <div class="col-md-12">
        <vuestic-widget :header-text="$t('fileUpload.advancedMediaGallery')">
          <vuestic-file-upload
            v-model="advancedGallery"
            type="gallery"
            :file-types="'.png, .jpg, .jpeg, .gif'"
            dropzone
          />
        </vuestic-widget>
      </div>

      <div class="col-md-12">
        <vuestic-widget :header-text="$t('fileUpload.advancedUploadList')">
          <vuestic-file-upload v-model="advancedList" dropzone />
        </vuestic-widget>
      </div>

      <div class="col-md-12">
        <vuestic-widget :header-text="$t('fileUpload.single')">
          <vuestic-file-upload v-model="single" type="single" />
        </vuestic-widget>
      </div>

      <div class="col-md-12">
        <vuestic-widget :header-text="$t('fileUpload.mediaGallery')">
          <vuestic-file-upload v-model="gallery" type="gallery" :file-types="'.png, .jpg, .jpeg, .gif'" />
        </vuestic-widget>
      </div>

      <div class="col-md-12">
        <vuestic-widget :header-text="$t('fileUpload.uploadList')">
          <vuestic-file-upload v-model="list" />
        </vuestic-widget>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'file-upload',
  data() {
    return {
      advancedGallery: [],
      advancedList: [],
      single: [],
      gallery: [],
      list: [],
    };
  },
};
</script>
