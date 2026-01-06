<template>
  <div class="sc-form">
    <div class="sc-form-title" v-text="context.heading"></div>

    <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="ml-2"></ball-pulse-loader>

    <form data-vv-scope="form-category" class="sc-form-container" @submit.prevent="onSubmit">
      <div class="sc-form-group">
        <label class="sc-form-label" for="country">Country</label>
        <select id="country" v-model="created_from" class="sc-form-input">
          <option v-for="{ text, value } in options.created_from" :key="value" :value="value" v-text="text"></option>
        </select>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-name">Platform</label>
        <select
          id="platform"
          v-model="platform"
          v-validate="'required'"
          name="platform"
          type="number"
          class="sc-form-input"
        >
          <option value="soco">SOCO</option>
          <option value="lilla">Lilla</option>
        </select>
        <small class="invalid-feedback" v-text="errors.first('form-post.platform')"></small>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-name">Position</label>
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

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-name">Category Name <span class="required">*</span></label>
        <input
          id="category-name"
          v-model="name"
          v-validate="'required'"
          name="name"
          type="text"
          class="sc-form-input"
          aria-describedby="categoryName"
        />
        <small class="invalid-feedback" v-text="errors.first('form-category.name')"></small>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-slug">Slug <span class="required">*</span></label>
        <input
          id="category-slug"
          v-model="$slugify"
          v-validate="'required'"
          name="slug"
          type="text"
          class="sc-form-input"
          aria-describedby="categorySlug"
        />
        <small class="invalid-feedback" v-text="errors.first('form-category.slug')"></small>
        <small id="categorySlug" class="form-text text-muted"
          >The “slug” is the URL-friendly version of the name. It is usually all lowercase and contains only letters,
          numbers, and hyphens.</small
        >
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-description">Description</label>
        <textarea
          id="category-description"
          v-model="description"
          class="sc-form-input"
          aria-describedby="categoryDescription"
        ></textarea>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-parent">Parent Category</label>
        <select
          id="category-parent"
          v-model="selected.category.id"
          :disabled="selected.category.disabled"
          class="sc-form-input"
        >
          <option value=""></option>
          <option v-for="item in options.category" :key="item._id" :value="item._id" v-text="item.name"></option>
        </select>
      </div>

      <div class="sc-form-group">
        <label class="sc-form-label" for="category-icon">Category Icon (150x150)</label>

        <croppa
          v-model="croppa"
          :disabled="isDisabled"
          :file-size-limit="5242880"
          :disable-scroll-to-zoom="false"
          :prevent-white-space="false"
          :placeholder-font-size="10"
          :remove-button-size="30"
          :input-attrs="attrs"
          :height="150"
          :width="150"
          :quality="1"
          accept="image/jpg,image/jpeg,image/png"
          remove-button-color="#f780a7"
          placeholder="Click here to upload an image."
          initial-size="contain"
          @file-choose="onFileChoose"
          @image-remove="onImageRemove"
        >
          <img slot="initial" :src="image.url" />
        </croppa>
        <small id="categoryIcon" class="form-text text-muted"></small>
      </div>

      <!--
            <div class="sc-form-group">
                <label class="sc-form-label" for="category-active">Category Active</label>
                <select
                    v-model="is_active"
                    id="category-active"
                    class="sc-form-input">

                    <option
                        v-for="(item, index) in options.active"
                        :key="index"
                        :value="item.value"
                        v-text="item.text"></option>
                </select>
            </div>
            -->

      <div class="sc-form-group">
        <div>
          <button
            :disabled="loading"
            type="submit"
            class="sc-btn sc-btn-rounded sc-btn-md sc-btn-primary sc-uppercase"
            v-text="context.submit"
          ></button>
          <ball-pulse-loader v-if="loading" color="#F083A6" size="10px" class="pt-2 pl-2"></ball-pulse-loader>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Croppa from 'vue-croppa';

export default {
  name: 'help-categories-form',

  components: {
    croppa: Croppa.component,
  },

  props: {
    category_id: {
      type: String,
      default: '',
    },
    subcategory_id: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      croppa: {},
      filename: '',
      name: '',
      slug: '',
      description: '',
      image: { url: '' },
      created_from: 'sociolla',
      position: 1,
      platform: '',
      // is_active: true,
      //
      selected: {
        category: {
          id: '',
          disabled: false,
        },
      },
      options: {
        created_from: [
          { text: 'Indonesia', value: 'sociolla' },
          { text: 'Vietnam', value: 'sociolla_vn' },
        ],
        category: [],
        /*
                active: [
                    {text: 'Inactive', value: false},
                    {text: 'Active', value: true}
                ]
                */
      },
      loading: false,
      params: {
        filter: {
          type: 'help_page_article',
        },
        fields: 'id name slug',
        skip: 0,
        limit: 0,
      },
      attrs: {
        id: 'category-icon',
        'aria-describedby': 'categoryIcon',
      },
    };
  },

  computed: {
    isEdit() {
      return this.category_id != '' || this.subcategory_id != '';
    },

    $slugify: {
      get() {
        return this.slug;
      },
      set(value) {
        this.slug = this.slugify(value);
      },
    },

    payload() {
      return {
        name: this.name,
        slug: this.slug,
        type: 'help_page_article',
        description: this.description,
        image: this.image,
        created_from: this.created_from,
        [this.position_key]: this.position,
        platform: this.platform,
        // is_active: this.is_active
      };
    },

    isDisabled() {
      return this.image.url ? !/data:image/.test(this.image) : false;
    },

    context() {
      return this.subcategory_id
        ? {
            heading: 'Edit Sub Category',
            submit: 'Update Sub Category',
          }
        : this.category_id
        ? {
            heading: 'Edit Category',
            submit: 'Update Category',
          }
        : {
            heading: 'Add Category',
            submit: 'Create Category',
          };
    },
    position_key() {
      return this.created_from == 'sociolla_vn' ? 'position_vn' : 'position';
    },
  },

  watch: {
    name(newValue, oldValue) {
      // skip first
      if (oldValue) {
        this.$slugify = this.slugify(newValue);
      }
    },
  },

  created() {
    this.init();
  },

  methods: {
    ...mapActions('categories', [
      'getCategories',
      'postCategories',
      'putCategories',
      'postSubCategory',
      'putSubCategory',
      'checkSlugExists',
    ]),

    async init() {
      this.getHelpCategories();

      if (this.isEdit) {
        let edit;

        this.loading = true;

        if (this.subcategory_id) {
          // sub category init
          edit = await this.getCategories({
            filter: {
              'sub_categories._id': this.subcategory_id,
            },
          })
            .then(([edit]) => {
              this.selected = {
                category: {
                  id: edit._id,
                  disabled: true,
                },
              };
              return edit.sub_categories.find(({ _id }) => _id == this.subcategory_id);
            })
            .catch(console.log);
        } else {
          // category init
          edit = await this.getCategories({
            filter: {
              _id: this.category_id,
            },
          })
            .then(([edit]) => {
              this.selected.category.id = edit.id;
              return edit;
            })
            .catch(console.log);
        }

        // initialize
        if (edit) {
          this.created_from = edit.created_from || this.created_from;
          this.name = edit.name;
          this.slug = edit.slug;
          this.description = edit.description;
          this.image = edit.image || this.image;
          this.position = edit[this.position_key] || this.position;
          this.platform = edit.platform || this.platform;
        }
        // this.is_active = edit.is_active
        this.loading = false;
      }
    },

    getHelpCategories() {
      this.getCategories(this.params).then((data) => (this.options.category = data));
    },

    onFileChoose(file) {
      this.filename = Math.ceil(Math.random() * 1000) + '-' + file.name.replace(/ /g, '-').replace(/('|\(|\))/g, '');
    },

    onImageRemove() {
      this.filename = '';
      this.image.url = '';
      this.croppa.refresh(); // unlink s3 initial image due cors issue
    },

    isSlugExists() {
      return this.checkSlugExists({
        slug: this.payload.slug,
        category_id: this.category_id,
        subcategory_id: this.subcategory_id,
      });
    },

    uploadImage() {
      if (this.croppa.hasImage()) {
        if (!this.isDisabled) {
          return this.croppa
            .promisedBlob()
            .then((blob) =>
              this.$store.dispatch('files/putFile', {
                filename: this.filename,
                blob,
              })
            )
            .then(({ url }) => (this.payload.image.url = url));
        }
      }

      return Promise.resolve({});
    },

    onSubmit() {
      this.$validator.validate().then(async (valid) => {
        if (valid) {
          this.loading = true;

          const exists = await this.isSlugExists();

          if (exists) {
            return this.response({
              message: `Slug "${this.payload.slug}" already exists!`,
            });
          }

          // upload image if any
          await this.uploadImage();

          if (this.subcategory_id) {
            // edit sub category
            this.putSubCategory({
              id: [this.category_id, this.subcategory_id],
              payload: this.payload,
            })
              .then(() =>
                this.response({
                  to: {
                    name: 'help-sub-categories',
                    params: { category_id: this.category_id },
                  },
                  message: `Sub Category "${this.payload.name}" was successfully updated!`,
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
          } else if (this.category_id) {
            // edit category
            this.putCategories({
              id: this.category_id,
              payload: this.payload,
            })
              .then(() =>
                this.response({
                  to: { name: 'help-categories' },
                  message: `Category "${this.payload.name}" was successfully updated!`,
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
            if (this.selected.category.id) {
              // create sub category
              this.postSubCategory({
                id: this.selected.category.id,
                payload: this.payload,
              })
                .then(() =>
                  this.response({
                    to: {
                      name: 'HelpSubCategories',
                      params: { category_id: this.selected.category.id },
                    },
                    message: `Sub Category "${this.payload.name}" was successfully created!`,
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
              // create category
              this.postCategories(this.payload)
                .then(() =>
                  this.response({
                    to: { name: 'help-categories' },
                    message: `Category "${this.payload.name}" was successfully created!`,
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
            }
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
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import 'scss/help-categories-form';
</style>
