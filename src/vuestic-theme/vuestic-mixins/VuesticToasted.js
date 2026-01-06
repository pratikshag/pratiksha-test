import Toasted from 'vue-toasted'
import Vue from 'vue'

const toastOptions = {
  theme: 'none',
  position: 'top-center',
  className: 'vuestic-toast',
  iconPack: 'fontawesome',
  duration: 2500
}

Vue.use(Toasted, toastOptions)

export default {
  methods: {
    showToast (msg, options) {
      this.$toasted.global.show(msg, options)
    }
  }
}
