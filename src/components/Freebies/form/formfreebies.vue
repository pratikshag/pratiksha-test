<template>
  <div>
    <div>
      <div class="sc-form">
        <div v-if="freebies_id && freebies_id != ''" class="sc-form-title">Edit Freebies</div>
        <div v-else class="sc-form-title">Add Freebies</div>

        <router-link
          v-if="freebies_id"
          class="sc-btn sc-btn-md sc-btn-rounded sc-btn-secondary sc-mt-10 sc-mb-15 sc-uppercase"
          :to="{ name: 'freebies-participant', params: { id: freebies_id } }"
        >
          All Participant
        </router-link>

        <form id="form_category" class="sc-form-container">
          <div class="grouped-input">
            <div class="sc-form-title">Freebie Informations</div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Freebies Title</label>
              <input
                id="tag-name"
                v-model="formData.title"
                aria-required="true"
                name="tag-name"
                size="40"
                type="text"
                class="sc-form-input"
              />
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Freebies Type</label>
              <select v-model="formData.type" class="sc-form-input" name="cat">
                <option selected="selected" value>Select Freebies type</option>
                <option :value="'direct'">Direct</option>
                <option :value="'lottery'">Lottery</option>
              </select>
            </div>
            <div class="sc-form-group sc-form-group-full">
              <label class="sc-form-label" for="tag-name">Banner</label>
              <div
                :class="{ 'has-error': errors.has('form-article.image') }"
                class="block-upload-cover-image"
                style="width: auto; height: auto; flex: 1"
              >
                <p class="title">
                  <span class="wrapper">
                    <span class="label">UPLOAD BANNER/IMAGE</span>
                  </span>
                </p>
                <div class="layer">
                  <img v-if="formData.banner" :src="formData.banner" />
                  <p v-if="formData.banner">
                    <a style="color: black" @click.prevent="triggerUpload">Click here to change cover image</a>
                  </p>
                </div>
                <div v-show="!formData.banner" class="layer border-cover" @click.prevent="triggerUpload">
                  <div class="inner">
                    <img :src="require(`@/img/icon-upload-cover-image.png`)" />
                    <p>
                      Upload your cover image
                      <span class="required">*</span>Recommended size 825 x 297 px (max. 5MB)
                    </p>
                    <input v-model="formData.banner" class="hidden input-desktop" name="image" type="hidden" />
                  </div>
                </div>
                <p v-show="errors.has('form-article.image')" class="alert">{{ errors.first('form-article.image') }}</p>
              </div>
            </div>
            <div id="editorVue" class="sc-form-group sc-form-group-full">
              <label class="sc-form-label" for="tag-name">Terms and Conditions</label>
              <vue-editor
                id="editor"
                v-model="formData.terms_condition"
                :custom-modules="customModulesForEditor"
                :editor-options="editorSettings"
                :editor-toolbar="customToolbar"
                style="flex: 1"
                use-custom-image-handler
              ></vue-editor>
              <input v-model="formData.terms_condition" v-validate="'required'" name="articleText" type="hidden" />
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Quota</label>
              <input
                id="tag-name"
                v-model="formData.quota"
                aria-required="true"
                name="tag-name"
                size="40"
                type="number"
                class="sc-form-input"
              />
            </div>
            <div v-if="freebies_id" class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Available Quota</label>
              <input
                id="tag-name"
                v-model="formData.available_quota"
                aria-required="true"
                name="tag-name"
                size="40"
                type="number"
                class="sc-form-input"
              />
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Set Date</label>
              <div class="sc-form-group sc-form-group-full sc-row">
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">From</label>
                  <datetime
                    ref="datetime_start"
                    v-model="formData.start_date"
                    type="datetime"
                    input-style="overflow: hidden; flex: 1; display: block; width: 100%; padding-left: 10px;"
                    :auto="true"
                    :flow="['date', 'time']"
                  ></datetime>
                </div>
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">To</label>
                  <datetime
                    ref="datetime_end"
                    v-model="formData.end_date"
                    type="datetime"
                    input-style="overflow: hidden; flex: 1; display: block; width: 100%; padding-left: 10px;"
                    input-class="sc-form-input"
                    :auto="true"
                    :flow="['date', 'time']"
                  ></datetime>
                </div>
              </div>
            </div>
          </div>
          <div class="grouped-input">
            <div class="sc-form-title">User Criteria</div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Membership Level</label>
              <multiselect
                ref="multiselect"
                v-model="formData.user_rule.levels"
                :multiple="true"
                :options="listMemberLevel"
                :taggable="true"
                label="name"
                track-by="name"
                :close-on-select="false"
                :show-no-results="false"
                @open="onMultiselectOpen"
              >
                <!-- Custom footer with buttons -->
                <template #afterList>
                  <div class="multiselect-footer">
                    <div class="footer-buttons">
                      <button
                        class="sc-btn sc-btn-xs sc-btn-white sc-btn-rounded sc-uppercase"
                        type="button"
                        @click="selectAllMultiselect()"
                      >
                        Select All
                      </button>
                      <div class="action-buttons">
                        <button
                          class="sc-btn sc-btn-xs sc-btn-white sc-btn-rounded sc-uppercase"
                          type="button"
                          @click="closeMultiselect()"
                        >
                          Cancel
                        </button>
                        <button
                          class="sc-btn sc-btn-xs sc-btn-danger sc-btn-rounded sc-uppercase"
                          type="button"
                          @click="closeMultiselect(false)"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </multiselect>
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Age</label>
              <div class="sc-form-group sc-form-group-full sc-row">
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">From</label>
                  <input
                    v-model="formData.user_rule.age.llimit"
                    class="sc-form-input"
                    maxlength="3"
                    name="min age"
                    type="number"
                    value
                  />
                </div>
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">To</label>
                  <input
                    v-model="formData.user_rule.age.ulimit"
                    class="sc-form-input"
                    maxlength="3"
                    name="max age"
                    style="overflow: hidden; flex: 1; display: block; width: 100%"
                    type="number"
                    value
                  />
                </div>
              </div>
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Win Count</label>
              <div class="sc-form-group sc-form-group-full sc-row">
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">From</label>
                  <input
                    v-model="formData.user_rule.win_count.llimit"
                    class="sc-form-input"
                    maxlength="3"
                    name="min age"
                    style="overflow: hidden; flex: 1; display: block; width: 100%"
                    type="number"
                    value
                  />
                </div>
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">To</label>
                  <input
                    v-model="formData.user_rule.win_count.ulimit"
                    class="sc-form-input"
                    maxlength="3"
                    name="max age"
                    style="overflow: hidden; flex: 1; display: block; width: 100%"
                    type="number"
                    value
                  />
                </div>
              </div>
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Registration Date</label>
              <div class="sc-form-group sc-form-group-full sc-row">
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">From</label>
                  <datetime
                    ref="datetime_regis_start"
                    v-model="formData.user_rule.registration_date.llimit"
                    type="datetime"
                    input-style="overflow: hidden; flex: 1; display: block; width: 100%; padding-left: 10px;"
                    input-class="sc-form-input"
                    :auto="true"
                    :flow="['date', 'time']"
                  ></datetime>
                </div>
                <div class="sc-row-item">
                  <label class="sc-form-label" for="tag-category">To</label>
                  <datetime
                    ref="datetime_regis_end"
                    v-model="formData.user_rule.registration_date.ulimit"
                    type="datetime"
                    input-style="overflow: hidden; flex: 1; display: block; width: 100%; padding-left: 10px;"
                    input-class="sc-form-input"
                    :auto="true"
                    :flow="['date', 'time']"
                  ></datetime>
                </div>
              </div>
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">SKIN TYPE</label>
              <div class="multiselect-container">
                <multiselect
                  v-model="formData.user_rule.tags"
                  label="name"
                  track-by="_id"
                  :multiple="true"
                  :options="beautyTags"
                  placeholder="Select option"
                  class="skin-type-select"
                  @remove="removeTag"
                  @select="addTag"
                ></multiselect>
                <span class="select-all-link" @click="toggleSelectAll">
                  {{ areAllTagsSelected ? 'Remove All' : 'Select All' }}
                </span>
              </div>
            </div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Gender</label>
              <multiselect v-model="formData.user_rule.gender" multiple :options="gender" :custom-label="customLabel">
                <template slot="option" slot-scope="props">
                  {{ customLabel(props.option) }}
                </template>
              </multiselect>
            </div>
          </div>
          <div class="grouped-input">
            <div class="sc-form-title">Freebies Products</div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Cari Produk</label>
              <div
                id="product"
                :class="{ 'has-error': errors.has('product') }"
                class="sc-form-group sc-form-group-full"
                style="flex: 1"
              >
                <template v-if="!state.isSingleData">
                  <multiselect
                    :close-on-select="true"
                    :internal-search="false"
                    :loading="searchIsLoading"
                    :option-height="104"
                    :options="options.product"
                    :searchable="true"
                    :show-labels="false"
                    label="name"
                    name="product"
                    placeholder="Cari produk..."
                    track-by="name"
                    @search-change="searchProduct"
                    @select="addProduct"
                  >
                    <template slot="singleLabel" slot-scope="props">
                      <div class="product-list">
                        <!-- <img
                                                  class="product-list__img"
                                                  :src="((props.option.product_images.length && props.option.product_images[0].url != undefined && props.option.product_images[0].url)?props.option.product_images[0].url:'')"
                                                />-->
                        <div class="product-list__info">
                          <span
                            v-if="props.option.manufacture != undefined && props.option.manufacture.name != undefined"
                            class="product-list__title"
                            >{{ props.option.manufacture.name }}</span
                          >
                          <span v-if="props.option.name != undefined" class="product-list__small">{{
                            props.option.name
                          }}</span>
                        </div>
                      </div>
                    </template>
                    <template slot="option" slot-scope="props">
                      <div class="product-list">
                        <!-- <img
                                                  class="product-list__img"
                                                  :src="((props.option.product_images.length && props.option.product_images[0].url != undefined && props.option.product_images[0].url)?props.option.product_images[0].url:'')"
                                                />-->
                        <div class="product-list__info">
                          <span
                            v-if="props.option.manufacture != undefined && props.option.manufacture.name != undefined"
                            class="product-list__title"
                            style="margin-right: 10px"
                            >{{ props.option.manufacture.name }}</span
                          >
                          <span v-if="props.option.name != undefined" class="product-list__small">{{
                            props.option.name
                          }}</span>
                        </div>
                      </div>
                    </template>
                    <span slot="noResult"
                      >Oops! Hasil pencarian ini tidak ditemukan. Coba cari dengan keywords lain.</span
                    >
                    <span
                      v-if="searchIsLoading && options.isLoadMore"
                      slot="afterList"
                      class="nbtn vue-multiselect-load-more"
                      >Loading...</span
                    >
                    <span
                      v-if="options.isLoadMore && !searchIsLoading"
                      slot="afterList"
                      class="nbtn vue-multiselect-load-more"
                      @click="loadMoreProduct()"
                      >load more product</span
                    >
                  </multiselect>
                </template>
                <template v-else>
                  <div v-if="state.isProcessDetail">
                    <loaderspin text="Load product.."></loaderspin>
                  </div>
                </template>
                <p v-show="errors.has('product')" class="alert topright">{{ errors.first('product') }}</p>
              </div>
            </div>
            <div
              v-if="formData.products && formData.products.length > 0"
              class="products-row d-flex"
              style="
                flex-wrap: wrap;
                align-items: flex-start;
                justify-content: flex-start;
                position: relative;
                z-index: 0;
              "
            >
              <div v-for="(product, k) in formData.products" :key="k" class="product-wrapper">
                <a class="delete-btn" href @click.prevent="deleteSelectedProduct(k)">&#x274C;</a>
                <productcard :button-review="false" :product="product"></productcard>
              </div>
            </div>
          </div>
          <div class="grouped-input">
            <div class="sc-form-title">Related Content</div>
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Article Link</label>
              <input
                id="tag-name"
                v-model="addrltdLink.article"
                aria-required="true"
                name="tag-name"
                placeholder="Paste your link here..."
                size="40"
                type="text"
                class="sc-form-input sc-mb-10"
              />
              <div>
                <a
                  class="sc-btn sc-btn-md sc-btn-secondary sc-btn-rounded sc-uppercase"
                  href
                  @click.prevent="addArticleLink(addrltdLink.article)"
                  >Add link</a
                >
              </div>
            </div>
            <div
              v-if="formData.related_content.article && formData.related_content.article.length > 0"
              class="article-list"
            >
              <div v-for="(artc, key) in formData.related_content.article" :key="key" class="link-preview">
                <a class="delete-btn" href @click.prevent="removeArtc(key)">&#x274C;</a>
                <img :alt="artc.title" :src="artc.attachments[0].url" />
                <h4>{{ artc.title }}</h4>
              </div>
            </div>
            <hr />
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Video Link</label>
              <input
                id="tag-name"
                v-model="addrltdLink.video"
                aria-required="true"
                name="tag-name"
                placeholder="Paste your link here..."
                size="40"
                type="text"
                class="sc-form-input sc-mb-10"
              />
              <div>
                <a
                  class="sc-btn sc-btn-md sc-btn-secondary sc-btn-rounded sc-uppercase"
                  href
                  @click.prevent="addVideoLink(addrltdLink.video)"
                  >Add link</a
                >
              </div>
            </div>
            <div v-if="formData.related_content.bjtv && formData.related_content.bjtv.length > 0" class="article-list">
              <div v-for="(artc, key) in formData.related_content.bjtv" :key="key" class="link-preview">
                <a class="delete-btn" href @click.prevent="removeVideo(key)">&#x274C;</a>
                <img :alt="artc.title" :src="artc.attachments[0].url" />
                <h4>{{ artc.title }}</h4>
              </div>
            </div>
            <hr />
            <div class="sc-form-group">
              <label class="sc-form-label" for="tag-name">Glossary Link</label>
              <input
                id="tag-name"
                v-model="addrltdLink.glossary"
                aria-required="true"
                name="tag-name"
                placeholder="Paste your link here..."
                size="40"
                type="text"
                class="sc-form-input sc-mb-10"
              />
              <div>
                <a
                  class="sc-btn sc-btn-md sc-btn-secondary sc-btn-rounded sc-uppercase"
                  href
                  @click.prevent="addGlossaryLink(addrltdLink.glossary)"
                  >Add link</a
                >
              </div>
            </div>
            <div
              v-if="formData.related_content.bjglossary && formData.related_content.bjglossary.length > 0"
              class="article-list"
            >
              <div v-for="(artc, key) in formData.related_content.bjglossary" :key="key" class="link-preview">
                <a class="delete-btn" href @click.prevent="removeGlossary(key)">&#x274C;</a>
                <img :alt="artc.title" :src="artc.attachments[0].url" />
                <h4>{{ artc.title }}</h4>
              </div>
            </div>
          </div>

          <form-freebies-milestones
            v-if="isReady"
            ref="formFreebiesMilestones"
            :milestones-props="formData.milestones"
          />

          <div class="sc-form-group">
            <label class="sc-form-label">Enable</label>
            <select v-model="formData.is_active" class="sc-form-input">
              <option
                v-for="(opt, ke) in options.is_active"
                :key="ke"
                :selected="opt.value === formData.is_active"
                :value="opt.value"
              >
                {{ opt.text }}
              </option>
            </select>
          </div>
          <div class="sc-form-group">
            <label class="sc-form-label">Is SocoBox</label>
            <select v-model="formData.is_socobox" class="sc-form-input">
              <option
                v-for="(opt, ke) in options.is_active"
                :key="ke"
                :selected="opt.value === formData.is_socobox"
                :value="opt.value"
              >
                {{ opt.text }}
              </option>
            </select>
          </div>
          <div class="sc-form-group sc-mt-15">
            <div>
              <a
                class="sc-btn sc-btn-secondary sc-btn-rounded sc-btn-md sc-uppercase"
                href
                @click.prevent="saveFreebies()"
                >Save Freebies</a
              >
            </div>
          </div>
        </form>
      </div>
      <div v-if="showModal" id="undertone-modal" class="custom-modal modal-mask modal--upload-picture">
        <div slot="body">
          <div class="modal-body">
            <div class="modal-header">
              <h4 class="modal__heading">PILIH COVER IMAGE KAMU</h4>
              <span
                class="link modal-dismiss"
                @click="(showModal = false), (isFileChoosen = false), (fileSizeExceed = false)"
                >&times;</span
              >
            </div>
            <div class="croppa-wrapper">
              <croppa
                v-model="croppa"
                :accept="'image/jpg,image/jpeg,image/png'"
                :file-size-limit="5242880"
                :height="297"
                :placeholder="'Click here to upload an image'"
                :prevent-white-space="true"
                :width="825"
                initial-size="contain"
                @file-choose="onFileChoose"
                @file-size-exceed="onFileSizeExceed"
                @image-remove="(isFileChoosen = false), (fileSizeExceed = false)"
              ></croppa>
            </div>
            <div v-if="fileSizeExceed" class="field">
              <div class="fieldarea">
                <p class="alert">Ukuran maksimum 5MB</p>
              </div>
            </div>
            <a
              v-show="isFileChoosen"
              class="close button button-trans modal-upload-foto-save"
              href="#"
              @click.prevent="saveCrop"
              >SAVE</a
            >
            <div v-show="isFileChoosen" class="field fieldinfo">
              <div class="fieldarea">
                <p><i class="icon_lightbulb"></i> Atur foto kamu dengan scroll</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- SOC-55284
        <div class="grouped-input">
            <div class="title d-flex justify-content-between">
                <span>User List</span>
                <vue-json-to-csv :json-data="subscriberData" csv-title="Subscribers" :labels="{
                        user_name: { title: 'User Name' },
                        first_name: { title: 'First Name' },
                        last_name: { title: 'Last Name' },
                        email: { title: 'Email' },
                        phone: { title: 'Phone No' },
                        dateOfBirth: { title: 'Date of birth'},
                        province: { title: 'Province' },
                        city : { title: 'City' },
                        postal_code : { title: 'Postal Code' },
                        address : { title: 'Address' },
                        wonCampaign : { title: 'Total Won Campaign'},
                        wonSocoBox : { title: 'Total Won SocoBox'},
                        beautyProfile : { title: 'Beauty Profile'}
                    }"
                    >
                    <button class="rounded px-4 mt-2 py-1 btn-dark">
                        <b>Export</b>
                    </button>
                </vue-json-to-csv>
            </div>
        </div>
        <FreebiesSubscriber v-if="freebies_id" @data='freebiesSubscriber'/>
        -->
    <!-- SOC-48087 user list moved to "edit/:id/users" -->

    <Modal
      ref="select_combinations"
      :cancel-class="'btn btn-dark btn-sm'"
      :cancel-text="'No'"
      :force="true"
      :medium="true"
      :ok-class="'btn btn-danger btn-sm'"
      :ok-text="'Yes'"
      @ok="selectVariant()"
    >
      <div slot="title">Please Select Combinations</div>
      <template v-if="tempProduct && tempProduct.combinations">
        <div class="vuestic-radio-button form-check radio">
          <div v-for="(vari, k) in tempProduct.combinations" :key="k" class="abc-radio">
            <input
              :id="vari.ean"
              v-model="tempVariantProd"
              :name="vari.ean"
              :value="vari"
              class="form-check-input"
              type="radio"
            />
            <label :for="vari.ean" class="form-check-label">
              {{ vari.combination_name }} ({{ vari.soco_stock ?? 0 }} Pcs)
              <span v-if="!vari.soco_stock || Number(vari.soco_stock) <= 0" class="stock-empty-info">
                &nbsp; (You can still add this product even though it's out of stock.)
              </span>
            </label>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>
<script>
import Q from 'q';
import productcard from './productcard';
import axios from 'axios';
// import VueJsonToCsv from 'vue-json-to-csv';
import Vue from 'vue';
import { VueEditor } from 'vue2-editor';
import { ImageDrop } from 'quill-image-drop-module';
import { ImageResize } from '@/shared/package/quill-image-resize';
import FormFreebiesMilestones from './FormFreebiesMilestones';
import Croppa from 'vue-croppa';
import Multiselect from 'vue-multiselect';
import { Datetime } from 'vue-datetime';
import 'vue-datetime/dist/vue-datetime.css';
// import FreebiesSubscriber from "./FreebiesSubscriber";
import Modal from '@/vuestic-theme/vuestic-components/vuestic-modal/VuesticModal';

const Config = require('../../../../config/default.env').default;
const generateFormData = () => {
  return {
    title: '',
    banner: '',
    terms_condition: '',
    quota: 10,
    name: '',
    type: 'direct',
    user_rule: {
      levels: [],
      age: {
        ulimit: 40,
        llimit: 10,
      },
      win_count: {
        ulimit: 100,
        llimit: 0,
      },
      registration_date: {
        ulimit: '',
        llimit: '',
      },
      tags: [],
    },
    start_date: '',
    end_date: '',
    is_active: false,
    is_socobox: false,
    related_content: {
      article: [],
      bjtv: [],
      bjglossary: [],
    },
    products: [],
    milestones: [],
    tempLevels: [],
  };
};

let CancelToken;
let source;
Vue.use(Croppa);

export default {
  name: 'formfreebies',
  components: {
    Modal,
    // FreebiesSubscriber,
    Datetime,
    productcard,
    // ImageDrop,
    // ImageResize,
    VueEditor,
    Multiselect,
    FormFreebiesMilestones,
    // VueJsonToCsv,
  },
  data() {
    return {
      currentOpenDatetime: null,
      tempVariantProd: null,
      tempProduct: null,
      searchIsLoading: false,
      beautyTags: [],
      gender: ['Male', 'Female'],
      addrltdLink: {
        article: '',
        video: '',
        glossary: '',
      },
      // subcat_id: null,
      formData: generateFormData(),
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
      // item_id: "",
      // clicked: false,
      // showMsg: false,
      // msg: "",
      // clicked: false,
      // categories: [],
      showModal: false,
      // changeImage: false,
      isFileChoosen: false,
      fileSizeExceed: false,
      // allpartner: [],
      croppa: {},
      uploadEditor: {
        fileBaseString64: '',
        fileName: '',
        result: '',
        Editor: '',
        cursorLocation: '',
        resetUploader: '',
        errors: false,
      },
      isSaveCrop: false,
      changeImage: false,
      state: {
        isProcess: false,
        productDetailShow: false,
      },
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
      listMemberLevel: [],
      listFBSubscriber: [],
      isReady: false,
      // subscriberData: []
      allowManualClose: false,
    };
  },
  computed: {
    freebies_id() {
      return this.$route.params.id;
    },
    hasValid() {
      const {
        formData: {
          title,
          type,
          banner,
          terms_condition,
          quota,
          start_date,
          end_date,
          products,
          user_rule: {
            levels,
            age: { llimit, ulimit },
            tags,
          },
        },
      } = this;

      return [
        title,
        type,
        banner,
        terms_condition,
        quota,
        start_date,
        end_date,
        products,
        levels,
        tags,
        ulimit,
        llimit,
      ].every((item) => {
        if (Array.isArray(item)) {
          return item.length > 0;
        }

        return Boolean(item);
      });
    },
    areAllTagsSelected() {
      return (
        this.formData.user_rule.tags.length === this.beautyTags.length &&
        this.beautyTags.every((tag) => this.formData.user_rule.tags.some((selected) => selected._id === tag._id))
      );
    },
  },
  watch: {
    '$route.params.id': {
      handler(newval) {
        this.resetData();
        this.fetchBeautyTags();
        this.fetchMemberlevel();
        // this.fetchFBSubscriber();
        if (this.freebies_id) {
          this.fecthFreebiesById();
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.fetchBeautyTags();
    this.fetchMemberlevel();
    // this.fetchFBSubscriber();
    if (this.freebies_id) {
      this.fecthFreebiesById().finally(() => {
        this.isReady = true;
        this.$nextTick(() => {
          this.overrideMultiselectMethods();
          this.addNowButtonsToDatetime();
        });
      });

      return;
    }

    this.isReady = true;
    this.$nextTick(() => {
      this.overrideMultiselectMethods();
      this.addNowButtonsToDatetime();
    });
  },
  beforeDestroy() {
    // Restore original methods if they exist
    if (this.$refs.multiselect && this.originalDeactivate) {
      this.$refs.multiselect.deactivate = this.originalDeactivate;
    }
    if (this.$refs.multiselect && this.originalBlur) {
      this.$refs.multiselect.blur = this.originalBlur;
    }
    // Disconnect datetime observer
    if (this._datetimeObserver) {
      this._datetimeObserver.disconnect();
    }
  },
  methods: {
    toggleSelectAll() {
      if (this.areAllTagsSelected) {
        this.formData.user_rule.tags = [];
      } else {
        this.formData.user_rule.tags = [...this.beautyTags];
      }
    },
    selectVariant() {
      this.formData.products.push({
        ...this.tempProduct,
        combination_id: this.tempVariantProd['combination_id'],
      });
    },
    resetData() {
      this.formData = generateFormData();
    },
    deleteSelectedProduct(key) {
      this.formData.products.splice(key, 1);
    },
    addProduct(product) {
      if (product.combinations.length) {
        this.tempProduct = product;
        this.tempProduct.combinations = this.tempProduct.combinations.map((combi) => {
          return {
            ...combi,
            ean: combi.ean_no,
            combination_name: String(Object.values(combi.attributes).map((x) => x.name)).replace(',', ' '),
            combination_id: combi._id,
          };
        });
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
      CancelToken = axios.CancelToken;
      source = CancelToken.source();
      this.searchIsLoading = true;
      return axios
        .get(Config.MS_SOCO_ADMIN_API_URL + '/products', {
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
      return axios
        .get(Config.MS_SOCO_ADMIN_API_URL + '/products', {
          params: {
            filter: {
              keyword: this.options.keyword,
            },
            skip: this.options.nextPage * 10,
            limit: 10,
          },
        })
        .then((response) => {
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
    /*
            freebiesSubscriber(e){
                this.subscriberData = e.data.map(u => {
                    let userData = {}
                    userData.user_name = u.user.user_name
                    userData.first_name = u.user.first_name
                    userData.last_name = u.user.last_name
                    userData.email = u.user.email
                    userData.phone = u.address.phone
                    userData.dateOfBirth = u.user.date_of_birth
                    userData.province = u.address.province.name
                    userData.city = u.address.city.name
                    userData.postal_code = u.address.postal_code
                    userData.address = u.address.street1
                    userData.wonCampaign = u.win
                    userData.wonSocoBox = u.socoBox
                    userData.productReviewed = u.product_reviewed
                    userData.beautyProfile = u.user.profile
                    return userData
                })
            },
            */
    removeArtc(key) {
      this.formData.related_content.article.splice(key, 1);
    },
    removeVideo(key) {
      this.formData.related_content.bjtv.splice(key, 1);
    },
    removeGlossary(key) {
      this.formData.related_content.bjglossary.splice(key, 1);
    },
    addArticleLink(link) {
      this.convertRelatedLink(link)
        .then((resdata) => {
          if (resdata) {
            const payload = { ...resdata, url: link };
            this.formData.related_content.article = this.formData.related_content.article.concat(payload);
          } else {
            this.$toasted.global.error(`cant add related link`);
          }
          this.addrltdLink.article = '';
        })
        .catch((err) => {
          this.$toasted.global.error(`cant add related link`);
          this.addrltdLink.video = '';
        });
    },
    addVideoLink(link) {
      this.convertRelatedLink(link)
        .then((resdata) => {
          if (resdata) {
            const payload = { ...resdata, url: link };
            payload.attachments[0].url = `https://img.youtube.com/vi/${resdata.attachments[0].url}/hqdefault.jpg`;
            this.formData.related_content.bjtv = this.formData.related_content.bjtv.concat(payload);
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
    addGlossaryLink(link) {
      this.convertRelatedLink(link)
        .then((resdata) => {
          if (resdata) {
            const payload = { ...resdata, url: link };
            if (payload.attachments.length < 1) {
              payload.attachments.push({
                url: `https://uat-bj-web.sociolabs.io/assets/img/dummy_glossary.png`,
              });
            }
            if (!payload.summary) {
              payload.summary = this.$options.filters.stripHTML(payload.content).substr(0, 69) + '…';
            }
            this.formData.related_content.bjglossary = this.formData.related_content.bjglossary.concat(payload);
          } else {
            this.$toasted.global.error(`cant add related link`);
          }
          this.addrltdLink.glossary = '';
        })
        .catch((err) => {
          this.$toasted.global.error(`cant add related link`);
          this.addrltdLink.video = '';
        });
    },
    convertRelatedLink(link) {
      return axios
        .get(Config.MS_SOCO_ADMIN_API_URL + `/posts/url?url=${encodeURIComponent(link)}`)
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
    fetchMemberlevel() {
      const params = {
        filter: JSON.stringify({
          reward_name: { $in: ['new_user_level', 'level'] },
          slug: {
            $nin: [
              'first-clique',
              'fab-clique',
              'glam-clique',
              'royal-clique',
              'diamond-clique',
              'soco-member',
              'iconic-star',
              'ultimate-star',
            ],
          },
        }),
        skip: 0,
        limit: 15,
        sort: '-created_at',
      };
      axios.get(Config.MS_SOCO_ADMIN_API_URL + `/rewards`, { params: params }).then((res) => {
        if (res.data.success && res.status == 200) {
          const resdata = res.data.data;
          this.listMemberLevel = resdata;
        }
      });
    },
    removeTag(newTag) {
      console.log(newTag);
    },
    addTag(newTag) {
      console.log(newTag);
    },
    customLabel(value) {
      return value == 'Male' ? 'Laki-laki' : 'Perempuan';
    },
    fecthFreebiesById() {
      return axios
        .get(Config.MS_SOCO_ADMIN_API_URL + `/freebies/${this.freebies_id}`)
        .then((res) => {
          if (res.data.success && res.status == 200) {
            this.formData = res.data.data;
            if (!this.formData.user_rule.win_count) {
              this.formData.user_rule.win_count = {};
            }
            if (!this.formData.user_rule.registration_date) {
              this.formData.user_rule.registration_date = {};
            }
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
    fetchBeautyTags() {
      axios.get(Config.MS_SOCO_ADMIN_API_URL + '/tags?type=beauty-profile').then((res) => {
        if (res.data.success && res.status == 200) {
          const resdata = res.data.data;
          this.beautyTags = resdata.flatMap((bp) => {
            return bp.subtags;
          });
        }
      });
    },
    saveFreebies() {
      this.$Progress.start();
      const self = this;

      const payload = {
        ...self.formData,
        name: self.formData.title,
      };

      if (payload.products.length > 0) {
        payload.products = payload.products.map((product) => {
          return {
            id: product.id,
            name: product.name,
            combination_id: product.combination_id,
            image: product.product_images.length > 0 ? product.product_images[0].url : '',
          };
        });
      }

      const formFreebiesMilestones =
        this.$refs && this.$refs.formFreebiesMilestones && this.$refs.formFreebiesMilestones.getMileStones;
      if (formFreebiesMilestones && Array.isArray(formFreebiesMilestones)) {
        payload.milestones = formFreebiesMilestones;
      }

      if (!this.hasValid) {
        self.$Progress.fail();
        self.$toasted.global.show(
          'Freebies type, title, terms condition, loyalty points, thumbnail, product, quota, age, skin type must be set'
        );
        return;
      }

      const method = self.freebies_id ? 'put' : 'post';
      let url = Config.MS_SOCO_ADMIN_API_URL + `/freebies`;

      if (method === 'put') {
        url += `/${self.freebies_id}`;
      }

      return axios[method](url, payload)
        .then((response) => {
          if (response.status === 200) {
            this.$Progress.finish();
            this.$router.push('/freebies/all/');
            this.$toasted.global.show('Freebies berhasil disimpan.');
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          this.$toasted.global.show('Freebies gagal disimpan.');
          throw err;
        });
    },
    showImageUploader() {
      this.changeImage = true;
    },
    triggerUpload() {
      this.showImageUploader();
      this.fileSizeExceed = false;
      this.showModal = true;
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
      this.state.isProcess = true;
    },
    onFileSizeExceed(file) {
      this.fileSizeExceed = true;
      this.isFileChoosen = false;
    },
    onFileChoose() {
      this.isFileChoosen = true;
      this.fileSizeExceed = false;
    },
    saveCrop() {
      const file = this.croppa.getChosenFile();
      const fileName = file.name;

      const cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);
      //data.original_image = this.uploadEditor.fileName;
      const data = new FormData();
      data.append('file', cropFile);
      data.append('filename', fileName);

      this.isSaveCrop = true;
      const self = this;

      return Q.try(function () {
        return axios
          .get(Config.MS_SOCO_ADMIN_API_URL + '/pre-signed-url', {
            params: {
              fileName: fileName,
              contentType: 'multipart/form-data',
            },
          })
          .then(function (response) {
            const url = response.data.data.url;
            const temp_axios = axios;

            delete temp_axios.defaults.withCredentials;

            return temp_axios
              .put(response.data.data.signedUrl, cropFile, {
                headers: { 'Content-Type': 'multipart/form-data' },
              })
              .then((response) => {
                axios.defaults.withCredentials = true;

                self.formData.banner = url;

                self.showModal = false;
                self.isFileChoosen = false;
                self.isSaveCrop = false;
                self.changeImage = false;
              });
          });
      })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
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
    // because our vue-datetime not support Now button so we customize it
    addNowButtonsToDatetime() {
      // Add click listeners to datetime inputs to track which one is opened
      const datetimeRefs = ['datetime_start', 'datetime_end', 'datetime_regis_start', 'datetime_regis_end'];
      datetimeRefs.forEach((refName) => {
        const datetimeComponent = this.$refs[refName];
        if (datetimeComponent && datetimeComponent.$el) {
          const input = datetimeComponent.$el.querySelector('input');
          if (input) {
            input.addEventListener('focus', () => {
              this.currentOpenDatetime = refName;
            });
          }
        }
      });

      // Use MutationObserver to detect when datetime popup is added to DOM
      const observer = new MutationObserver(() => {
        const popup = document.querySelector('.vdatetime-popup');
        if (popup && !popup.querySelector('.vdatetime-popup__now-button')) {
          const actionsEl = popup.querySelector('.vdatetime-popup__actions');
          if (actionsEl) {
            const nowButton = document.createElement('div');
            nowButton.className = 'vdatetime-popup__now-button';
            nowButton.textContent = 'Now';
            nowButton.style.cssText =
              'position: absolute; left: 20px; bottom: 20px; cursor: pointer; color: #3f51b5; font-weight: 500;';

            nowButton.addEventListener('click', () => {
              const refName = this.currentOpenDatetime;
              const now = new Date().toISOString();

              if (refName === 'datetime_start') {
                this.formData.start_date = now;
              } else if (refName === 'datetime_end') {
                this.formData.end_date = now;
              } else if (refName === 'datetime_regis_start') {
                this.formData.user_rule.registration_date.llimit = now;
              } else if (refName === 'datetime_regis_end') {
                this.formData.user_rule.registration_date.ulimit = now;
              }

              this.$forceUpdate();

              setTimeout(() => {
                const cancelButton = popup.querySelector('.vdatetime-popup__actions__button--cancel');
                if (cancelButton) {
                  cancelButton.click();
                }
              }, 100);
            });

            actionsEl.style.position = 'relative';
            actionsEl.insertBefore(nowButton, actionsEl.firstChild);
          }
        }
      });

      // Start observing document body for datetime popup
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      // Store observer to disconnect later
      this._datetimeObserver = observer;
    },
    onMultiselectOpen() {
      this.tempLevels = [...this.formData.user_rule.levels];
    },
    closeMultiselect(isCancel = true) {
      this.allowManualClose = true;
      if (isCancel) {
        this.formData.user_rule.levels = [...this.tempLevels];
      }
      this.$refs.multiselect.deactivate();
    },
    selectAllMultiselect() {
      this.formData.user_rule.levels = [...this.listMemberLevel];
      this.allowManualClose = true;
      this.$refs.multiselect.deactivate();
    },
    overrideMultiselectMethods() {
      if (this.$refs.multiselect) {
        const multiselect = this.$refs.multiselect;
        // Store original methods
        this.originalDeactivate = multiselect.deactivate;
        this.originalBlur = multiselect.blur;
        // Override deactivate method
        multiselect.deactivate = () => {
          if (this.allowManualClose) {
            this.originalDeactivate.call(multiselect);
            this.allowManualClose = false;
          }
        };
        // Override blur method (handles outside clicks)
        multiselect.blur = () => {
          if (this.allowManualClose) {
            this.originalBlur.call(multiselect);
          }
        };
        // Override keydown handler
        const originalHandleKeydown = multiselect.keydown;
        multiselect.keydown = (e) => {
          // Prevent ESC key from closing
          if (e.key === 'Escape' && !this.allowManualClose) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (originalHandleKeydown) {
            originalHandleKeydown.call(multiselect, e);
          }
        };
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_formfreebies';

/deep/ .form-field.term-name-wrap,
/deep/ .form-field.term-slug-wrap {
  // z-index: 11;
  // position: relative;
  display: flex;
  margin: 20px auto;
  align-items: center;
}

/deep/ .form-field.form-required label::after {
  content: '*';
  color: red;
  margin-left: 8px;
}

/deep/ .form-field.term-slug-wrap label,
/deep/ .form-field.term-name-wrap label {
  margin-right: 20px;
  width: 140px;
}

.form-wrap h1 {
  font-size: 30px;
  margin-bottom: 30px;
}

input[type='date'],
input[type='number'],
input[type='password'],
input[type='search'],
input[type='text'],
select,
textarea {
  flex: 1;
  border: none;
  padding-left: 10px;
  height: 40px;
  border-radius: 4px;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
}

hr {
  border-top: 1px solid #b2b2b2;
}

a.nbtn.submit {
  position: relative;
  width: 124px;
  height: 40px;
  border-radius: 4px;
  background-color: #000000;
  display: flex;
  align-items: center;
  padding: 0;
  justify-content: center;
  margin-left: 5px;
  font-family: 'Lato-Bold' sans-serif;
  font-size: 13px;
  color: white;
  box-shadow: none;
}

.article-list {
  display: flex;
  flex-wrap: wrap;

  .link-preview {
    display: inline-block;
    width: 188px;
    margin: 10px 5px;
    background: white;
    position: relative;
    padding: 15px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    img {
      width: 188px;
      height: 107px;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    h4 {
      font-family: 'Lato-Bold' sans-serif;
      font-size: 12.6px;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      color: #000000;
      line-height: 17px;
      text-align: center;
      font-weight: normal;
    }
  }
}

.product-wrapper {
  position: relative;
  margin: 10px 5px;
  background: white;
  padding: 8px;
}

.abc-radio {
  display: flex;
  align-items: center;
  label.form-check-label {
    padding-left: 10px;
    font-size: 13px;
    color: black;
  }
}
.stock-empty-info {
  font: 700 14px/22px 'lato-bold', sans-serif;
  margin: 10px 0 0 0;
  color: #e34a4a;
}
.multiselect-container {
  display: flex;
  align-items: center;
  gap: 15px;

  .skin-type-select {
    flex: 1;
  }

  .select-all-link {
    color: #f5a5b8;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    align-self: center;
    text-align: center;
    line-height: 1.2;

    &:hover {
      color: darken(#f5a5b8, 10%);
    }
  }
}
.multiselect-footer {
  border-top: 1px solid #e8e8e8;
  background-color: #f8f9fa;
  padding: 12px;
  position: sticky;
  bottom: 0px;
}

.footer-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Override multiselect default styles if needed */
.multiselect {
  min-height: 40px;
}

.multiselect__content-wrapper {
  border-bottom: none;
}

.multiselect__content {
  max-height: 200px;
  position: relative;
}

/* Ensure footer stays at bottom */
.multiselect__element:last-child {
  border-bottom: none;
}
</style>
