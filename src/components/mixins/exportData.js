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

    exportCsv(data, file_name = '', csv_url = '') {
      const export_data = csv_url || (!csv_url && (data || this.export_data));
      const escape = (val) => {
        if (val === null || val === undefined) {
          return '';
        }
        const str = String(val);
        if (/[",\n]/.test(str)) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const csvContent =
        !csv_url &&
        'data:text/csv;charset=utf-8,' +
          Object.keys(export_data[0] || {}).join(',') +
          '\n' +
          (export_data || [])
            .map((e) => {
              if (e.to_data && e.to_data < 0) {
                e.to_data = `${e.to_data} (adjusted to 0)`;
              }
              return Object.values(e).map(escape).join(',');
            })
            .join('\n');

      const encodedUri = csv_url || (!csv_url && csvContent && encodeURI(csvContent));
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${file_name ? file_name : 'export'}_${new Date().getTime()}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
      link.remove();
      return null;
    },
  },
};
