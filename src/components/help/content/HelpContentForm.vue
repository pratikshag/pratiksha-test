<template>
  <div class="sc-form">
    <div class="sc-form-title" v-text="context.heading"></div>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="ml-2"></ball-pulse-loader>

    <form data-vv-scope="form-post" class="sc-form-container" @submit.prevent="onSubmit">
      <div class="sc-form-group">
        <label class="sc-form-label" for="country">Country</label>
        <select id="country" v-model="created_from" name="country" class="sc-form-input">
          <option v-for="{ text, value } in options.created_from" :key="value" :value="value" v-text="text"></option>
        </select>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="platform">Platform</label>
        <select id="platform" v-model="platform" v-validate="'required'" name="platform" class="sc-form-input">
          <option value="soco">SOCO</option>
          <option value="lilla">Lilla</option>
        </select>
        <small class="invalid-feedback" v-text="errors.first('form-post.platform')"></small>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="position">Position</label>
        <input
          id="position"
          v-model="position"
          v-validate="'required'"
          name="position"
          type="number"
          class="sc-form-input"
          aria-describedby="position"
        />
        <small class="invalid-feedback" v-text="errors.first('form-post.position')"></small>
      </div>

      <div class="sc-form-group sc-row">
        <div class="sc-form-group sc-form-group-full sc-row-item">
          <label class="sc-form-label" for="category">Select Category <span class="required">*</span></label>
          <select id="category" v-model="category" v-validate="'required'" name="category" class="sc-form-input">
            <option v-for="item in options.category" :key="item.id" :value="item.id" v-text="item.name"></option>
          </select>
          <small class="invalid-feedback" v-text="errors.first('form-post.category')"></small>
        </div>

        <div class="sc-form-group sc-form-group-full sc-row-item">
          <label class="sc-form-label" for="subcategory">Sub Category <span class="required">*</span></label>
          <select
            id="subcategory"
            v-model="subcategory"
            v-validate="'required'"
            :disabled="!hasSubcategory"
            name="subcategory"
            class="sc-form-input"
          >
            <option v-for="item in options.subcategory" :key="item.id" :value="item.id" v-text="item.name"></option>
          </select>
          <small class="invalid-feedback" v-text="errors.first('form-post.subcategory')"></small>
        </div>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="content-title">Content Title <span class="required">*</span></label>
        <input
          id="content-title"
          v-model="title"
          v-validate="'required'"
          name="title"
          type="text"
          class="sc-form-input"
          aria-describedby="contentTitle"
        />
        <small class="invalid-feedback" v-text="errors.first('form-post.title')"></small>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="content-slug">Slug <span class="required">*</span></label>
        <input
          id="content-slug"
          v-model="$slugify"
          v-validate="'required'"
          name="slug"
          type="text"
          class="sc-form-input"
          aria-describedby="contentSlug"
        />
        <small class="invalid-feedback" v-text="errors.first('form-post.slug')"></small>
        <small id="contentSlug" class="form-text text-muted"
          >The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters,
          numbers, and hyphens.</small
        >
      </div>
      <div class="sc-form-group sc-form-group-full">
        <label class="sc-form-label" for="content">Description <span class="required">*</span></label>
        <div v-if="isVueEditorLoaded" class="editor-wrapper">
          <vue-editor
            ref="editor"
            v-model="content"
            :editor-options="editorOptions"
            use-custom-image-handler
            @image-added="handleImageAdded"
          ></vue-editor>
        </div>
        <div v-else class="editor-fallback">
          <textarea
            v-model="content"
            class="sc-form-input"
            rows="10"
            placeholder="Enter content description..."
            style="min-height: 200px; resize: vertical"
          ></textarea>
        </div>
        <small v-show="!content && errors.has('form-post.content')" class="invalid-feedback"
          >Description is required</small
        >
      </div>

      <!-- VERSIONS -->
      <div class="sc-form-group sc-form-group-full">
        <div v-for="item in editors" :key="item.key" class="editor-container">
          <label class="sc-form-label" :for="item.key">{{ item.label }}</label>
          <div v-if="isVueEditorLoaded" class="editor-wrapper">
            <vue-editor
              :id="item.key"
              v-model="version[item.key]"
              :editor-toolbar="customToolbar"
              style="flex: 1; min-height: 150px"
              use-custom-image-handler
              :editor-options="{
                theme: 'snow',
                placeholder: `Enter ${item.label.toLowerCase()}...`,
              }"
              @image-added="handleImageAdded"
            ></vue-editor>
          </div>
          <div v-else class="editor-fallback">
            <textarea
              :id="item.key"
              v-model="version[item.key]"
              class="sc-form-input"
              rows="6"
              :placeholder="`Enter ${item.label.toLowerCase()}...`"
              style="min-height: 150px; resize: vertical"
            ></textarea>
          </div>
        </div>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="active">Active</label>
        <select id="active" v-model="selected.active" name="active" class="sc-form-input">
          <option v-for="(item, index) in options.active" :key="index" :value="item.value" v-text="item.text"></option>
        </select>
      </div>

      <div class="sc-form-group sc-mt-15">
        <div>
          <button
            v-for="(item, index) in buttons.submit"
            :key="index"
            :value="item.status"
            :class="item.btnClass"
            :disabled="loading"
            type="submit"
            v-text="item.text"
          ></button>
          <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="pt-2 pl-2"></ball-pulse-loader>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const config = require('../../../../config/default.env').default;
import axios from 'axios';
import { VueEditor } from 'vue2-editor';

const errorCode = {
  SLUG_ALREADY_EXISTS: 'Slug already exists',
};

export default {
  name: 'help-content-form',
  components: {
    VueEditor,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      created_from: 'sociolla',
      title: '',
      slug: '',
      content: '',
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
      ],
      editorOptions: {
        theme: 'snow',
        placeholder: 'Enter content description...',
        modules: {
          toolbar: this.customToolbar,
        },
      },
      state: {
        isProcess: false,
      },
      uploadEditor: {
        fileBaseString64: '',
        fileName: '',
        Editor: null,
        cursorLocation: null,
        resetUploader: function () {
          this.fileBaseString64 = '';
          this.fileName = '';
        },
      },
      version: {
        desktop: '',
        mobile: '',
        app: '',
      },
      status: '',
      owner: {},
      position: 1,
      platform: '',
      //
      selected: {
        category: { id: '', name: '', slug: '', sub_categories: [] },
        subcategory: { id: '', name: '', slug: '' },
        active: false,
      },
      options: {
        created_from: [
          { text: 'Indonesia', value: 'sociolla' },
          { text: 'Vietnam', value: 'sociolla_vn' },
        ],
        category: [],
        subcategory: [],
        active: [
          { text: 'Disabled', value: false },
          { text: 'Enabled', value: true },
        ],
      },
      editors: [
        {
          label: 'Desktop Version',
          key: 'desktop',
        },
        {
          label: 'Mobile Version',
          key: 'mobile',
        },
        {
          label: 'Apps Version',
          key: 'app',
        },
      ],
      loading: false,
      isVueEditorLoaded: true,
    };
  },

  computed: {
    isEdit() {
      return this.id != '';
    },

    params() {
      const result = {
        filter: {
          type: 'help_page_article',
          created_from: this.created_from,
        },
        fields: 'id name slug sub_categories',
        limit: 20,
      };

      if (this.platform) {
        result.filter.platform = this.platform;
      } else if (!this.platform && result.filter.platform) {
        delete result.filter.platform;
      }

      return result;
    },

    $slugify: {
      get() {
        return this.slug;
      },
      set(value) {
        this.slug = this.slugify(value);
      },
    },

    category: {
      get() {
        return this.selected.category.id;
      },
      set(value) {
        if (this.selected.subcategory.id) {
          this.selected.subcategory = this.$options.data().selected.subcategory; // reset
        }

        const { id, name, slug } = this.options.category.find(({ id }) => id == value);
        this.selected.category = { id, name, slug };
      },
    },

    subcategory: {
      get() {
        return this.selected.subcategory.id;
      },
      set(value) {
        this.selected.subcategory = this.options.subcategory.find(({ id }) => id == value);
      },
    },

    hasSubcategory() {
      return this.options.subcategory.length > 0;
    },

    payload() {
      return {
        created_from: this.created_from,
        category: this.selected.category,
        ...(this.selected.subcategory.id
          ? {
              subcategory: this.selected.subcategory,
            }
          : false),
        title: this.title,
        slug: this.slug,
        content: this.content,
        desktop_version: this.$options.filters.stripHTML(this.version.desktop),
        mobile_version: this.$options.filters.stripHTML(this.version.mobile),
        app_version: this.$options.filters.stripHTML(this.version.app),
        status: this.status,
        is_active: this.selected.active, // SOC-45157
        owner: this.owner,
        [this.position_key]: this.position,
        platform: this.platform,
        post_type: 'help_page_article',
      };
    },

    heading() {
      return this.isEdit ? 'Edit Content' : 'Add New Content';
    },

    context() {
      return this.isEdit
        ? {
            heading: 'Edit Content',
            submit: 'Update Content',
          }
        : {
            heading: 'Add Content',
            submit: 'Create Content',
          };
    },

    buttons() {
      return {
        submit: [
          {
            text: this.isEdit ? 'Update as Draft' : 'Save as Draft',
            status: 'draft',
            btnClass: 'sc-btn sc-btn-rounded sc-btn-md sc-uppercase sc-btn-secondary sc-mr-10',
          },
          {
            text: 'Publish',
            status: 'publish',
            btnClass: 'sc-btn sc-btn-rounded sc-btn-md sc-uppercase sc-btn-primary',
          },
        ],
      };
    },
    position_key() {
      return this.created_from == 'sociolla_vn' ? 'position_vn' : 'position';
    },
  },

  watch: {
    async created_from(newValue) {
      if (newValue) {
        this.loading = true;

        await this.getHelpCategories().then((data) => (this.options.category = data));

        this.loading = false;
      }
    },

    'selected.category.id'(newValue) {
      if (newValue) {
        // re-populate subcategory options
        this.options.subcategory =
          this.options.category.find(({ id }) => id == newValue)?.sub_categories || this.options.subcategory;
      }
    },

    title(newValue, oldValue) {
      // skip first
      if (oldValue) {
        this.$slugify = this.slugify(newValue);
      }
    },

    async platform(newVal, oldVal) {
      if (oldVal != newVal) {
        this.loading = true;

        await this.getHelpCategories().then((data) => (this.options.category = data));

        this.loading = false;
      }
    },
  },
  mounted() {
    if (this.$refs.editor && this.$refs.editor.quill) {
      const editor = this.$refs.editor.quill;

      editor.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

        const ops = [];
        delta.ops.forEach((op) => {
          if (typeof op.insert === 'string') {
            const parts = op.insert.split(/(https?:\/\/[^\s]+|\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)/gi);

            parts.forEach((part) => {
              if (urlRegex.test(part)) {
                ops.push({ insert: part, attributes: { link: part } });
              } else if (emailRegex.test(part)) {
                ops.push({ insert: part, attributes: { link: `mailto:${part}` } });
              } else {
                ops.push({ insert: part });
              }
            });
          } else {
            ops.push(op);
          }
        });
        delta.ops = ops;
        return delta;
      });
    }
  },

  created() {
    this.init();
  },

  methods: {
    ...mapActions('categories', ['getCategories']),
    ...mapActions('posts', ['getPosts', 'createPost', 'updatePost']),

    slugify(text) {
      return this.$options.filters.slug(text);
    },

    getBase64(file, callback) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        callback(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
      };
    },

    handleImageAdded(file, Editor, cursorLocation, resetUploader) {
      if (file.size > 5242880) {
        this.uploadEditor.errors = {};
        this.uploadEditor.errors.message = 'Maximum image size 5MB.';
        return;
      }

      if (this.uploadEditor.errors) {
        this.uploadEditor.errors = false;
      }

      this.uploadEditor.Editor = Editor;
      this.uploadEditor.cursorLocation = cursorLocation;
      this.uploadEditor.resetUploader = resetUploader;
      this.uploadEditor.fileName = file.name;
      this.state.isProcess = true;

      // Call getBase64 and pass a callback to handle the upload
      this.getBase64(file, (base64String) => {
        this.uploadEditor.fileBaseString64 = base64String;
        this.uploadImageSuccess();
      });
    },

    uploadImageSuccess() {
      let url = null;
      const fileName = this.sanitizeFileName(this.uploadEditor.fileName);
      const cropFile = this.dataURLtoFile(this.uploadEditor.fileBaseString64, fileName);

      this.convertFileToJpegBlob(cropFile)
        .then((blob) => {
          return axios
            .get(`${config.MS_SOCO_ADMIN_API_URL}/pre-signed-url`, {
              params: {
                fileName: `${fileName}.${blob.type.replace('image/', '')}`,
                contentType: blob.type,
              },
            })
            .then((response) => {
              url = response.data.data.url;
              delete axios.defaults.withCredentials;
              return axios.put(response.data.data.signedUrl, blob, {
                headers: { 'Content-Type': blob.type },
              });
            });
        })
        .then((response) => {
          this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', url);
          this.uploadEditor.resetUploader();
          this.$toasted.show('Successfully uploaded');
        })
        .catch((err) => {
          this.$toasted.show('Failed to upload. Try again.');
          console.log(err);
        })
        .finally(() => {
          axios.defaults.withCredentials = true;
        });
    },

    sanitizeFileName(fileName) {
      return fileName.replace(/[^a-z0-9_\-\.]/gi, '_').toLowerCase();
    },

    convertFileToJpegBlob(file, mimeType = 'image/jpeg') {
      return new Promise((resolve, reject) => {
        if (file.type === 'image/gif') {
          resolve(file);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const reader = new FileReader();
        const img = new Image();

        img.onload = function () {
          ctx.canvas.width = img.width;
          ctx.canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, mimeType);
        };

        reader.onloadend = function () {
          img.src = reader.result;
        };

        reader.readAsDataURL(file);
        reader.onerror = function (error) {
          console.log('Error: ', error);
        };
      });
    },

    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      if (arr.length < 2) {
        return null;
      }

      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) {
        return null;
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    },

    init() {
      this.getHelpCategories().then((data) => {
        this.options.category = data;

        if (this.isEdit) {
          this.loading = true;

          this.getPosts({
            filter: { _id: this.id },
          })
            .then(([edit]) => {
              this.created_from = edit.created_from || this.created_from;
              this.selected.category = edit.category || this.selected.category;
              this.selected.subcategory = edit.subcategory || this.selected.subcategory;
              this.title = edit.title;
              this.slug = edit.slug;
              this.content = this.$options.filters.stripHTML(edit.content) || edit.content;
              this.version.desktop =
                this.$options.filters.stripHTML(edit.desktop_version) || edit.desktop_version || this.version.desktop;
              this.version.mobile =
                this.$options.filters.stripHTML(edit.mobile_version) || edit.mobile_version || this.version.mobile;
              this.version.app =
                this.$options.filters.stripHTML(edit.app_version) || edit.app_version || this.version.app;
              this.status = edit.status;
              this.selected.active = edit.is_active;
              this.owner = edit.owner;
              this.position = edit[this.position_key] || this.position;
              this.platform = edit.platform || this.platform;
              //
              this.loading = false;
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
      });
    },

    getHelpCategories() {
      return this.getCategories(this.params)
        .then((data) =>
          data.map((item) => ({
            id: item._id,
            name: item.name,
            slug: item.slug,
            sub_categories: item.sub_categories.map(({ _id: id, name, slug }) => ({ id, name, slug })),
          }))
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
    },

    onSubmit(e) {
      this.$validator.validate().then((valid) => {
        if (valid) {
          this.loading = true;
          this.status = e.submitter.value;

          if (this.isEdit) {
            this.updatePost({
              id: this.id,
              payload: this.payload,
            })
              .then(() =>
                this.response({
                  to: { name: 'help-content' },
                  message: `Content "${this.payload.title}" was successfully updated!`,
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
            this.createPost(this.payload)
              .then(() =>
                this.response({
                  to: { name: 'help-content' },
                  message: `Content "${this.payload.title}" was successfully created!`,
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
        this.$router.push(to, () => this.$toasted.global.show(message, { icon: 'check' }));
      } else {
        this.$toasted.global.error(message, { icon: 'warning' });
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/help-content-form';
</style>
