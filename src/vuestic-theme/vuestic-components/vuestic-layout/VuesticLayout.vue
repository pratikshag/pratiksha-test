<template>
  <div class="layout"
       v-resize
       :class="classObject"
  >
    <slot></slot>
    <div class="content-wrap" id="content-wrap">
      <slot name="content"></slot>
    </div>
  <!--   <div class="made-by-footer">
      <slot name="footer"></slot>
    </div> -->
  </div>
</template>

<script>
import Resize from '../../../directives/ResizeHandler'

export default {
  name: 'vuestic-layout',

  props: {
    fixed: {
      type: Boolean,
      default: false,
    },
  },
  directives: {
    resize: Resize,
  },
  computed: {
    classObject: function () {
      return {
        'layout-fixed': this.fixed
      }
    }
  }
}
</script>

<style lang="scss">
  .layout {
    &-fixed {
      .content-wrap {
        padding-right: $layout-padding-right;
        padding-top: $sidebar-top;

        @include media-breakpoint-down(md) {
          padding: $content-mobile-wrap-fixed-layout;
          margin-left: 0;

        }
      }
    }

    .content-wrap {
      margin-left: calc(24px + 155px + 35px);
      transition: margin-left 0.3s ease;
      padding:75px 10px 8px 1px !important;
      overflow-x: hidden;

      .dashboard-info-widgets { padding-right: -12px; }
      .pre-loader {
        position: absolute;
        left: $vuestic-preloader-left;
        top: $vuestic-preloader-top;
      }

      @include media-breakpoint-down(md) {
        padding: 75px 10px 8px 10px !important;
        margin-left: 0;
        .sidebar-hidden & {
          margin-left: 0;
          padding-top: $content-mobile-wrap-sb-top;
        }
      }
    }
    .made-by-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding-top: 25px;
      padding-bottom: $made-by-footer-pb;
      position: absolute;
      bottom: 0;
      height: calc(#{$layout-padding} + #{$widget-mb});
      width: 100%;
    }
    .content {
    background: #f5f5f5 !important;
    border: 1px solid #E5E5E5;
    border-radius: 4px;
    padding: 22px !important;
   
}
  }
</style>
