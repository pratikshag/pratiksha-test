import Axios from 'axios';
import store from './../app.store';
import router from './../router';
import { get } from 'lodash';

export default function setup() {
  // Add request interceptors
  Axios.interceptors.request.use(
    (config) => {
      config.headers['SOC-PLATFORM'] = window.innerWidth > 1100 ? 'soco-admin-desktop' : 'soco-admin-mobile';

      const token = store.getters.dashboardToken;

      if (token && !config.url.includes('amazonaws.com')) {
        config.headers['Authorization'] = 'Bearer ' + token;
      }

      return config;
    },
    function (error) {
      // Do something with request error
      return Promise.reject(error);
    }
  );

  // Add response interceptors
  Axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (get(error, 'response.status', '') == 401) {
        console.log('unauthorized!');
        router.push('/login');
      }
      return Promise.reject(error);
    }
  );
}
