<template>
  <form class="form-inline mb-3" @submit.prevent="onSubmit">
    <ball-pulse-loader v-if="loading.config" color="#F083A6" size="10px" class="ml-2"></ball-pulse-loader>

    <template v-else-if="is_active">
      <label class="my-1 mr-3" for="range">Set Review Range</label>
      <div class="input-group mr-4">
        <input id="range" v-model.number="day_range" type="number" min="1" max="31" class="form-control" />
        <div class="input-group-append">
          <div class="input-group-text">days</div>
        </div>
      </div>

      <label class="my-1 mr-3" for="status">Sorting Data</label>
      <select id="status" v-model="sort_mode" class="custom-select mr-3">
        <option v-for="(item, index) in options" :key="index" :value="item.value" v-text="item.text"></option>
      </select>

      <button
        v-for="item in context.submit"
        :key="item.value"
        :value="item.value"
        class="btn btn-dark mr-2"
        type="submit"
        v-html="item.text"
      ></button>
    </template>

    <div v-if="!loading.config" class="form-check mx-2">
      <input id="active" v-model="active" class="form-check-input" type="checkbox" />
      <label class="form-check-label" for="active" v-html="context.active"></label>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'custom-form',

  data() {
    return {
      day_range: 10,
      sort_mode: 'random',
      is_active: false,
      //
      reset: {
        day_range: 10,
        sort_mode: 'random',
        is_active: false,
      },
      //
      options: [
        {
          text: 'Ascending',
          value: 'asc',
        },
        {
          text: 'Descending',
          value: 'desc',
        },
        {
          text: 'Random',
          value: 'random',
        },
      ],
      loading: {
        config: false,
        active: false,
      },
    };
  },

  computed: {
    active: {
      get() {
        return this.is_active;
      },
      set(value) {
        this.loading.active = true;
        this.putConfig({
          name: 'trending',
          payload: { is_active: value },
        }).then(({ data: { data } }) => {
          this.is_active = data.is_active;
          this.loading.active = false;
          this.init(true);
        });
      },
    },

    payload() {
      return {
        day_range: this.day_range,
        sort_mode: this.sort_mode,
      };
    },

    disabled() {
      return !this.is_active;
    },

    context() {
      return {
        active: this.loading.active ? '<i class="fa fa-spin fa-refresh"></i>' : this.is_active ? 'Active' : 'Inactive',
        submit: [
          {
            text: 'Save',
            value: 'save',
          },
          {
            text: 'Reset',
            value: 'reset',
          },
        ],
      };
    },
  },

  created() {
    this.init();
  },

  methods: {
    ...mapActions('products/featured', ['getConfig', 'putConfig']),

    init(isRefetch = false) {
      this.loading.config = true;
      this.getConfig({ name: 'trending' }).then(({ data: { data } }) => {
        if (Object.keys(data).length) {
          this.day_range = data.day_range;
          this.sort_mode = data.sort_mode;
          this.is_active = data.is_active;
        } else if (!data) {
          this.day_range = 10;
          this.sort_mode = 'random';
          this.is_active = false;
        }
        if (isRefetch) {
          this.$emit('submit', true);
        }
        this.loading.config = false;
      });
    },

    onSubmit(e) {
      if (e.submitter.value == 'save') {
        this.putConfig({
          name: 'trending',
          payload: this.payload,
        }).then(() => this.$emit('submit', false));
      } else {
        // reset
        this.day_range = this.reset.day_range;
        this.sort_mode = this.reset.sort_mode;
        this.init();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
form {
  background-color: #ddd;
  padding: 15px;

  .form-check-input {
    position: relative;
  }
}
</style>
