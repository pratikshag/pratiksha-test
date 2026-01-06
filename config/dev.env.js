'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: 'development',
  SITE_SOCO: 'http://localhost:3001/',
  SITE_SOCIOLLA: 'https://sociolla-uat.sociolabs.io',
  SITE_REVIEW: 'https://review-uat.sociolabs.io',
  // SITE_JOURNAL: 'https://beautyjournal-uat.sociolabs.io'
  SITE_JOURNAL_ADMIN: 'http://localhost:3061/',
});
