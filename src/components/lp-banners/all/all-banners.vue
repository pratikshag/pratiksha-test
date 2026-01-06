<template>
  <div class="banners">
    <ball-pulse-loader v-if="is_loading" class="banners__loader" color="#000000" size="20px"></ball-pulse-loader>
    <router-link class="sc-btn sc-btn-primary sc-btn-floating" :to="{ name: 'add-lp-banners' }">
      <i class="ion-md-add ion"></i>
    </router-link>

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
        <label class="sc-filter-label">Search: </label>
        <input v-model="search" class="sc-filter-input" type="input" @keyup="searchQuery" />
      </div>
    </div>
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr class="head">
            <th>ID</th>
            <th>NAME</th>
            <th>IMAGE</th>
            <th>STATUS</th>
            <th>ORDER</th>
            <th>TYPE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(allBanners && allBanners.length)" :cols="7" />

          <tr v-for="(banner, index) in allBanners" :key="index" class="body">
            <td>{{ banner._id.substring(18, 24) }}</td>
            <td>{{ banner.name }}</td>
            <td>
              <a :href="banner.url" target="_blank">
                <img v-if="banner.image" :src="banner.image" />
              </a>
            </td>
            <td>{{ banner.status | capitalize }}</td>
            <td>{{ banner.order }}</td>
            <td>{{ banner.screen_type }}</td>
            <td>
              <div>
                <router-link class="banners__table-row-action" :to="`/loyalty-point-banners/edit/${banner._id}`">
                  <i class="ion ion-md-create"></i>
                  <span>Edit</span>
                </router-link>
                <br />
                <button class="banners__table-row-action" @click="confirmDelete(banner._id)">
                  <i class="ion ion-ios-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <modal
      ref="modal"
      :medium="true"
      :force="true"
      :ok-text="'Yes'"
      :ok-class="'btn btn-danger btn-sm'"
      :cancel-text="'No'"
      :cancel-class="'btn btn-dark btn-sm'"
      @ok="deleteConfirmed()"
    >
      <div slot="title">Please confirm</div>
      <div>Are you sure you want to delete this banner?</div>
    </modal>
  </div>
</template>
<script src="./all-banners.js"></script>
<style src="./all-banners.scss" lang="scss" scoped></style>
