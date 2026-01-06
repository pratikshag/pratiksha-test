const config = require('@/../config/default.env').default;

// API Abstraction
export default class {
  constructor({ name = '', endpoint = '' } = {}) {
    this._name = config[name] || name;
    this._endpoint = endpoint;
  }

  get name() {
    return this._name;
  }

  set name(value) {
    this._name = config[value] || value;
  }

  get endpoint() {
    return this._endpoint;
  }

  set endpoint(value) {
    this._endpoint = value;
  }

  getData = ({ endpoint = this.endpoint, params = null } = {}) => axios.get(this.name + endpoint, { params });

  postData = ({ endpoint = this.endpoint, payload = null } = {}) => axios.post(this.name + endpoint, payload);

  putData = ({ endpoint = this.endpoint, payload = null } = {}) => axios.put(this.name + endpoint, payload);

  deleteData = ({ endpoint = this.endpoint } = {}) => axios.delete(this.name + endpoint);
}
