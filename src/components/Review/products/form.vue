<template src="./form.html"></template>

<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
import Vue from 'vue';
import Multiselect from 'vue-multiselect';
import Croppa from 'vue-croppa';
import { VueEditor } from 'vue2-editor';
import Q from 'q';
import { get } from 'lodash';

Vue.use(Croppa);

let cancelSearchResource;

export default {
  name: 'product-form',
  components: { Multiselect, VueEditor },

  data() {
    return {
      dummy: 'ok',
      previewImage: null,
      is_loading: true,
      addProductImages: false,
      showModal: false,
      tmp_image: '',
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      isSaveCrop: false,
      changeImage: false,
      banner: {
        image: '',
      },
      state: {
        isProcess: false,
      },
      changeProductData: {},
      data: {},
      temp: {
        brand: {},
        name: '',
        category_0: {},
        category_1: {},
        category_2: {},
        default_category: { id: '', name: '' },
        status: '',
        how_to_use: '',
        ingredients: '',
        content: '',
        description: '',
        images: [],
        combinations: [],
        meta_title: '',
        meta_description: '',
        empty_image: {
          url: '',
          is_cover: false,
        },
      },
      form: {
        images: [],
        attribute: {
          size: {},
          variant: {},
          shade: {},
        },
        edit: false,
      },
      options: {
        brands: {
          data: [],
          is_loading: false,
        },
        category_0: {
          data: [],
          is_loading: false,
        },
        category_1: {
          data: [],
          is_loading: false,
        },
        category_2: {
          data: [],
          is_loading: false,
        },
        size: [],
        variant: [],
        shade: [],
      },
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }, { align: [] }],
      ],
    };
  },

  computed: {
    hash_id() {
      return this.$route.params.id;
    },
    product_cover_url() {
      const cover = (this.temp.images || []).find((el) => el.is_cover);
      return cover ? cover.url : '';
    },
    product_image() {
      if (this.data.images && this.data.images.length) {
        return get(
          this.data.images.find((img) => img.is_cover),
          'url',
          ''
        );
      }
      return '';
    },
  },

  watch: {
    data(newData, oldData) {
      this.applyTempData(newData);
    },
    'temp.category_0'(newData) {
      this.findCategory(newData.id, 1);
    },
    'temp.category_1'(newData) {
      if (newData) {
        this.options.category_2.data = (newData.sub_categories || []).map((it) => {
          return {
            id: it._id,
            name: it.name,
          };
        });
      }
    },
    'temp.category_2'(newData) {
      if (newData) {
        this.options.category_3.data = (newData.sub_categories || []).map((it) => {
          return {
            id: it._id,
            name: it.name,
          };
        });
      }
    },
  },

  mounted() {
    this.fetchData();
    this.findCategory();
  },

  methods: {
    fetchData() {
      const self = this;

      if (!self.hash_id) {
        self.$router.push({ name: 'product-list' });
      }

      self.is_loading = true;
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/products', {
        params: {
          filter: { _id: self.hash_id, status: 'waiting-approval' },
        },
      })
        .then((response) => {
          if (response.status == 200 && response.data.data && response.data.data[0]) {
            self.data = response.data.data[0];
          } else {
            self.$router.push({ name: 'product-list' });
          }

          setTimeout(() => {
            self.is_loading = false;
          }, 400);
        })
        .catch((err) => {
          self.is_loading = false;
          self.$router.push({ name: 'product-list' });

          console.log(err);
          throw err;
        });
    },

    sanitize(data) {
      try {
        data = data.replace(/<li><p>/g, '<li>');
        data = data.replace(/<\/p><\/li>/g, '</li>');
      } catch (err) {}
      return data;
    },

    applyTempData(data) {
      console.log('applyTempData', 'data', data);
      this.temp.brand = data.brand;
      this.temp.name = data.name;

      if (data.categories) {
        this.temp.category_0 = data.categories[0] || {};
        this.temp.category_1 = data.categories[1] || {};
        this.temp.category_2 = data.categories[2] || {};
      } else {
        this.temp.category_0 = this.temp.category_1 = this.temp.category_2 = {};
      }

      this.temp.status = data.status;
      this.temp.how_to_use = this.sanitize(data.how_to_use);
      this.temp.ingredients = this.sanitize(data.ingredients);
      this.temp.content = data.content;
      this.temp.description = data.description;
      this.temp.images = data.images || [];
      this.temp.meta_title = data.meta_title;
      this.temp.meta_description = data.meta_description;
      this.temp.meta_keyword = data.meta_keyword;
      this.temp.combinations = data.combinations;
      this.temp.default_category = data.default_category;

      console.log('applyTempData', 'temp', this.temp);
    },

    findBrands(query) {
      if (query) {
        this.options.brands.is_loading = true;

        if (typeof cancelSearchResource === 'object') {
          cancelSearchResource.cancel();
        }
        const CancelToken = Axios.CancelToken;
        cancelSearchResource = CancelToken.source();

        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + `/brands`, {
          cancelToken: cancelSearchResource.token,
          params: {
            filter: {
              is_active_in_review: true,
              name: {
                $regex: '^' + query,
                $options: 'i',
              },
            },
            fields: '_id name is_active_in_review is_active_in_sociolla',
            skip: 0,
            limit: 10,
          },
        })
          .then((response) => {
            this.options.brands.is_loading = false;
            if (response.status === 200) {
              this.options.brands.data = (response.data.data || []).map((it) => {
                return {
                  id: it._id,
                  name: it.name,
                  sub_categories: it.sub_categories,
                };
              });
            }
          })
          .catch((error) => {
            if (Axios.isCancel(error)) {
              return 'cancel';
            }
            this.options.brands.is_loading = false;
            console.log('Error: ' + error);
          });
      }
    },

    findCategory(categoryId, categoryIndex = 0) {
      const key = 'category_' + (categoryIndex || 0);

      this.options[key].is_loading = true;
      let endpoint = `/product/categories/Shop%20By%20Departments`;
      if (categoryId) {
        endpoint = `/product/categories/${categoryId}/children`;
      }

      this.options[key].data = [];

      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + endpoint, {
        params: {
          filter: !categoryId ? { is_featured: true } : {},
          fields: '_id name sub_categories',
          skip: 0,
          limit: 10,
        },
      })
        .then((response) => {
          this.options[key].is_loading = false;
          if (response.status === 200) {
            this.options[key].data = (response.data.data || []).map((it) => {
              return {
                id: it._id,
                name: it.name,
                sub_categories: it.sub_categories,
              };
            });
          }
        })
        .catch((error) => {
          if (Axios.isCancel(error)) {
            return 'cancel';
          }
          this.options[key].is_loading = false;
          console.log('Error: ' + error);
        });
    },

    processSave() {
      const self = this;
      // self.populateImagesFromCombinations()
      return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/products/' + self.hash_id, {
        // ...self.data,
        categories: [{ ...self.temp.category_0 }, { ...self.temp.category_1 }, { ...self.temp.category_2 }],
        brand: self.temp.brand,
        name: self.temp.name,
        status: self.temp.status,
        how_to_use: self.temp.how_to_use,
        ingredients: self.temp.ingredients,
        content: self.temp.content,
        description: self.temp.description,
        images: self.temp.images,
        meta_title: self.temp.meta_title,
        meta_description: self.temp.meta_description,
        meta_keyword: self.temp.meta_keyword,
        combinations: self.temp.combinations,
      });
    },

    save() {
      const self = this;
      self
        .processSave()
        .then((response) => {
          self.is_loading = false;
          if (response.status == 200) {
            alert('Success');
            self.$router.push({ name: 'productList' });
          }
        })
        .catch((err) => {
          self.is_loading = false;
          console.log(err);
          throw err;
        });
    },
    showModalAddCollection(submit, editCombination, index) {
      if (this.addProductImages == false) {
        this.addProductImages = true;
        this.getAttributes('shade');
        this.getAttributes('size');
        this.getAttributes('variant');
      } else {
        this.addProductImages = false;
      }

      // console.log('submit, editCombination, index', submit, editCombination, index)

      if (submit == 'add') {
        this.previewImage = null;
        this.form = {
          attribute: {
            shade: {},
            size: {},
            variant: {},
          },
          edit: false,
          images: [],
        };
      } else if (submit == 'edit' && editCombination && typeof index != 'undefined') {
        this.previewImage = editCombination.images[0] ? editCombination.images[0].url : null;
        this.form = {
          index,
          attribute: {
            shade: editCombination.attribute && editCombination.attribute.shade ? editCombination.attribute.shade : {},
            size: editCombination.attribute && editCombination.attribute.size ? editCombination.attribute.size : {},
            variant:
              editCombination.attribute && editCombination.attribute.variant ? editCombination.attribute.variant : {},
          },
          edit: true,
          images: editCombination.images,
        };
      }

      if (submit === true && !this.form.edit) {
        const formData = Object.assign({}, this.form);
        console.log('formData', formData);
        Object.keys(formData.attribute).map((el) =>
          !Object.keys(formData.attribute[el]).length ? delete formData.attribute[el] : ''
        );
        Object.keys(formData.attribute).length == 0 ? (formData.attribute = {}) : '';
        this.temp.combinations.push(formData);
      } else if (submit === true && this.form.edit) {
        const indexComb = this.form.index;
        if (this.temp.combinations[indexComb]) {
          this.temp.combinations[indexComb].attribute = this.form.attribute;
          this.temp.combinations[indexComb].images = this.form.images;
        }
      }
    },
    changeImageProduct() {
      if (this.showModal == false) {
        this.showModal = true;
      } else {
        this.showModal = false;
      }
    },
    uploadImage(e, isProductImage) {
      this.state.isProcess = true;
      this.$toasted.global.show('image uploading... ');
      const cropFile = e.target.files[0];
      const fileName = cropFile.name;
      const reader = new FileReader();
      reader.readAsDataURL(cropFile);
      reader.onload = (e) => {
        this.previewImage = e.target.result;
      };
      this.banner.image = '';
      const self = this;
      return Q.try(function () {
        return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
          params: {
            fileName: fileName,
            contentType: cropFile.type,
          },
        });
      })
        .then(function (response) {
          self.tmp_image = response.data.data.url;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, cropFile, {
            headers: { 'Content-Type': cropFile.type },
          });
        })
        .then((response) => {
          this.$toasted.global.show('image upload success! ');
          this.state.isProcess = false;
          if (isProductImage) {
            this.data.images[0].url = self.tmp_image;
            return;
          }
          self.form.images = [{ url: self.tmp_image }];
          Axios.defaults.withCredentials = true;
          self.banner.image = self.tmp_image;
        })
        .catch((err) => {
          this.state.isProcess = false;
          this.$toasted.global.error('image upload failed! ');
          console.error(err);
        });
    },
    labelName({ name }) {
      return name;
    },
    searchShade(query = '') {
      this.getAttributes('shade', query);
    },
    searchSize(query = '') {
      this.getAttributes('size', query);
    },
    searchVariant(query = '') {
      this.getAttributes('variant', query);
    },
    getAttributes(type = null, query = '') {
      if (type == null) {
        console.error('getAttributes: type not defined');
        return;
      }
      const attrType = {
        size: 'Size',
        variant: 'Variant',
        shade: 'Shade',
      };
      const params = {
        section: 'getAttributes',
        filter: {
          'group.name': attrType[type],
        },
        limit: 15,
        skip: 0,
      };
      if (query) {
        params.filter.name = { $regex: '^' + query, $options: 'i' };
      }

      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/product/attributes', {
        params,
      })
        .then((res) => {
          if (res.status == 200) {
            const data = res.data.data;
            this.options[type] = data;
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    triggerUpload() {
      this.showImageUploader();
      this.fileSizeExceed = false;
      this.showModal = true;
    },
    showImageUploader() {
      this.changeImage = true;
    },
    generateChar(endNumber) {
      let randStr = '';

      for (let i = 1; i <= 300; i++) {
        randStr += 'a';
      }

      return randStr;
    },
    // onFileSizeExceed (file) {
    //     this.fileSizeExceed = true;
    //     this.isFileChoose = false;
    // },
    // onFileChoose () {
    //     this.isFileChoose = true;
    //     this.fileSizeExceed = false;
    // },
    // saveCrop () {

    //     var file = this.croppa.getChosenFile(),
    //     fileName = file.name,
    //     cropFile,
    //     data;

    //     cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
    //     this.banner.image = '';
    //     this.state.isProcess = true;

    //     this.isSaveCrop = true;
    //     var url = null;
    //     var key = null;
    //     var self = this;
    //     return Q.try(function() {
    //             return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL+'/pre-signed-url' ,{
    //             'params' :{
    //                 'fileName' : fileName,
    //                 'contentType' : cropFile.type
    //             }
    //         })
    //     })
    //     .then(function (response) {
    //         console.log(response)
    //         self.tmp_image = response.data.data.url;
    //         // self.dataArticle.url = response.data.data.url;
    //         self.showModal = false;
    //         self.isFileChoose = false;
    //         self.isSaveCrop = false;
    //         self.changeImage = false
    //         let temp_axios = Axios;
    //         delete temp_axios.defaults.withCredentials;

    //         return temp_axios.put(response.data.data.signedUrl, cropFile,
    //             {headers: {'Content-Type': cropFile.type}
    //         })
    //     })
    //     .then((response) => {
    //         self.form.images.push({url: self.tmp_image})
    //         Axios.defaults.withCredentials = true;
    //         // this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', image_url);
    //         // this.uploadEditor.resetUploader();
    //         //set state
    //         this.state.isProcess = false;
    //         self.banner.image = self.tmp_image;
    //     })
    //     .catch((err) => {
    //         this.state.isProcess = false;
    //         console.log(err);
    //     });

    // },
    // dataURLtoFile(dataurl, filename) {
    //     var arr = dataurl.split(','),
    //     mime = arr[0].match(/:(.*?);/)[1],
    //     bstr = atob(arr[1]), n = bstr.length,
    //     u8arr = new Uint8Array(n);
    //     while(n--){
    //         u8arr[n] = bstr.charCodeAt(n);
    //     }

    //     return new File([u8arr], filename, {type:mime});
    // },
    // dataURItoBlob(dataURI) {
    //     var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
    //     var byteString = atob(dataURI.split(',')[1]);
    //     var ab = new ArrayBuffer(byteString.length);
    //     var ia = new Uint8Array(ab);
    //     for (var i = 0; i < byteString.length; i++) {
    //         ia[i] = byteString.charCodeAt(i);
    //     }

    //     return new Blob([ab], { type: mime });
    // },

    deleteCombination(index) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          if (self.temp.combinations[index]) {
            self.temp.combinations.splice(index, 1);
            self.populateImagesFromCombinations();
          }
        })
        .catch((err) => {
          console.log(err);
          console.log('Clicked on cancel');
        });
    },

    deleteImageCombination(indexComb, indexImage) {
      const self = this;

      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          if (
            self.temp.combinations[indexComb] &&
            self.temp.combinations[indexComb].images &&
            self.temp.combinations[indexComb].images[indexImage]
          ) {
            self.temp.combinations[indexComb].images.splice(indexImage, 1);
            self.populateImagesFromCombinations();
          }
        })
        .catch((err) => {
          console.log(err);
          console.log('Clicked on cancel');
        });
    },

    populateImagesFromCombinations(cover_url = false) {
      const self = this;
      cover_url = cover_url && typeof cover_url == 'string' ? cover_url : self.product_cover_url;

      const images = [];
      (self.temp.combinations || []).forEach((el) => {
        (el.images || []).forEach((image) => {
          images.push({
            is_cover: image.url == cover_url,
            url: image.url,
          });
        });
      });
      self.temp.images = images;
    },

    approve() {
      const self = this;
      self
        .processSave()
        .then((response) => {
          self.is_loading = false;
          if (response.status == 200) {
            return Axios.put(Config.default.MS_SOCO_ADMIN_API_URL + '/products/' + self.hash_id + '/approve', {}).then(
              (response) => {
                self.is_loading = false;
                if (response.status == 200) {
                  alert('Success');
                  self.$router.push({ name: 'productList' });
                }
              }
            );
          }
        })
        .catch((err) => {
          self.is_loading = false;
          if (err.response && err.response.data) {
            if (
              err.response.data.errorCode === 'DUPLICATE_PRODUCT_ALREADY_APPROVED' &&
              err.response.data.message === 'Duplicate Product already approved'
            ) {
              this.$toasted.global.show('Produk yang ingin kamu approve sudah ada, coba cek kembali');
            }
          }
          console.log(err);
          throw err;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_form';
</style>
