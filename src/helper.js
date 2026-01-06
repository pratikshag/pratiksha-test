const Config = require('./../config/default.env').default;
import store from './app.store';

const restrictionCheck = (role) => {
  // User role can be multiple
  const userRole =
    store.getters.userRole && store.getters.userRole.includes(',')
      ? store.getters.userRole.split(',')
      : store.getters.userRole;
  // add superadmin as it have same access as admin
  if (role == 'admin') {
    role = ['superadmin', role];
  }
  if (Array.isArray(role) && role.indexOf('admin') >= 0) {
    role.push('superadmin');
  }

  if (typeof role == 'string') {
    if (typeof userRole === 'string' && role === userRole) {
      return true;
    } else if (typeof userRole === 'object' && userRole.indexOf(role) >= 0) {
      return true;
    } else {
      return false;
    }
  } else if (typeof role == 'object') {
    if (typeof userRole === 'string' && role.indexOf(userRole) >= 0) {
      return true;
    } else if (typeof userRole === 'object' && userRole.find((ur) => role.indexOf(ur))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const usernameCheck = (username) => {
  if (typeof username == 'string' && username == store.getters.userName) {
    return true;
  } else {
    return false;
  }
};

const dateFormat_dmY = (dateString, saparator = '/') => {
  let dataObj = new Date();
  if (dateString) {
    dataObj = new Date(dateString);
  }

  let dd = dataObj.getDate();
  let mm = dataObj.getMonth() + 1; //January is 0!

  const yyyy = dataObj.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return dd + saparator + mm + saparator + yyyy;
};

const dateFormat_Ymd = (dateString, saparator = '/') => {
  let dataObj = new Date();
  if (dateString) {
    dataObj = new Date(dateString);
  }

  let dd = dataObj.getDate();
  let mm = dataObj.getMonth() + 1; //January is 0!

  const yyyy = dataObj.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return yyyy + saparator + mm + saparator + dd;
};

const dateFormat_mdY = (dateString, saparator = '/') => {
  let dataObj = new Date();
  if (dateString) {
    dataObj = new Date(dateString);
  }

  let dd = dataObj.getDate();
  let mm = dataObj.getMonth() + 1; //January is 0!

  const yyyy = dataObj.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }

  return mm + saparator + dd + saparator + yyyy;
};

export const maskEmail = (email) => {
  if (!email) {
    return '';
  }
  const parts = email.split('@');
  if (parts.length !== 2) {
    return email;
  }

  const username = parts[0];
  const domain = parts[1];
  if (username.length < 8) {
    const maskedUsername = username.substring(0, 3) + '*'.repeat(username.length - 3);
    return maskedUsername + '@' + domain;
  }
  const maskedUsername = username.substring(0, 3) + '****' + username.substring(7);
  return maskedUsername + '@' + domain;
};

export const maskPhone = (phoneE164, phoneNo) => {
  if (!phoneNo) {
    return phoneE164 || '';
  }

  const cleanPhoneNo = phoneNo.toString().replace(/\D/g, '');

  if (cleanPhoneNo.length < 7) {
    return phoneE164 || phoneNo;
  }

  const maskedPhoneNo = cleanPhoneNo.substring(0, 3) + '****' + cleanPhoneNo.substring(7);

  if (phoneE164) {
    const phoneCodeLength = phoneE164.length - cleanPhoneNo.length;
    const phoneCode = phoneE164.substring(0, phoneCodeLength);
    return phoneCode + maskedPhoneNo;
  }

  return maskedPhoneNo;
};

export const maskPhoneSimple = (phone_no) => {
  if (!phone_no) {
    return '';
  }

  const cleanPhone = phone_no.toString().replace(/\D/g, '');

  if (cleanPhone.length < 7) {
    return phone_no;
  }

  return cleanPhone.substring(0, 3) + '****' + cleanPhone.substring(7);
};
export const maskBirthday = (birthday) => {
  if (!birthday) {
    return '';
  }
  birthday = birthday.trim();
  const separator = birthday.includes('-') ? '-' : birthday.includes('/') ? '/' : birthday.includes('.') ? '.' : null;

  if (!separator) {
    return birthday;
  }

  const parts = birthday.split(separator);
  if (parts[0].length === 4) {
    return `${parts[0]}${separator}**${separator}**`;
  }
  if (parts[2].length === 4) {
    return `**${separator}**${separator}${parts[2]}`;
  }
  return birthday;
};

const slugify = (string) => {
  const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;';
  const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------';
  const p = new RegExp(a.split('').join('|'), 'g');
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with ‘and’
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple — with single -
    .replace(/^-+/, ''); // Trim — from start of text .replace(/-+$/, '') // Trim — from end of text
};

const $_forceDownload = ({ url = '', name = 'download' } = {}) =>
  fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = objectUrl;
      anchor.setAttribute('download', name);

      document.body.appendChild(anchor); // firefox

      anchor.click();
      anchor.remove();
    });

const $_deepClone = (payload) => JSON.parse(JSON.stringify(payload)); // deep clone

const $_file = (url) => ({
  name: url.substr(url.lastIndexOf('/') + 1),
  get type() {
    return this.name.split('.').pop();
  },
});

const $_userLink = (username) => `${Config.SOCO_WEB_URL}/${username}`;

export default {
  restrictionCheck,
  usernameCheck,
  dateFormat_dmY,
  slugify,
  dateFormat_Ymd,
  dateFormat_mdY,
  maskEmail,
  maskPhone,
  maskBirthday,
  maskPhoneSimple,

  /**
   * "$_" prefix for custom private properties in a plugin, mixin, etc that should not be considered public API
   * {@link https://vuejs.org/v2/style-guide/#Private-property-names-essential}
   */

  $_forceDownload,
  $_deepClone,
  $_file,
  $_userLink,
};
