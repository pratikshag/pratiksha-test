import Vue from 'vue';

Vue.filter('slug', function (value) {
  if (typeof value === 'string') {
    let s = value.toLowerCase();
    s = s
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '-')
      .replace(/^-+|-+$/g, '');
    return s;
  }
  return null;
});

Vue.filter('currency', function (value) {
  const res = parseInt(value)
    .toString()
    .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return res == '0' ? '0' : res;
});

Vue.filter('downloadImage', function (value, name, prefix) {
  //https://stackoverflow.com/questions/17527713/force-browser-to-download-image-files-on-click
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = value;
  const fileName = image.src.split(/(\\|\/)/g).pop();
  prefix = prefix ? prefix : '';
  image.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = this.naturalWidth;
    canvas.height = this.naturalHeight;
    canvas.getContext('2d').drawImage(this, 0, 0);
    let blob;
    if (image.src.indexOf('.jpg') > -1) {
      blob = canvas.toDataURL('image/jpeg');
    } else if (image.src.indexOf('.png') > -1) {
      blob = canvas.toDataURL('image/png');
    } else if (image.src.indexOf('.gif') > -1) {
      blob = canvas.toDataURL('image/gif');
    } else {
      blob = canvas.toDataURL('image/png');
    }
    const link = document.createElement('a');
    link.href = blob;
    link.download = name ? prefix + Vue.options.filters.slug(name) : fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
});
