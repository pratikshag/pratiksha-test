<template>
  <div class="line-maps-page">
    <div class="row">
      <div class="col-md-12">
        <vuestic-widget class="line-maps-page__widget" header-text="Line Maps">
          <line-map :map-data="lineMapData" />
        </vuestic-widget>
      </div>
    </div>
  </div>
</template>

<script>
import LineMap from './LineMap';
import LineMapData from 'data/maps/LineMapData';

export default {
  name: 'line-maps-page',
  components: {
    LineMap,
  },
  data() {
    return {
      lineMapData: LineMapData,
    };
  },
};
</script>

<style lang="scss">
.line-maps-page {
  &__widget {
    height: 70vh;
  }
}
</style>
