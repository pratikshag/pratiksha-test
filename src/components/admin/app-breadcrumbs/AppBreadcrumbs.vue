<template>
  <div class="row">
    <div class="col-md-12">
      <vuestic-widget class="no-padding no-v-padding">
        <vuestic-breadcrumbs :breadcrumbs="breadcrumbs" :current-path="currentRoute" />
      </vuestic-widget>
    </div>
  </div>
</template>

<script>
import Breadcrumbs from './Breadcrumbs';

export default {
  name: 'app-breadcrumbs',
  props: {
    breadcrumbs: {
      type: Object,
      default: function () {
        return Breadcrumbs;
      },
    },
  },
  computed: {
    upperCamelcase(name) {
      return name
        .replace(/\s(.)/g, function ($1) {
          return $1.toUpperCase();
        })
        .replace(/\s/g, '')
        .replace(/^(.)/, function ($1) {
          return $1.toLowerCase();
        });
    },
    currentRoute() {
      return this.upperCamelcase(this.$route.name);
    },
  },
};
</script>
