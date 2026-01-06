'use strict';

let MS_SOCO_PUBLIC_API_URL;
let MS_BJ_PUBLIC_API_URL;
let MS_SOCIOLLA_API_URL;
let MS_SOCO_ADMIN_API_URL;
let MS_BJ_ADMIN_API_URL;
let MS_SOCKET_API_URL;
// let MS_SOCO_PUBLIC_API_LIST;
// let MS_BJ_PUBLIC_API_LIST;

const ENV_UAT = 'uat';
// const ENV_LOCAL = 'local';
// const ENV_LOYALTY = 'loyalty';
// const ENV_PAYMENT = 'payment';
// const ENV_REVIEW_REVAMP = 'review-revamp';

// change this key
const ENV = ENV_UAT;

if (ENV === 'local') {
  MS_SOCO_PUBLIC_API_URL = `http://localhost:3001/`;
  MS_BJ_PUBLIC_API_URL = `http://localhost:3051/`;
  MS_SOCIOLLA_API_URL = `http://localhost:3001/`;
  MS_SOCO_ADMIN_API_URL = `http://localhost:3041/`;
  MS_BJ_ADMIN_API_URL = `http://localhost:3061/`;
  MS_SOCKET_API_URL = `http://localhost:5000/`;
} else {
  MS_SOCO_PUBLIC_API_URL = `https://${ENV}-soco-public-api.sociolabs.io`; //, - no slash
  MS_SOCO_ADMIN_API_URL = `https://${ENV}-soco-admin-api.sociolabs.io`; //,- no slash
  MS_BJ_PUBLIC_API_URL = `https://${ENV}-bj-public-api.sociolabs.io`; //, - no slash
  MS_BJ_ADMIN_API_URL = `https://${ENV}-bj-admin-api.sociolabs.io`; //, - no slash
  MS_SOCKET_API_URL = `https://${ENV}-websocket.sociolabs.io`; //, - no slash
  MS_SOCIOLLA_API_URL = `https://${ENV}-ms-prestashop.sociolabs.io`; //, - no slash
}

export default {
  // module.exports = {
  NODE_ENV: 'development',

  MS_SOCO_PUBLIC_API_URL,
  MS_BJ_PUBLIC_API_URL,
  MS_SOCIOLLA_API_URL,
  MS_SOCO_ADMIN_API_URL,
  MS_BJ_ADMIN_API_URL,
  MS_SOCKET_API_URL,

  DOMAIN_LIST: [MS_SOCO_PUBLIC_API_URL],
  DOMAIN_LIST_BJ_PUBLIC: [MS_BJ_PUBLIC_API_URL],

  SOCO_WEB_URL: `https://${ENV}-soco-web.sociolabs.io`,
  SOCO_ADMIN_URL: `https://${ENV}-soco-admin.sociolabs.io`,
  BJ_WEB_URL: `https://${ENV}-bj-web.sociolabs.io`,
  BJ_ADMIN_URL: `https://${ENV}-bj-admin.sociolabs.io`,
  REVIEW_WEB_URL: `https://${ENV}-review-web.sociolabs.io`,
  STORE_WEB_URL: `https://${ENV}-store.sociolabs.io`,
  SOCIOLLA_WEB_URL: `https://${ENV}-sociolla.sociolabs.io`,
  MS_SOCO_PUBLIC_API_LIST: [MS_SOCO_PUBLIC_API_URL],
  MS_BJ_PUBLIC_API_LIST: [MS_BJ_PUBLIC_API_URL],

  store_id: 18,
  consoleLogMode: false,
  OW_API_KEY: '59fed3396a52de044c2066984baafca6',
};
