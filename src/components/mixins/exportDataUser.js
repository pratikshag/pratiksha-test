export const exportCsv = {
  data() {
    return {
      export_data: null,
      export_csv_content: '',
    };
  },
  methods: {
    setData(data) {
      return (this.export_data = data);
    },

    addData(data) {
      return (this.export_data = this.export_data ? this.export_data.concat(data) : data);
    },

    exportCsv(data, file_name = '') {
      const export_data = data || this.export_data;
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        Object.keys(export_data[0] || {}).join(',') +
        '\n' +
        (export_data || []).map((e) => Object.values(e).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${file_name ? file_name : 'export'}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
      return null;
    },
  },
};
