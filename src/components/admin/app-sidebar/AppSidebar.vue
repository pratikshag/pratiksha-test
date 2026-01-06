<template>
  <vuestic-sidebar :hidden="isOpen" :class="{ hidden: !isOpen }">
    <template slot="menu">
      <template v-for="(menu, i) in menu_permission">
        <sidebar-link-group v-if="menu.childs && menu.childs.length" :key="`group-${i}`">
          <span slot="title">
            <span :class="`sidebar-menu-item-icon ${getIconSidebar(menu)}`"></span>
            <span>{{ $t(menu.title) }}</span>
          </span>
          <sidebar-link v-for="(child, j) in menu.childs" :key="`child-${j}`" :to="{ name: child.key }">
            <span slot="title">
              <span>{{ $t(child.title) }}</span>
            </span>
          </sidebar-link>
        </sidebar-link-group>
        <sidebar-link v-else :key="`not-group-${i}`" :to="{ name: menu.key }">
          <span slot="title">
            <span :class="`sidebar-menu-item-icon ${getIconSidebar(menu)}`"></span>
            <span>{{ $t(menu.title) }}</span>
          </span>
        </sidebar-link>
      </template>
    </template>
  </vuestic-sidebar>
</template>

<script>
import VuesticSidebar from '../../../vuestic-theme/vuestic-components/vuestic-sidebar/VuesticSidebar';
import SidebarLink from './components/SidebarLink';
import SidebarLinkGroup from './components/SidebarLinkGroup';
import { mapGetters } from 'vuex';

export default {
  name: 'app-sidebar',
  components: {
    VuesticSidebar,
    SidebarLink,
    SidebarLinkGroup,
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    ...mapGetters({
      menu_permission: 'menuPermission',
    }),
  },
  watch: {
    'article.create': function () {
      if (this.article.create) {
        _.each(
          this.article.create,
          function (index, prop) {
            this.select.option.category.push(prop);
          }.bind(this)
        );
      }
    },
    'article.tags': function () {
      if (this.article.tags) {
        if (this.optionTags.length > 0) {
          this.optionTags.length = 0;
        }

        _.each(
          this.article.tags,
          function (obj, prop) {
            const newObj = {};
            newObj.name = obj.value;
            newObj.val = obj.data;

            this.optionTags.push(newObj);
          }.bind(this)
        );

        this.article.tags.length = 0;
      }
    },
    'temp.article_categories': function (newVal) {
      if (this.temp.article_categories) {
        if (this.select.option.subCategory) {
          this.select.option.subCategory.length = 0; // make array empty
        }

        _.each(
          this.article.create[newVal],
          function (obj, prop) {
            const data = {};
            data.name = obj.name.replace('&amp;', '&');
            data.value = obj.term_id;
            this.select.option.subCategory.push(data);
          }.bind(this)
        );
      }
    },
    'select.option.category': function () {
      if (this.select.option.category) {
        this.select.isDisabled.category = false;
      }
    },
    'select.option.subCategory': function () {
      if (this.select.option.subCategory) {
        this.select.isDisabled.subCategory = false;
      }
    },
    'uploadEditor.fileBaseString64': function (newVal) {
      if (this.uploadEditor.fileBaseString64) {
        const data = {};

        data.image_base64 = newVal;
        data.original_image = this.uploadEditor.fileName;
        const cropFile = this.dataURLtoFile(data.image_base64, data.original_image);
        let url = null;
        return Q.try(function () {
          return axios
            .get(Config.MS_SOCO_PUBLIC_API_URL + '/pre-signed-url', {
              params: {
                fileName: data.original_image,
              },
            })
            .then(function (response) {
              url = response.data.data.url;
              return Axios.put(response.data.data.signedUrl, cropFile, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
            });
        })
          .then((response) => {
            this.uploadEditor.Editor.insertEmbed(this.uploadEditor.cursorLocation, 'image', url);
            this.uploadEditor.resetUploader();
            //set state
            this.state.isProcess = false;
          })
          .catch((err) => {
            this.state.isProcess = false;
            console.log(err);
          });
      }
    },
    'dataArticle.article_content'() {
      if (
        this.dataArticle.article_content == '<p><br></p>' ||
        this.dataArticle.article_content == '<p><span class="ql-cursor">﻿</span></p>'
      ) {
        this.dataArticle.article_content = '';
      }
    },
  },
  updated() {
    // const tagging = $SO('.fieldarea--multiselect .multiselect__tag').length;
    const tagging = document
      .getElementsByClassName('sidebar-link__router-link')?.[0]
      ?.getElementsByClassName('expand-icon')?.[0]
      ? true
      : false;
    if (tagging) {
      this.toggleHeightMultiselect();
    }
  },
  methods: {
    getIconSidebar(menu) {
      if (menu.icon_type == 'vuestic') {
        return `vuestic-icon vuestic-icon-${menu.icon}`;
      } else if (menu.icon_type == 'ion') {
        return `ion ion-md-${menu.icon}`;
      } else if (menu.icon_type == 'fa') {
        return `fa fa-${menu.icon}`;
      }
      return '';
    },
    showImageUploader() {
      this.changeImage = true;
    },
    changeCoverImage(e) {
      const input = e.target;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.dataArticle.article_image = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
    },
    createArticle(scope) {
      let validateMethod;
      let validateMethodArgument;

      if (this.dataArticle.submit != 'draft') {
        // publish
        validateMethod = 'validateAll';
        validateMethodArgument = scope;
      } else {
        validateMethod = 'validate';
        validateMethodArgument = 'form-article.title';
      }

      this.$validator[validateMethod](validateMethodArgument).then((result) => {
        if (result) {
          let filterGlossary = '';
          let filterTag = '';
          let count = 0;
          const isDataClean = true;

          if (this.temp.article_categories === 'beauty') {
            this.dataArticle.article_categories = '1062';
          } else {
            // lifestyle
            this.dataArticle.article_categories = '7995';
          }

          // filter glossary
          filterGlossary = this.temp.article_glossary.value;
          this.dataArticle.article_glossary = filterGlossary;

          // filter tag
          _.each(
            this.temp.article_tag,
            function (obj, i) {
              if (this.temp.article_tag.length === 1) {
                filterTag += obj.val;
              } else if (this.temp.article_tag.length > 1) {
                if (count === 0) {
                  filterTag += obj.val + ',';
                } else if (this.temp.article_tag.length === count + 1) {
                  filterTag += obj.val;
                } else {
                  filterTag += obj.val + ',';
                }
              }

              count++;
            }.bind(this)
          );

          this.dataArticle.article_tags = filterTag;

          if (isDataClean) {
            Auth.article.create(this).then(() => {});
          }

          return;
        } else {
          this.$el.querySelector('[data-vv-id="' + this.$validator.errors.items[0].id + '"]').scrollIntoView();
        }
      });
    },
    fetchArticleCreate() {
      Content.article.create(this).then(() => {});
    },
    fetchTag() {
      Content.article.tags(this).then((response) => {});
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
    getTypeSubmit(val) {
      this.dataArticle.submit = val;
      this.dataArticle.article_status = val;
    },
    asyncFind(query) {
      this.tagsQuery = query;
      if (this.tagsQuery) {
        this.isLoading = true;
        this.fetchTag();
      }
    },
    clearAll() {
      this.optionTags.length = 0;
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
      const fileName = file.name;

      const cropFile = this.dataURLtoFile(this.croppa.generateDataUrl(), fileName);

      const data = new FormData();
      data.append('image', cropFile, fileName);

      this.isSaveCrop = true;
      let url = null;
      let key = null;
      return Q.try(function () {
        return axios
          .get(Config.MS_SOCO_PUBLIC_API_URL + '/pre-signed-url', {
            params: {
              fileName: fileName,
            },
          })
          .then(function (response) {
            url = response.data.data.url;
            key = Math.floor(1000000 * Math.random());
            return Axios.put(response.data.data.signedUrl, cropFile, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          });
      })
        .then((response) => {
          this.temp.article_image = url;
          this.dataArticle.article_image = key;
          this.showModal = false;
          this.isFileChoose = false;
          this.isSaveCrop = false;
          this.changeImage = false;
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
    toggleHeightMultiselect() {
      // const $fieldMultiselectEl = $SO('.fieldarea--multiselect');
      const $fieldMultiselectEl = document.getElementsByClassName('fieldarea--multiselect')?.[0];
      // const heigtWrap = $SO('.fieldarea--multiselect .multiselect__tags-wrap')[0].offsetHeight;
      const heigtWrap = document
        .getElementsByClassName('fieldarea--multiselect')?.[0]
        ?.getElementsByClassName('multiselect__tags-wrap')?.[0]
        ? document
            .getElementsByClassName('fieldarea--multiselect')[0]
            .getElementsByClassName('multiselect__tags-wrap')[0].offsetHeight
        : '';
      // $fieldMultiselectEl.css({ marginBottom: heigtWrap });
      if ($fieldMultiselectEl && heigtWrap) {
        $fieldMultiselectEl.style = `margin-bottom: ${heigtWrap}`;
      }
    },
    triggerUpload() {
      this.showImageUploader();
      this.fileSizeExceed = false;
      this.showModal = true;
    },
  },
};
</script>
<style lang="scss">
.vuestic-sidebar {
  &.hidden {
    display: none !important;
    visibility: hidden;
  }
}
</style>
