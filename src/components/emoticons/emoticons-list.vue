<style src="./emoticons-list.scss" lang="scss" scoped></style>
<template>
  <div class="emoticons">
    <ball-pulse-loader v-if="is_loading" class="emoticons__loader" color="#000000" size="20px"></ball-pulse-loader>
    <div class="sc-pagination-row between">
      <div class="sc-filter">
        <div class="sc-filter-item" style="width: 50%">
          <label class="sc-filter-label">Search: </label>
          <input v-model="search" class="sc-filter-input" type="text" @keyup="getEmoticons(true)" />
        </div>
      </div>
      <div class="sc-pagination">
        <div class="sc-pagination-form">
          <input class="sc-btn sc-btn-secondary sc-pagination-btn" type="submit" value="Prev" @click="prevPage" />
          <input
            v-model="page"
            class="sc-pagination-input"
            type="number"
            min="1"
            name=""
            @keyup.enter.prevent="getEmoticons()"
          />
          <input class="sc-btn sc-btn-secondary sc-pagination-btn" type="submit" value="Next" @click="nextPage" />
        </div>
      </div>
    </div>
    <div class="sc-table-responsive">
      <table class="sc-table">
        <thead>
          <tr class="head">
            <th>
              NAME
              <sortField v-show="!is_loading" field="name" :sort="sortParam" @sort="sort" />
            </th>
            <th>IMAGE</th>
            <th>
              TYPE
              <sortField v-show="!is_loading" field="type" :sort="sortParam" @sort="sort" />
            </th>
            <th>
              STATUS
              <sortField v-show="!is_loading" field="type" :sort="sortParam" @sort="sort" />
            </th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          <TableEmpty v-if="!is_loading && !(emoticons && emoticons.length)" :cols="5" />

          <tr v-for="(emoji, index) in emoticons" :key="index" class="body">
            <td>{{ emoji.name }}</td>
            <td>
              <img v-if="emoji.image" :src="emoji.image" />
            </td>
            <td>{{ emoji.type }}</td>
            <td>{{ emoji.is_active ? 'Active' : 'Inactive' }}</td>
            <td>
              <div>
                <button class="emoticons__table-row-action" @click="editEmoticon(emoji)">
                  <i class="ion ion-md-create"></i>
                  <span>Edit</span>
                </button>
                <br />
                <button class="emoticons__table-row-action" @click="confirmDelete(emoji._id)">
                  <i class="ion ion-ios-trash"></i>
                  <span>Delete</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="sc-pagination">
      <div class="sc-pagination-form">
        <input class="sc-btn sc-btn-secondary sc-pagination-btn" type="submit" value="Prev" @click="prevPage" />
        <input
          v-model="page"
          class="sc-pagination-input"
          type="number"
          min="1"
          name=""
          @keyup.enter.prevent="getEmoticons()"
        />
        <input class="sc-btn sc-btn-secondary sc-pagination-btn" type="submit" value="Next" @click="nextPage" />
      </div>
    </div>
    <modal
      ref="edit_modal"
      :medium="true"
      :ok-text="'Save'"
      :ok-class="'sc-btn sc-btn-md sc-btn-rounded sc-btn-primary sc-mb-15'"
      :cancel-text="'Discard'"
      :cancel-class="'sc-btn sc-btn-md sc-btn-rounded sc-btn-secondary sc-mb-15'"
      @ok="saveEmoticon()"
    >
      <div slot="title">Modify emoticon</div>
      <form class="sc-form">
        <div class="sc-form-container sc-form-center">
          <div class="sc-form-group">
            <label class="sc-form-label" for="emoji_name">Name</label>
            <input
              id="emoji_name"
              v-model="edit_emoticon.name"
              class="sc-form-input"
              name="emoji_name"
              type="text"
              placeholder="for example - :haha:"
              required
            />
          </div>
          <div class="sc-form-group">
            <label class="sc-form-label" for="emoji_type">Type</label>
            <select id="emoji_type" v-model="edit_emoticon.type" class="sc-form-input" name="emoji_type" required>
              <option value="birthday_sticker">Birthday Sticker</option>
              <option value="gif_sticker">GIF Sticker</option>
              <option value="pink_moji">Pink-moji</option>
            </select>
          </div>
          <div class="sc-form-group">
            <label class="sc-form-label" for="emoji_status">Status</label>
            <select
              id="emoji_status"
              v-model="edit_emoticon.is_active"
              class="sc-form-input"
              name="emoji_status"
              required
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </modal>
    <modal
      ref="delete_modal"
      :medium="true"
      :force="true"
      :ok-text="'Yes'"
      :ok-class="'btn btn-danger btn-sm'"
      :cancel-text="'No'"
      :cancel-class="'btn btn-dark btn-sm'"
      @ok="deleteConfirmed()"
    >
      <div slot="title">Please confirm</div>
      <div>Are you sure you want to delete this emoticon?</div>
    </modal>
  </div>
</template>
<script src="./emoticons-list.js"></script>
