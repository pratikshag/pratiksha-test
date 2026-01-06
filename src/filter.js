import Vue from 'vue';
const moment = require('moment');
moment.locale('id');

Vue.filter('currency', function (value) {
  value = parseInt(value);
  const res = value.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

  return res === '0' ? '-' : res;
});

Vue.filter('currencyRp', function (value) {
  value = parseInt(value);
  const res = (value || 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.');

  return res === '0' ? 'Rp 0' : `Rp ${res}`;
});

Vue.filter('formatDate', function (value) {
  return moment(value).locale('en').format('DD MMMM YYYY');
});

Vue.filter('dMyyyy', function (value) {
  return moment(value).format('LL');
});

Vue.filter('dateType1', function (value) {
  return moment(value).tz('Asia/Jakarta').locale('en').format('D/M/YYYY HH:mm A');
});

const slug = function (value) {
  if (typeof value === 'string') {
    let s = value.toLowerCase();
    s = s
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '-')
      .replace(/^-+|-+$/g, '');
    return s;
  }

  return null;
};

Vue.filter('slug', slug);

Vue.filter('deslug', (value) => {
  return value
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
});

Vue.filter('ucwords', function (value) {
  return (value + '').toLowerCase().replace(/^(.)|\s+(.)/g, function ($1) {
    return $1.toUpperCase();
  });
});

Vue.filter('rating', function (value) {
  return Number(value).toFixed(1) * 10;
});

Vue.filter('productrating', function (value) {
  return Number(value.toFixed(1));
});

Vue.filter('stripHTML', function (value) {
  return value.replace(/<[^>]*>/gi, '').replace(/&[^;]*;/gi, ' ');
});

Vue.filter('relativeTime', function (value) {
  // return moment(value)

  if (moment().diff(moment(value), 'days') > 30) {
    return moment(value).format('DD MMM YYYY');
  } else {
    moment.updateLocale('en', {
      relativeTime: {
        future: '%s',
        past: '%s',
        s: 'Sekarang',
        ss: '%d menit',
        m: '1 menit',
        mm: '%d menit',
        h: '1 jam',
        hh: '%d jam',
        d: '1 hari',
        dd: '%d hari',
        M: '1 bulan',
        MM: '%d bulan',
        y: '1 tahun',
        yy: '%d tahun',
      },
    });
    return moment(value).fromNow();
  }
});

Vue.filter('trimRecentReviewContent', function (value) {
  return String(value).substr(0, 282) + '..';
});

Vue.filter('dateMonthYear', function (value) {
  return moment(value).format('DD MMM YYYY');
});

Vue.filter('productUrlReview', function (product) {
  return `/product/${
    product && product.brand ? slug(product.brand.name) : 'default'
  }/${product.id}-${slug(product.name)}`;
});

Vue.filter('generatedRatingTypeName', function (value) {
  const nameToLowerCase = value.toLowerCase();
  const removeWordIsStar = nameToLowerCase.replace('star_', '');
  const removeDash = removeWordIsStar.replace(/[_]/gi, ' ');
  return removeDash;
});

Vue.filter('serializeQS', function (obj) {
  const str = [];
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      const val = typeof obj[p] == 'object' ? JSON.stringify(obj[p]) : obj[p];
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(val));
    }
  }
  return str.join('&');
});

Vue.filter('generateSortingProduct', function (value) {
  const textSorting = value.toLowerCase();
  if (textSorting === 'most popular') {
    return '-review_stats.total_reviews';
  } else if (textSorting === 'newest') {
    return '-created_at';
  } else if (textSorting === 'oldest') {
    return 'created_at';
  } else if (textSorting === 'highest rating') {
    return '-review_stats.average_rating';
  } else {
    return 'review_stats.average_rating';
  }
});
