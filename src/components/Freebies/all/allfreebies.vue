<template>
  <div>
    <div class="sc-pagination">
      <h1 class="sc-pagination-label">Pagination</h1>
      <div class="sc-pagination-form">
        <input
          v-if="currentPage > 1"
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Prev"
          @click="pagination(currentPage - 1)"
        />
        <input
          v-model="currentPage"
          class="sc-pagination-input"
          type="number"
          min="1"
          :max="totalPage"
          name=""
          @keyup.enter.prevent="pagination(currentPage)"
        />
        <input
          v-if="totalPage > currentPage"
          class="sc-btn sc-btn-secondary sc-pagination-btn"
          type="submit"
          value="Next"
          @click="pagination(currentPage + 1)"
        />
      </div>
    </div>

    <div class="sc-filter">
      <div class="sc-filter-item">
        <label class="sc-filter-label">Search Freebies: </label>
        <input v-model="search" class="sc-filter-input" type="input" @keyup="searchQuery" />
      </div>
      <div class="sc-filter-item">
        <label class="sc-filter-label">Select Status: </label>
        <select v-model="status" name="cat" class="sc-filter-input">
          <option value="" selected>-- Select Status --</option>
          <option value="true">Active</option>
          <option value="false">Not Active</option>
        </select>
      </div>
      <div class="sc-filter-item sc-filter-button filter-button-container">
        <input
          type="submit"
          value="Filter"
          class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-mr-10"
          @click="applyFilter"
        />
        <router-link class="sc-btn sc-btn-secondary sc-btn-md sc-btn-rounded sc-uppercase" to="/freebies/add">
          Add Freebies
        </router-link>
      </div>
    </div>

    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr>
            <th>Freebie Image</th>
            <th>Freebie Name</th>
            <th>Type</th>
            <th>
              User Joined
              <sortField field="total_joined" :sort="sortingParam" @sort="doSort" />
            </th>
            <th style>
              Total Product
              <!-- <sortField field="product.size" :sort="sortingParam" @sort="doSort" /> -->
            </th>
            <th style>Status</th>
            <th>Freebies ID</th>
            <th width="140px">Action</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(allFreebies && allFreebies.length)" :cols="7" />

          <tr v-for="(freebies, k) in allFreebies" :key="k" style="text-align: center">
            <td class="image">
              <img
                v-if="freebies.banner"
                :src="freebies.banner"
                style="width: auto; height: 100px; object-fit: contain"
              />
            </td>
            <td class="title text-left">{{ freebies.title }}</td>
            <td class="type">{{ freebies.type }}</td>

            <td class="total user">{{ freebies.total_joined }}</td>
            <td class="total product">{{ freebies.products.length }}</td>
            <td
              v-if="freebies.is_active == true"
              class="status"
              :style="`text-transform:capitalize;color:${freebies.is_active == true ? 'green' : 'red'}`"
            >
              Active
            </td>
            <td
              v-else
              class="status"
              :style="`text-transform:capitalize;color:${freebies.is_active == true ? 'green' : 'red'}`"
            >
              Not Active
            </td>
            <td>
              <div class="freebies-id-container">
                <p>{{ freebies._id }}</p>
                <div class="copy-to-clipboard" @click="copyToClipboard(freebies._id)">
                  <i class="fa fa-clone" aria-hidden="true"></i>
                </div>
              </div>
            </td>
            <td class="actions">
              <div>
                <router-link :to="`/freebies/edit/${freebies._id}`">
                  <span title="Edit" aria-hidden="true" class="fa fa-pencil btn_edit"></span>
                </router-link>
                <span
                  title="Delete"
                  style="color: red"
                  aria-hidden="true"
                  class="fa fa-trash btn_delete"
                  @click="deleteFreebies(freebies._id)"
                ></span>
                <span
                  title="Duplicate"
                  style="position: relative; display: inline-block; cursor: pointer; color: pink; font-size: 16px; padding-left: 5px;"
                  @click="duplicateFreebies(freebies._id)"
                >
                  <i class="fa fa-clone" aria-hidden="true"></i>
                  <i class="fa fa-plus" 
                    aria-hidden="true" 
                    style="position: absolute; 
                            right: 1.5px; 
                            bottom: 2px; 
                            font-size: 9px; 
                            color: pink;
                            padding: 1px;
                            border-radius: 2px;">
                  </i>
                </span>
                <!-- <span
                  title="Export"
                  aria-hidden="true"
                  class="fa fa-arrow-up btn_delete"
                  v-on:click="showModal=true;freebies_id=freebies._id;freebiesInfo=freebies"
                ></span>-->
              </div>
              <!-- <div id="myModal" class="modal" v-if="showModal">
                <div class="modal-content">
                  <span v-on:click="showModal=false" class="close">&times;</span>
                  <p style="padding:5px 10px;">From:</p>
                  <input type="date" v-model="from" />
                  <p style="padding:5px 10px">To:</p>
                  <input type="date" v-model="to" />
                  <downloadexcel
                    class="button"
                    style="width: 200px"
                    :fetch="exportdata"
                    :fields="json_fields"
                    type="csv"
                  >Download Excel</downloadexcel>
                </div>
              </div>-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
import Axios from 'axios';
const Config = require('../../../../config/default.env');
// import downloadexcel from 'vue-json-excel';
import sortField from '@/components/ui/global/sortField';

export default {
  name: 'freebies-all',
  components: {
    // downloadexcel,
    sortField,
  },
  data() {
    return {
      sortingParam: '-created_at',
      allFreebies: [],
      showModal: false,
      is_loading: true,
      totalPage: 0,
      currentPage: 1,
      search: '',
      from: '',
      freebiesInfo: {},
      to: '',
      freebies_id: '',
      status: '',
      json_fields: {
        'Name Freebies': 'freebies_name',
        'Title Freebies': 'freebies_title',
        'User Name': 'user_name',
        'Points Value': 'freebies_points_value',
        'Date Used': 'created_at',
        'Redeem Code': 'redeem_code',
      },
    };
  },

  mounted() {
    this.getallFreebies();
    this.getCount();
  },
  methods: {
    buildFilter() {
      const filter = { is_deleted: false };
      if (this.search && this.search.trim() !== '') {
        filter.title = { $regex: this.search.trim(), $options: 'i' };
      }
      if (this.status !== '') {
        filter.is_active = this.status === 'true';
      }

      return filter;
    },
    applyFilter() {
      this.filterBystatus(this.status);
      this.getCount(this.buildFilter());
    },

    doSort(emitedVal) {
      this.sortingParam = emitedVal;
      this.getallFreebies();
      this.getCount();
    },
    // exportdata(from, to) {
    //   Axios.get(
    //     Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${freebies_id}/export`,
    //     {
    //       params: {
    //         skip: 0,
    //         limit: 10,
    //         sort: this.sortingParam
    //       }
    //     }
    //   )
    //     .then(response => {
    //       this.is_loading = false;
    //       console.log(response);
    //       if (response.status === 200) {
    //         this.allFreebies = response.data.data;
    //       }
    //     })
    //     .catch(err => {
    //       console.log(err);
    //       throw err;
    //     });
    // },
    getallFreebies() {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/freebies', {
        params: {
          skip: 0,
          limit: 10,
          sort: this.sortingParam,
          filter: { is_deleted: false },
        },
      })
        .then((response) => {
          this.is_loading = false;
          if (response.status === 200) {
            this.allFreebies = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },
    getCount: function (customFilter = null) {
      const filter = customFilter || { is_deleted: false };
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/freebies/count', {
        params: { filter: filter },
      }).then((response) => {
        this.is_loading = false;
        if (response.status == 200) {
          let count = parseInt(response.data.data);
          console.log(count);
          if (isNaN(count)) {
            count = 0;
          }
          this.totalPage = Math.ceil(count / 10);
          return count;
        }
      });
    },

    searchQuery(e) {
      if (e.keyCode === 13) {
        this.currentPage = 1;
        Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/freebies', {
          params: {
            filter: this.buildFilter(),
            skip: 0,
            limit: 10,
            sort: this.sortingParam,
          },
        })
          .then((response) => {
            this.is_loading = false;
            console.log(response);
            if (response.status === 200) {
              this.allFreebies = response.data.data;
            }
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      }
    },

    filterBystatus: function (status) {
      Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/freebies', {
        params: {
          filter: this.buildFilter(),
          skip: 0,
          limit: 10,
          sort: this.sortingParam,
        },
      })
        .then((response) => {
          this.is_loading = false;
          console.log(response);
          if (response.status === 200) {
            this.allFreebies = response.data.data;
          }
        })
        .catch((err) => {
          console.log(err);
          throw err;
        });
    },

    deleteFreebies: function (id) {
      const self = this;
      self.$dialog
        .confirm('Please confirm to continue')
        .then(function (dialog) {
          Axios.delete(Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${id}`).then((response) => {
            self.$toasted.global.show('Sucessfully delete freebies.');
            self.getallFreebies();
          });
        })
        .catch(function () {
          console.log('Clicked on cancel');
        });
    },

    // async exportdata() {
    //   const response = await Axios.get(
    //     Config.default.MS_SOCO_ADMIN_API_URL + `/freebies/${this.freebies_id}/export`,
    //     {
    //       params: {
    //         filter: {
    //           created_at: {
    //             $gte: this.from,
    //             $lte: this.end
    //           }
    //         }
    //       }
    //     }
    //   );
    //   let self = this;

    //   response.data.data.map(function(row) {
    //     row.freebies_name = self.freebiesInfo.name;
    //     row.freebies_title = self.freebiesInfo.title;
    //     row.freebies_points_value = self.freebiesInfo.points_value;
    //   });
    //   console.log(response.data.data);
    //   return response.data.data;
    // },

    pagination(page) {
      this.$Progress.start();

      page = parseInt(page);
      const skip = 10 * (page - 1);
      this.posts = {};
      return Axios.get(Config.default.MS_SOCO_ADMIN_API_URL + '/freebies', {
        params: {
          skip: skip,
          limit: 10,
          sort: this.sortingParam,
        },
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            this.$Progress.finish();
            this.allFreebies = response.data.data;
            this.currentPage = page;
            this.getCount();
          }
        })
        .catch((err) => {
          this.$Progress.fail();
          console.log(err);
          throw err;
        });
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$toasted.global.show(`${text} copied to clipboard`);
        return true;
      } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
      }
    },
    async duplicateFreebies(id) {
      try {
        this.$Progress.start();

        const response = await Axios.post(`${Config.default.MS_SOCO_ADMIN_API_URL}/freebies/${id}/duplicate`);

        if (response.status == 200) {
          await this.getallFreebies();
          await this.getCount();

          this.$Progress.finish();
          const duplicatedId = response.data.data._id;
          return this.$toasted.global.show(`Success duplicate freebies with id: ${duplicatedId}`);
        }
        this.$Progress.fail();
        this.$toasted.global.error('Something went wrong....');
      } catch (err) {
        this.$Progress.fail();
        return this.$toasted.global.error('Something went wrong....');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '_allfreebies';
</style>
