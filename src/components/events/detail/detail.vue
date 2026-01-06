<template src="./detail.html"></template>
<script>
const Config = require('../../../../config/default.env');
const ApiUrl = Config.default.MS_SOCO_ADMIN_API_URL + `/events/`;
const BaseUrl = Config.default.MS_SOCO_ADMIN_API_URL;
let CancelToken;
let source;
import Axios from 'axios';
import Vue from 'vue';
import Croppa from 'vue-croppa';
import Q from 'q';
import Multiselect from 'vue-multiselect';
import { VueEditor } from 'vue2-editor';
import { ImageDrop } from 'quill-image-drop-module';
import { ImageResize } from '@/shared/package/quill-image-resize';
import ProductCard from './productcard';
import FormAddress from '@/components/forms/form-address/form-address';
import Modal from '@/vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';
import InputAutoComplete from '@/components/forms/input-autocomplete/input-autocomplete';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';
import GoogleMaps from '@/components/maps/google-map-v2/google-maps';
Vue.use(Croppa);
import { debounce } from 'lodash';
export default {
  name: 'event-detail',
  components: {
    GoogleMaps,
    Datetime,
    Multiselect,
    VueEditor,
    ImageResize,
    VueEditor,
    Modal,
    ProductCard,
    FormAddress,
    InputAutoComplete,
  },
  data() {
    return {
      modalAddressActive: false,
      image: '',
      is_ticket: false,
      hasLoadMoreOrganizer: false,
      isLoadingOrganizer: false,
      isLoadingFindUser: false,
      organizerName: '',
      maps: null,
      locationMarker: '',
      mapData: '',
      fomKeyRender: Math.random().toString(),
      // autocomplete events
      onTypingOrganizer: debounce(function () {
        if (this.organizerName.trim().length < 5 && this.organizerName.trim().length !== 0) {
          return;
        }
        this.isLoadingOrganizer = true;
        // this.organizers = [];
        (this.organizers = [
          {
            name: '',
            description: '',
            url: {
              type: '',
              protocol: 'https://',
              value: '',
            },
          },
        ]),
          this.doFind().finally(() => (this.isLoadingOrganizer = false));
      }, 500),
      event_type: ['free', 'paid', 'exclusive'],
      event_category: ['beauty_class', 'atrium', 'soiree', 'other'],
      event_status: ['draft', 'pending', 'publish', 'deleted'],
      event_media_platform: ['youtube', 'instagram', 'other'],
      event_media_type: ['image', 'video'],
      event_classification: ['online', 'offline'],
      visibility_to: ['soco', 'private'],
      url_type: ['instagram', 'custom'],
      event_deleted_status: [true, false],
      event_free_gifts: {
        type: '',
        products: [],
      },
      organizers: [],
      organizersTemp: [
        {
          id: '',
          name: '',
          description: '',
          url: {
            type: '',
            protocol: 'https://',
            value: '',
          },
        },
      ],
      showModal: false,
      is_loading: true,
      event_id: null,
      event: {
        title: '',
        start_date: '',
        end_date: '',
        category: 'beauty_class',
        cover: {
          media_type: 'image',
          url: '',
        },
        livestream: {
          media_platform: 'youtube',
          url: '',
        },
        type: 'free',
        classification: 'online',
        visibility_to: 'soco',
        ticket: { product_id: '', product_name: '' },
        free_gifts: [],
        total_quota: 0,
        total_quota_available: 0,
        total_participants: 0,
        starting_participants: 0,
        status: 'publish',
        event_participant_csv_url: '', // if event is exclusive participant can be added manually
        invite_participant_csv_url: '',
        organizers: [
          {
            name: '',
            description: '',
            url: {
              type: '',
              protocol: 'https://',
              value: '',
            },
          },
        ],
        videos: [],
        collections: [],
        articles: [],
        images: [],
        gallery: [],
        is_deleted: false,
        is_live_chat_enabled: true,
        info: {
          venue: {
            address: '',
            district: {
              id: '',
              name: '',
            },
            province: {
              id: '',
              name: '',
            },
            country: {
              id: '',
              name: '',
            },
            city: {
              id: '',
              name: '',
            },
            postal_code: '',
          },
          description: '',
          terms_condition: '',
          cancellation_policy: '',
          hashtag: '',
        },
        type: 'free',
        free_gifts: [],
      },
      tmp_image: '',
      isFileChoose: false,
      fileSizeExceed: false,
      croppa: {},
      isSaveCrop: false,
      changeImage: false,
      customToolbar: [
        ['bold', 'italic', 'underline'],
        ['blockquote', { list: 'ordered' }, { list: 'bullet' }, { align: [] }],
        ['image', 'video', 'link'],
      ],
      customModulesForEditor: [
        { alias: 'imageDrop', module: ImageDrop },
        { alias: 'imageResize', module: ImageResize },
      ],
      editorSettings: {
        modules: {
          imageDrop: true,
          imageResize: {
            displaySize: {},
          },
        },
      },
      state: {
        isProcess: false,
        productDetailShow: false,
      },
      options: {
        product: [],
        nextPage: null,
        isloadMore: false,
        keyword: '',
        is_available: [
          { text: 'Show', value: true },
          { text: 'Hidden', value: false },
        ],
        is_active: [
          { text: 'Active', value: true },
          { text: 'Not Active', value: false },
        ],
      },
      tempVariantProd: null,
      tempProduct: null,
      searchIsLoading: false,
      beautyTags: [],
      addrltdLink: {
        article: '',
        video: '',
        collection: '',
      },

      formData: {
        products: [],
      },
    };
  },
  computed: {
    validator() {
      const event = this.event;
      return Boolean(
        event.title &&
          event.status &&
          event.total_quota &&
          event.type &&
          event.category &&
          event.organizers.length &&
          event.start_date &&
          event.end_date &&
          event.classification &&
          event.visibility_to &&
          event.cover.media_type &&
          event.media_platform
      );
    },
    hasValid() {
      const {
        address: { province, city, district, address, postal_code },
      } = this;

      return [
        Boolean(province && province.name),
        Boolean(city && city.name),
        Boolean(district && district.name),
        address,
        postal_code,
      ].every((item) => Boolean(item));
    },
    districtsFilter() {
      if (this.districtName.length > 3) {
        return this.districts.filter((item) => {
          return item.name.toLowerCase().includes(this.districtName.toLowerCase());
        });
      }

      return this.districts;
    },
    citiesFilter() {
      if (this.cityName.length > 3) {
        return this.cities.filter((item) => {
          return item.name.toLowerCase().includes(this.cityName.toLowerCase());
        });
      }

      return this.cities;
    },
    provincesFilter() {
      if (this.provinceName.length > 3) {
        return this.provinces.filter((item) => {
          return item.name.toLowerCase().includes(this.provinceName.toLowerCase());
        });
      }

      return this.provinces;
    },
  },
  watch: {
    $route(route) {
      this.fetch();
    },
  },

  mounted() {
    this.fetch();
  },

  methods: {
    processOrganizer(res, is_payload = false) {
      if (res.organizers && res.organizers.length) {
        const temp_organizers = res.organizers;
        for (let i = 0; i < temp_organizers.length; i++) {
          if (temp_organizers[i].url) {
            if (temp_organizers[i].url.value) {
              if (is_payload) {
                temp_organizers[i].url.value = `${temp_organizers[i].url.protocol}${temp_organizers[i].url.value}`;
                delete temp_organizers[i].url.protocol;
              } else {
                if (temp_organizers[i].url.value.indexOf('https') > -1) {
                  temp_organizers[i].url.protocol = 'https://';
                  temp_organizers[i].url.value = temp_organizers[i].url.value.replace(/^https:\/\//i, '');
                } else {
                  temp_organizers[i].url.protocol = 'http://';
                  temp_organizers[i].url.value = temp_organizers[i].url.value.replace(/^http:\/\//i, '');
                }
              }
            }
          }
        }
      }

      return res;
    },
    fetch() {
      this.formReset();
      this.event_id = this.$route.params.id;

      if (this.event_id) {
        this.is_loading = true;
        return Axios.get(ApiUrl, {
          params: { filter: { _id: this.event_id } },
        })
          .then((response) => {
            this.is_loading = false;

            if (response.status == 200 && response.data.data && response.data.data.length > 0) {
              let res = response.data.data[0];
              res = this.processOrganizer(res);
              this.event = Object.assign({}, res);
              // this.organizersTemp = this.event.organizers
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          })
          .finally(() => (this.fomKeyRender = Math.random().toString()));
      }
    },
    async doFind(skip = 0) {
      const { organizerName } = this;
      // let emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      if (organizerName.trim().length >= 3) {
        const params = {
          keyword: organizerName,
          skip,
          limit: 20,
        };

        try {
          const response = await Axios.get(`${Config.default.MS_SOCO_PUBLIC_API_URL}/search`, { params });
          if (response.data) {
            this.organizers = response.data.data;
          }
        } catch (e) {
          console.log(e);
        }
      }
    },
    addDescriptionOrganizer() {
      if (this.organizers.length > 1) {
        this.organizers.push({
          name: '',
          description: '',
          url: {
            type: '',
            protocol: 'https://',
            value: '',
          },
        });
      } else {
        this.$toasted.global.show(`The Organizer ${this.organizers.length} name is missing`);
      }
    },
    onSelectOrganizer(data) {
      this.event.organizers.push({
        name: data.name,
        id: data._id,
        description: '',
        url: {
          type: 'instagram',
          protocol: 'https://',
          value: '',
        },
      });
      this.organizerName = '';
    },

    onAddressSaved(data) {
      try {
        this.event.info.venue = {
          address: data.address,
          district: {
            id: data.district._id,
            name: data.district.name,
          },
          province: {
            id: data.province._id,
            name: data.province.name,
          },
          country: {
            id: data.country.id,
            name: data.country.name,
          },
          city: {
            id: data.city._id,
            name: data.city.name,
          },
          postal_code: data.postal_code,
        };
        this.$refs.modal_address.close();
      } catch (e) {
        console.log(e);
      }
    },

    getMap(maps) {},
    placeChanged(location) {
      this.locationMarker = location;
      this.payload.lat_long = `${this.locationMarker.lat},${this.locationMarker.lng}`;
    },
    setMapData(data) {
      this.mapData = data;
    },
    save() {
      const self = this;
      // self.event.organizers = self.organizersTemp
      console.log('payloads', self.event);
      if (this.validator) {
        self.event = this.processOrganizer(self.event, true);
        if (self.event_id) {
          delete self.event._id;
          Axios.put(ApiUrl + self.event_id, self.event)
            .then((response) => {
              console.log(response);
              if (response.status === 200) {
                self.$router.push('/events/list');
              }
            })
            .catch((err) => {
              self.$Progress.fail();
              this.$toasted.global.error(err);
              throw err;
            });
        } else {
          Axios.post(ApiUrl, self.event)
            .then((response) => {
              console.log(response);
              if (response.status === 200) {
                self.$router.push('/events/list');
              }
            })
            .catch((err) => {
              self.$Progress.fail();
              this.$toasted.global.error(err);
              throw err;
            });
        }
      } else {
        this.$toasted.global.error('Please fill all the mandatory fields');
      }
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
    getBase64(file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        this.uploadEditor.fileBaseString64 = reader.result;
      }.bind(this);
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

      this.getBase64(file);
      this.uploadEditor.Editor = Editor;
      this.uploadEditor.cursorLocation = cursorLocation;
      this.uploadEditor.resetUploader = resetUploader;
      this.uploadEditor.fileName = file.name;
      // set state process
      this.state.isProcess = true;
    },
    onFileSizeExceed(file) {
      this.fileSizeExceed = true;
      this.isFileChoose = false;
    },
    onFileChoose() {
      this.isFileChoose = true;
      this.fileSizeExceed = false;
    },
    saveCrop() {
      const file = this.croppa.getChosenFile();
      const fileName = Date.now() + '-' + file.name;
      let cropFile;

      if (file.type === 'image/gif') {
        cropFile = file;
      } else {
        cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
      }
      this.event.cover.url = '';
      this.state.isProcess = true;

      this.isSaveCrop = true;
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
          console.log(response);
          self.tmp_image = response.data.data.url;
          // self.dataArticle.url = response.data.data.url;
          self.showModal = false;
          self.isFileChoose = false;
          self.isSaveCrop = false;
          self.changeImage = false;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;

          return temp_axios.put(response.data.data.signedUrl, cropFile, {
            headers: { 'Content-Type': cropFile.type },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          // this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', image_url);
          // this.uploadEditor.resetUploader();
          //set state
          this.state.isProcess = false;
          self.event.cover.url = self.tmp_image;
        })
        .catch((err) => {
          this.state.isProcess = false;
          console.log(err);
        });
    },
    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    },
    dataURItoBlob(dataURI) {
      const arr = dataURI.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const byteString = atob(dataURI.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], { type: mime });
    },

    // .......................Operation Section....
    formReset() {
      this.organizers = [];
      this.event_id = null;
      this.is_ticket = false;
      this.event = {
        title: '',
        start_date: '',
        end_date: '',
        category: '',
        cover: {
          media_type: '',
          url: '',
        },
        livestream: {
          media_platform: '',
          url: '',
        },
        type: '',
        classification: '',
        free_gifts: [],
        ticket: { product_id: '', product_name: '' },
        total_quota: 0,
        total_quota_available: 0,
        total_participants: 0,
        starting_participants: 0,
        status: '',
        event_participant_csv_url: '', // if event is exclusive participant can be added manually
        invite_participant_csv_url: '',
        organizers: [],
        videos: [],
        collections: [],
        images: [],
        gallery: [],
        articles: [],
        is_deleted: false,
        is_live_chat_enabled: true,
        info: {
          venue: {
            address: '',
            district: {
              id: '',
              name: '',
            },
            province: {
              id: '',
              name: '',
            },
            country: {
              id: '',
              name: '',
            },
            city: {
              id: '',
              name: '',
            },
            postal_code: '',
          },
          description: '',
          terms_condition: '',
          cancellation_policy: '',
          hashtag: '',
        },
        type: 'free',
        free_gifts: [],
      };
      this.is_loading = false;
    },

    selectVariant() {
      this.tempProduct.variant = this.tempVariantProd.combination_name;
      this.tempProduct.selectedCombinationId = this.tempVariantProd.combination_id;
      this.tempProduct.selectedCombinations = this.tempVariantProd;

      const data = this.tempProduct;
      const product = {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
        product_id: data.id,
        product_name: data.name,
        brand: {
          id: data.brand.id,
          name: data.brand.name,
        },
        combination_id: data.selectedCombinationId,
        variant: data.variant,
        quantity: 1,
      };

      if (this.is_ticket) {
        this.event.ticket = product;
      } else {
        this.tempProduct = product;
        this.event_free_gifts.products.push(this.tempProduct);
      }
    },

    addGift() {
      if (this.event_free_gifts.type.length && this.event_free_gifts.products.length) {
        this.event.free_gifts.push(this.event_free_gifts);
        this.event_free_gifts = { type: '', products: [] };
      } else {
        this.$toasted.global.error(`Type and Product is mandatory`);
      }
    },
    deleteAddedGift(key) {
      this.event.free_gifts.splice(key, 1);
    },
    deleteTicket() {
      this.event.ticket = { product_id: '', product_name: '' };
    },
    deleteSelectedProduct(key) {
      this.event_free_gifts.products.splice(key, 1);
    },
    addProduct(product) {
      this.is_ticket = false;
      if (product.combinations.length) {
        this.tempProduct = product;
        const prodComb = this.tempProduct.combinations.map((combi) => {
          return {
            ean: combi.ean_no,
            combination_name: String(Object.values(combi.attributes).map((x) => x.name)).replace(',', ' '),
            combination_id: combi._id,
          };
        });
        this.tempProduct.variants = prodComb;
        this.$refs.select_combinations.open();
      } else {
        this.formData.products.push(product);
      }
    },
    addTicketProduct(product) {
      this.is_ticket = true;
      if (product.combinations.length) {
        this.tempProduct = product;
        const prodComb = this.tempProduct.combinations.map((combi) => {
          return {
            ean: combi.ean_no,
            combination_name: String(Object.values(combi.attributes).map((x) => x.name)).replace(',', ' '),
            combination_id: combi._id,
          };
        });
        this.tempProduct.variants = prodComb;
        this.$refs.select_combinations.open();
      } else {
        this.formData.products.push(product);
      }
    },
    openProductDetail() {
      this.state.productDetailShow = true;
      this.options.isLoadMore = false;
      this.options.product = [];
    },
    searchProduct(productName) {
      console.log('typing: ', productName);
      if (!productName || productName.length < 3) {
        if (typeof source !== 'undefined') {
          this.searchIsLoading = false;
          source.cancel();
        }
        return;
      }
      this.options.keyword = productName;
      this.options.nextPage = 1;
      if (typeof source !== 'undefined') {
        source.cancel(false);
      }
      CancelToken = Axios.CancelToken;
      source = CancelToken.source();
      this.searchIsLoading = true;
      return Axios.get(BaseUrl + '/products', {
        params: {
          filter: {
            keyword: this.options.keyword,
          },
          skip: this.options.nextPage && this.options.nextPage !== 1 ? this.options.nextPage * 10 : 0,
          limit: 10,
        },
        cancelToken: source.token,
      })
        .then(
          function (response) {
            if (response.status === 200) {
              if (this.options.product.length) {
                this.options.product = [];
              }
              const res = response.data;
              if (res.data.length == 10) {
                this.options.isLoadMore = true;
              } else {
                this.options.isLoadMore = false;
              }
              this.options.product = res.data;
              this.searchIsLoading = false;
              if (this.options.product.length < 1 && this.options.isloadMore) {
                this.loadMoreProduct();
              }
            }
          }.bind(this)
        )
        .catch(
          function (error) {
            return false;
          }.bind(this)
        );
    },
    loadMoreProduct() {
      this.searchIsLoading = true;
      return Axios.get(BaseUrl + '/products', {
        params: {
          filter: {
            keyword: this.options.keyword,
          },
          skip: this.options.nextPage * 10,
          limit: 10,
        },
      }).then((response) => {
        if (response.status === 200) {
          this.options.nextPage++;
          this.searchIsLoading = false;
          if (response.data.data.length) {
            const res = response.data;

            if (res.data.length == 10) {
              this.options.isLoadMore = true;
            } else {
              this.options.isLoadMore = false;
            }
            this.options.product = [...this.options.product, ...res.data];
          } else {
            this.options.isLoadMore = false;
          }
        }
      });
    },
    imageError(e) {
      e.target.src = 'https://s3-ap-southeast-1.amazonaws.com/soc-newplatform/300x300.png';
    },
    removeArtc(key) {
      this.event.articles.splice(key, 1);
    },
    removeVideo(key) {
      this.event.videos.splice(key, 1);
    },
    removeCollection(key) {
      this.event.collections.splice(key, 1);
    },
    removeOrganizer(key) {
      this.event.organizers.splice(key, 1);
    },
    removeImage(key) {
      this.event.images.splice(key, 1);
    },
    removeGallery(key) {
      this.event.gallery.splice(key, 1);
    },
    addArticleLink(link) {
      this.convertRelatedLink(link)
        .then((resdata) => {
          if (resdata) {
            const payload = { ...resdata, url: link, id: resdata._id };
            this.event.articles = this.event.articles.concat(payload);
          } else {
            this.$toasted.global.error(`cant add related link`);
          }
          this.addrltdLink.article = '';
        })
        .catch((err) => {
          this.$toasted.global.error(`cant add related link`);
          this.addrltdLink.article = '';
        });
    },
    addVideoLink(link) {
      this.convertRelatedLink(link)
        .then((resdata) => {
          if (resdata) {
            const payload = { ...resdata, url: link, id: resdata._id };
            payload.attachments[0].url = `https://img.youtube.com/vi/${resdata.attachments[0].url}/hqdefault.jpg`;
            this.event.videos = this.event.videos.concat(payload);
          } else {
            this.$toasted.global.error(`cant add related link`);
          }
          this.addrltdLink.video = '';
        })
        .catch((err) => {
          this.$toasted.global.error(`cant add related link`);
          this.addrltdLink.video = '';
        });
    },
    addCollectionLink(link) {
      this.convertRelatedLink(link, true)
        .then((resdata) => {
          if (resdata.length) {
            const payload = {
              ...resdata[0],
              title: resdata[0].collection.title,
              id: resdata[0].collection._id,
            };
            this.event.collections = this.event.collections.concat(payload);
          } else {
            this.$toasted.global.error(`cant add related link`);
          }
          this.addrltdLink.collection = '';
        })
        .catch((err) => {
          this.$toasted.global.error(`cant add related link`);
          this.addrltdLink.collection = '';
        });
    },
    convertRelatedLink(link, collection = false) {
      let url = `/posts/url?url=${encodeURIComponent(link)}`;
      let params = {};
      if (collection) {
        url = `/newsfeeds`;
        params = { filter: { object_type: 'collection', _id: link } };
      }
      return Axios.get(BaseUrl + url, { params: params })
        .then((res) => {
          if (res.data.success && res.status == 200) {
            const resdata = res.data.data;
            return resdata;
          } else {
            this.$toasted.global.error(`failed, ${res.status}`);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    fileUpload: function (file) {
      let fileUrl;
      const randomNumb = Math.floor(Math.random() * 90000) + 10000;
      return Q.try(function () {
        return Axios.get(BaseUrl + '/pre-signed-url', {
          params: {
            fileName: randomNumb + '-' + file.name,
            contentType: 'multipart/form-data',
          },
        });
      })
        .then(function (response) {
          console.log(response);
          fileUrl = response.data.data.url;
          const temp_axios = Axios;
          delete temp_axios.defaults.withCredentials;
          // self.data.logo = response.data.data.url;
          return temp_axios.put(response.data.data.signedUrl, file, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        })
        .then((response) => {
          Axios.defaults.withCredentials = true;
          return fileUrl;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    imageUpload: async function (e, type) {
      const self = this;
      self.image = 'uploading';
      const files = e.target.files;
      try {
        files.forEach(async (element) => {
          const url = await this.fileUpload(element);
          if (type === 'gallery') {
            this.event.gallery.push({ url: url });
          } else {
            this.event.images.push({ media_type: 'image', url: url });
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    async csvUpload(e, type) {
      try {
        const file = e.target.files[0];
        const url = await this.fileUpload(file);
        this.event.event_participant_csv_url = url;
      } catch (error) {
        console.log(error);
      }
    },
    openAddressModal() {
      this.$refs.modal_address.open();
    },
    deleteOrganizer(idx) {
      this.event.organizers.splice(idx, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_detail';

#form-journal {
  width: 650px !important;
  float: left;
}
sup {
  color: red;
  font-size: 15px;
}

#form-right {
  float: left;
  margin-left: 50px;
}

.dropdown-item-select {
  img {
    height: 30px;
    margin-right: 10px;
  }
}

.title {
  line-height: 41px;
  font-family: 'lato-regular', sans-serif;
  font-size: 30px;
  text-transform: capitalize;
}

.detail-content {
  width: 700px;
}

.desc {
  float: left;
  max-width: 400px;
  text-align: justify;
}

.preview-image {
  float: right;
  max-width: 300px;
}

.content_add {
  display: inline-block;
}
.modal-body {
  position: relative;
  flex: 1 1 auto;
  padding: 48px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding-top: 10px;
  padding-left: 75px;
  padding-right: 75px;
}
.modal-header {
  display: inherit;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 0 solid #e9ecef;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.custom--input .modal--upload-picture .croppa-container,
.page--create-detail .modal--upload-picture .croppa-container {
  height: 460.8px;
  background-color: #00000014;
}
.fieldarea {
  margin: 0 auto;
  display: block;
  text-align: center;
}
.field.fieldinfo {
  color: #999999;
  position: relative;
  top: 47px;
}
h2.title {
  display: flex;
  text-align: left;
  font-size: 23px;
  width: 100%;
  height: 52px;
  border-radius: 5px;
  box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.5);
  background-color: #fff4f7;
  align-items: center;
  padding: 0 20px;
  margin: 20px 0;
}
.modal--upload-picture .modal-upload-foto-save {
  background-color: #f780a7;
  color: #fff;
  border-color: #f09ab9;
  padding: 6px 0;

  /* font-size: 12px; */
  letter-spacing: 0.43px;
  /* position: absolute; */
  position: absolute;
  top: 88%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin-top: 2%;
  width: 128px;
  opacity: 0.8;
}
.modal--upload-picture .modal-upload-foto-save:hover {
  color: #fff;
}

.label-post {
  color: #222 !important;
  font: 17px 'lato-regular', sans-serif !important;
  font-weight: bold !important;
  margin-bottom: 5px !important;
}
.form-address {
  .bt-wrp {
    display: flex;
    justify-content: flex-end;
    margin: 0;

    .button {
      width: auto;

      & + .button {
        margin-left: 0.75rem;
      }
    }
  }

  .btn-load {
    min-width: 60px;

    .loaderspinwrap {
      display: flex;
      align-items: center;
      justify-content: center;

      .loaderspin {
        width: 18px;
        height: 18px;
        border-width: 4px;
        margin: 0;
      }
    }
  }

  .form-wrapper-address {
    & + .form-wrapper-address {
      margin-top: 1.25rem;
    }

    label.control-label {
      font-weight: bold;
      margin-bottom: 0.5rem;

      display: block;

      &.title-cl {
        font-size: 18px;
        margin-bottom: 0.75rem;
      }
    }

    div[class^='col-xs'],
    div[class*=' col-xs'] {
      &:not(:last-child) {
        margin-bottom: 0.75rem;
      }
    }

    input[readonly] {
      background-color: #eaeaea;
    }
  }
}
</style>
