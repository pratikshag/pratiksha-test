<template src="./Login.html"></template>

<script>
import Axios from 'axios';
import oauth from 'sociolla-components/global/utils/oauth';
const Config = require('./../../../../config/default.env').default;

export default {
  name: 'auth-login',
  data() {
    return {
      loginData: {
        username: '',
        password: '',
        repassword: '',
        remember: '',
      },
      showLoader: false,
      authorizeUrl: '',
    };
  },
  mounted() {
    const url = this.prerepareAuthorizeUrl();
    this.authorizeUrl = url.href;
    this.$store.commit('setMessageLimit', false);
    this.$store.commit('setMessageLimitCount', '');
  },
  methods: {
    prerepareAuthorizeUrl: function () {
      const code_verifier = oauth.getCodeVerifier();
      const code_challenge = oauth.getCodeChallenge(code_verifier);
      const code_challenge_method = 'S256';
      const state = oauth.getOauthState();
      const baseURL = Config.MS_SHIELD_AUTH_URL;
      const path = '/oauth/authorize';
      const url = new URL(`${baseURL}${path}`);
      url.searchParams.set('code_verifier', code_verifier);
      url.searchParams.set('code_challange', code_challenge);
      url.searchParams.set('code_challenge_method', code_challenge_method);
      url.searchParams.set('state', state);
      return url;
    },
    loginWithShield() {
      window.location.href = this.authorizeUrl;
    },
    login: function () {
      this.showLoader = true;
      this.$Progress.start();

      // clear user data before call login, so expired token won't be attached in Bearer
      this.$store.commit('loggedIn', false);
      this.$store.commit('profileState', {});
      this.$store.dispatch('setMenu');

      return Axios.post(Config.MS_SOCO_ADMIN_API_URL + '/auth/login', {
        email: this.loginData.username,
        password: this.loginData.password,
      })
        .then((response) => {
          this.$Progress.finish();
          if (response.status == '200') {
            if (!response.data.data.user.is_admin_soco) {
              this.$toasted.global.show("You don't have permission to login ");
              this.$router.push('/login');

              this.showLoader = false;
            } else {
              this.$store.dispatch('setMenu', response.data.data.user);
              this.$store
                .dispatch('fetchSso')
                .then(() => this.$router.push('/'))
                .finally(() => (this.showLoader = false));
            }
          }
        })
        .catch((error) => {
          this.showLoader = false;
          if (error && error.response && error.response.status) {
            if (error.response.status === 401 && error.response.data.data.errorCode === 'INCORRECT_PASSWORD') {
              // INCORRECT_PASSWORD
              this.$toasted.global.error('Wrong password entered.');
            } else if (
              error.response &&
              error.response.status === 401 &&
              error.response.data.data.errorCode === 'Third_failed_login_attempt'
            ) {
              this.$toasted.global.error('Wrong password entered. Please click forget password');
              // this.$store.commit('setMessageLimit', true);
              // this.$store.commit('setMessageLimitCount', 3);
            } else if (
              error.response &&
              error.response.status === 401 &&
              error.response.data.data.errorCode === 'Fourth_failed_login_attempt'
            ) {
              this.$toasted.global.error(
                error.response.data.data.message ? error.response.data.data.message : 'Wrong password entered'
              );
              this.$store.commit('setMessageLimit', true);
              this.$store.commit('setMessageLimitCount', 4);
            } else if (
              error.response.status == 401 &&
              error.response.data.data.errorCode === 'ACCOUNT_LOCKED_FOR_TOO MANY_FAILED_ATTEMPTS!'
            ) {
              this.$toasted.global.error('Wrong password entered');
              this.$store.commit('setMessageLimit', true);
              this.$store.commit('setMessageLimitCount', 5);
            } else {
              this.$toasted.global.show("You don't have permission to login ");
            }
          }
          this.$Progress.fail();
          console.log(error);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
body {
  background: none !important;
  height: auto;
  .app {
    background: none !important;
    .login {
      width: 420px;
      margin: 0% auto !important;
      display: block;

      border: 1px solid #f5f5f5;
      .wrapper {
        margin: 50% auto !important;
        .information-slow-down {
          width: 100%;
          padding: 12px 16px;
          display: flex;
          align-items: flex-start;
          background-color: #fadae8;
          border-radius: 4px;
          margin: 0 0 16px 0;
          .img-svg {
            width: 25px;
            margin-right: 10px;
          }
          .desc {
            width: calc(100% - 40px);
            color: #000000;
            font: 12px/20px 'Lato', sans-serif;
            a,
            strong {
              color: #b32656;
            }
          }
        }
        .login-wrapper {
          padding: 30px;
          background: #fff;
          box-shadow: 0px 2px 6px #ccc;

          h2 {
            text-align: center;
            font-size: 25px;
            margin-bottom: 20px;
            font-family: 'lato-regular';
            letter-spacing: normal;
            text-transform: none !important;
          }
          button {
            background-color: rgb(240, 154, 185);
            box-shadow: 0px 0px 8px #f9f9f9;
            font-family: 'lato-regular';
            letter-spacing: normal;
            text-transform: none !important;
          }
        }
      }
    }
  }
  .down-container {
    margin-top: 3.125rem;
  }
  .btn-default {
    background-color: #ccc !important;
  }
}
.control-label {
  font-family: 'lato-regular';
  text-transform: none !important;
}
.control-label {
  font-family: 'lato-regular';
  text-transform: none !important;
}
</style>
