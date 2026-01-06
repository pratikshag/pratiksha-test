'use strict';

let MS_SOCO_PUBLIC_API_URL;
let MS_POS_API_URL;
let MS_SOCO_ADMIN_API_URL;
let MS_BJ_PUBLIC_API_URL;
let MS_BJ_ADMIN_API_URL;
let MS_SOCKET_API_URL;
let MS_SOCIOLLA_API_URL;
let MS_CATALOG_API_URL;
let SOCO_WEB_URL;
let SOCO_ADMIN_URL;
let BJ_WEB_URL;
let BJ_ADMIN_URL;
let REVIEW_WEB_URL;
let STORE_WEB_URL;
let SOCIOLLA_WEB_URL;
let SOCIOLLA_ADMIN_URL;
let MS_ORDER_API_URL;
let MS_CART_API_URL;
let MS_SSO_BROKER_API_URL;
let MS_SHIPPING_API_URL;
let MS_PAYMENT_API_URL;
let MS_SHIELD_AUTH_URL;
// let MS_SOCO_PUBLIC_API_LIST;
// let MS_BJ_PUBLIC_API_LIST;
let MS_ACCOUNTS_API_URL;
// let ENVIRONMENT;

const ENV_UAT = 'uat';
// const ENV_LOCAL = 'local';
// const ENV_LOYALTY = 'loyalty';
// const ENV_PAYMENT = 'payment';
// const ENV_REVIEW_REVAMP = 'review-revamp';
// const ENV_COLLECTION = 'gosend';

// change this key
const ENV = ENV_UAT;

if (ENV === 'local') {
  MS_SOCO_PUBLIC_API_URL = 'http://localhost:3001';
  MS_SOCO_ADMIN_API_URL = 'http://localhost:3041';
  MS_BJ_PUBLIC_API_URL = 'http://localhost:3051';
  MS_BJ_ADMIN_API_URL = 'http://localhost:3061';
  MS_SSO_BROKER_API_URL = 'http://localhost:4005';
  MS_CATALOG_API_URL = 'http://localhost:4000';
  MS_SOCKET_API_URL = 'http://localhost:5000';
  MS_SOCIOLLA_API_URL = 'http://localhost:3001';
  MS_ORDER_API_URL = 'http://localhost:4003';
  MS_CART_API_URL = 'http://localhost:4001';
  MS_POS_API_URL = 'http://localhost:3081';
  MS_PAYMENT_API_URL = '';
  MS_SHIPPING_API_URL = 'http://localhost:4002';

  SOCO_WEB_URL = 'http://localhost:8080';
  SOCO_ADMIN_URL = 'http://localhost:8081';
  BJ_WEB_URL = 'http://localhost:8082';
  BJ_ADMIN_URL = 'http://localhost:8084';
  REVIEW_WEB_URL = 'http://localhost:8085';
  STORE_WEB_URL = 'http://localhost:8086';
  SOCIOLLA_WEB_URL = 'http://localhost:8087';
  MS_ACCOUNTS_API_URL = `http://localhost:3021`;
  MS_SHIELD_AUTH_URL = 'http://localhost:5002';
} else {
  MS_SOCO_PUBLIC_API_URL = `https://${ENV}-ms-soco-public-api.sociolabs.io`;
  MS_ORDER_API_URL = `https://${ENV}-ms-orders.sociolabs.io`;
  MS_CART_API_URL = `https://${ENV}-ms-cart.sociolabs.io`;
  MS_SHIPPING_API_URL = `https://${ENV}-ms-shipping.sociolabs.io`;
  MS_SOCO_ADMIN_API_URL = `https://${ENV}-ms-soco-admin-api.sociolabs.io`;
  MS_BJ_PUBLIC_API_URL = `https://${ENV}-ms-bj-public-api.sociolabs.io`;
  MS_BJ_ADMIN_API_URL = `https://${ENV}-ms-bj-admin-api.sociolabs.io`;
  MS_CATALOG_API_URL = `https://${ENV}-ms-catalog.sociolabs.io`;
  MS_SOCKET_API_URL = `https://${ENV}-ms-socket.sociolabs.io`;
  MS_SOCIOLLA_API_URL = `https://${ENV}-ms-prestashop.sociolabs.io`;
  MS_PAYMENT_API_URL = `http://${ENV}-ms-payments.sociolabs.io`;
  MS_ACCOUNTS_API_URL = `https://${ENV}-ms-accounts.sociolabs.io`;
  MS_POS_API_URL = `https://${ENV}-ms-pos.sociolabs.io`;

  SOCO_WEB_URL = `https://${ENV}-soco-web.sociolabs.io`;
  SOCO_ADMIN_URL = `https://${ENV}-soco-admin.sociolabs.io`;
  BJ_WEB_URL = `https://${ENV}-bj-web.sociolabs.io`;
  BJ_ADMIN_URL = `https://${ENV}-bj-admin.sociolabs.io`;
  REVIEW_WEB_URL = `https://${ENV}-review-web.sociolabs.io`;
  STORE_WEB_URL = `https://${ENV}-store.sociolabs.io`;
  SOCIOLLA_WEB_URL = `https://${ENV}-sociolla-web.sociolabs.io`;
  SOCIOLLA_ADMIN_URL = `https://${ENV}-sociolla-admin.sociolabs.io`;
  MS_SSO_BROKER_API_URL = `https://${ENV}-ms-sso-broker.sociolabs.io`;
  MS_SHIELD_AUTH_URL = `https://${ENV}-ms-shield-auth.sociolabs.io`;
}

module.exports.default = {
  NODE_ENV: 'development',
  ENVIRONMENT: 'uat',

  MS_SOCO_PUBLIC_API_URL,
  MS_SOCO_ADMIN_API_URL,
  MS_SHIPPING_API_URL,
  MS_BJ_PUBLIC_API_URL,
  MS_BJ_ADMIN_API_URL,
  MS_CATALOG_API_URL,
  MS_SOCKET_API_URL,
  MS_SOCIOLLA_API_URL,
  MS_ORDER_API_URL,
  MS_CART_API_URL,
  MS_POS_API_URL,
  MS_PAYMENT_API_URL,
  MS_SSO_BROKER_API_URL,
  MS_ACCOUNTS_API_URL,

  SOCO_WEB_URL,
  SOCO_ADMIN_URL,
  BJ_WEB_URL,
  BJ_ADMIN_URL,
  REVIEW_WEB_URL,
  STORE_WEB_URL,
  SOCIOLLA_WEB_URL,
  SOCIOLLA_ADMIN_URL,

  MS_SOCO_PUBLIC_API_LIST: [MS_SOCO_PUBLIC_API_URL],
  MS_BJ_PUBLIC_API_LIST: [MS_BJ_PUBLIC_API_URL],
  MS_SHIELD_AUTH_URL,

  store_id: 5,
  store_lists: [
    { id: 5, value: 'KOKAS' },
    { id: 7, value: 'LMP' },
  ],
  consoleLogMode: false,
  OW_API_KEY: '59fed3396a52de044c2066984baafca6',
  GMAP_KEY: 'AIzaSyARdo3Ne0pwFgtY3cbNsX9kO7KT22bFqCM',
};
