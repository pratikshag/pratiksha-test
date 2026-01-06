<template>
  <li class="sidebar-link-group sidebar-link">
    <a
      href="#"
      target="_self"
      class="sidebar-link__router-link"
      :class="classObject"
      @click.stop.prevent="toggleMenuItem()"
    >
      <slot name="title"></slot>
      <i class="expand-icon fa fa-angle-down"></i>
    </a>
    <expanding>
      <ul v-show="expanded" ref="linkGroupWrapper" class="sidebar-submenu in">
        <slot></slot>
      </ul>
    </expanding>
  </li>
</template>

<script>
import Expanding from 'vue-bulma-expanding/src/Expanding';

export default {
  name: 'sidebar-link-group',
  components: {
    Expanding,
  },
  data() {
    return {
      expanded: this.expanded,
    };
  },
  computed: {
    classObject: function () {
      return {
        expanded: this.expanded,
      };
    },
  },
  watch: {
    $route(route) {
      this.expanded = false;
    },
  },
  mounted() {
    const linkGroup = this.$refs.linkGroupWrapper;
    if (linkGroup.querySelector('.router-link-active') !== null) {
      this.expanded = true;
    }
  },
  methods: {
    toggleMenuItem() {
      this.expanded = !this.expanded;
    },
  },
};
</script>

<style lang="scss">
$black-active: #313131;
$black-active-sub: #252525;
.sidebar-link .sidebar-link__router-link {
  height: 40px; // Height sidebar
  &.expanded {
    background-color: $black-active;
  }
  &.router-link-active {
    background-color: $black-active;
  }
}
.sidebar-link-group {
  .sidebar-link__router-link {
    .expand-icon {
      position: absolute;
      right: $sidebar-arrow-right;
      top: calc(50% - #{$font-size-root} / 2);
      font-weight: bold;
      transition: transform 0.3s ease;
    }
    &.expanded {
      .expand-icon {
        transform: rotate(180deg);
      }
    }
  }

  .sidebar-submenu {
    list-style: none;
    padding-left: 0;
    margin-top: 0;
    height: auto !important;
    li {
      display: block;
      padding-left: 0;
    }
    .sidebar-link__router-link {
      // height: $sidebar-submenu-link-height;
      height: 40px; // Height submenu sidebar
      // padding-left: $sidebar-submenu-link-pl;
      padding-left: 45px; // Padding left submenu sidebar
      font-size: $font-size-smaller;
      &.router-link-active {
        background-color: $black-active-sub;
      }
    }
  }
}

.expand-icon {
  color: $white;
}
</style>
