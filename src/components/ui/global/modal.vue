<template>
  <transition v-if="showModal" name="modal">
    <div @keyup.esc="closeModal()">
      <div class="overlay" :class="{ clickable: ClickOnOverlay }" @click="closeModal()"></div>
      <div class="content-wrapper modal-container">
        <div class="content">
          <slot name="body"> no content </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  props: {
    ClickOnOverlay: {
      type: Boolean,
      default: () => false,
      required: false,
    },
    scroll: {
      type: String,
      default: () => '',
      required: false,
    },
    ScrollOveride: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showModal: true,
      savedScrollTop: null,
    };
  },
  mounted() {
    this.showModal = true;
    // this.$store.dispatch('setModalOpen', true)
    document.addEventListener('keyup', this.onKeyEsc);
    this.handleScroll();
    if (!this.ScrollOveride) {
      document.body.classList.add('no-scroll');
    }
  },
  beforeDestroy() {
    document.documentElement.classList.remove('is-clipped');
    document.removeEventListener('keyup', this.onKeyEsc);
    this.showModal = false;
    // this.$store.dispatch('setModalOpen', false)
    document.body.classList.add('no-scroll');
  },
  methods: {
    onKeyEsc(e) {
      if (e.keyCode === 27) {
        this.closeModal();
      }
    },
    closeModal() {
      this.$emit('OverlayClicked');
    },
    handleScroll() {
      if (typeof window === 'undefined') {
        return;
      }

      if (this.scroll === 'clip') {
        if (this.showModal) {
          document.documentElement.classList.add('is-clipped');
        } else {
          document.documentElement.classList.remove('is-clipped');
        }
      }
    },
  },
};
</script>
