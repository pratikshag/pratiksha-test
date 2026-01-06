<template>
  <div class="ui-icons">
    <router-view :sets="sets"></router-view>
  </div>
</template>

<script>
const iconTypes = [
  'vuestic',
  'brandico',
  'entypo',
  'font-awesome',
  'fontelico',
  'iconic-stroke',
  'ionicons',
  'maki',
  'openweb',
];

export default {
  name: 'ui-icons',
  components: {},
  data() {
    return {
      setsPath: './sets/',
    };
  },
  computed: {
    sets() {
      const sets = [];
      iconTypes.forEach((iconType) => {
        const set = require('./sets/' + iconType + '.json');
        this.addfilteredListsTo(set);
        sets.push(set);
      });
      return sets;
    },
  },
  methods: {
    addfilteredListsTo(set) {
      const list = set.lists[0].icons;
      const filteredLists = [];
      filteredLists.push(list.slice(0, 6));
      filteredLists.push(list.slice(6, 8));
      filteredLists.push(list.slice(8, 14));
      set.filteredLists = filteredLists;
    },
  },
};
</script>

<style lang="scss"></style>
