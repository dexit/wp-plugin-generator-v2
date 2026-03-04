<template>
  <div>
    <card section-name="Custom Post Types (CPT)">
      <div v-if="cpts.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No post types yet. Click <strong>+ Add Post Type</strong> to get started.</p>
      </div>

      <div v-for="(cpt, index) in cpts" :key="index" class="wpgen-cpt-item mb-3">
        <div class="row align-items-center">
          <div class="col-md-5">
            <div class="form-group mb-0">
              <label>Post Type Key</label>
              <autocomplete-input
                :value="cpt.postType"
                context-key="postType"
                placeholder="e.g. book, product"
                @input="update(index, 'postType', $event)"
              />
              <small class="text-muted">Lowercase, underscores only, max 20 chars</small>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Singular Label</label>
              <input
                type="text"
                class="form-control"
                :value="cpt.singularLabel"
                placeholder="e.g. Book"
                @input="update(index, 'singularLabel', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Plural Label</label>
              <input
                type="text"
                class="form-control"
                :value="cpt.pluralLabel"
                placeholder="e.g. Books"
                @input="update(index, 'pluralLabel', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-1 text-right mt-4">
            <button
              v-if="cpt.postType"
              type="button"
              class="btn btn-sm btn-outline-secondary mr-1"
              data-toggle="modal"
              :data-target="'#cpt-modal-' + index"
              title="Advanced Settings"
            >
              <i class="fas fa-cog"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              @click="removeCpt(index)"
              title="Remove"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Quick toggles -->
        <div v-if="cpt.postType" class="row mt-2">
          <div class="col-md-2">
            <label class="d-flex align-items-center gap-2">
              <toggle-input :value="cpt.showInRest !== false" @input="update(index, 'showInRest', $event)" />
              <span class="small">REST API</span>
            </label>
          </div>
          <div class="col-md-2">
            <label class="d-flex align-items-center gap-2">
              <toggle-input :value="cpt.hasArchive === true" @input="update(index, 'hasArchive', $event)" />
              <span class="small">Archive</span>
            </label>
          </div>
          <div class="col-md-2">
            <label class="d-flex align-items-center gap-2">
              <toggle-input :value="cpt.hierarchical === true" @input="update(index, 'hierarchical', $event)" />
              <span class="small">Hierarchical</span>
            </label>
          </div>
          <div class="col-md-2">
            <label class="d-flex align-items-center gap-2">
              <toggle-input :value="cpt.public !== false" @input="update(index, 'public', $event)" />
              <span class="small">Public</span>
            </label>
          </div>
        </div>

        <!-- Advanced Modal -->
        <div
          class="modal fade"
          :id="'cpt-modal-' + index"
          tabindex="-1"
          role="dialog"
        >
          <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">CPT Settings: {{ cpt.postType }}</h5>
                <button type="button" class="close" data-dismiss="modal"><span>&times;</span></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Class Name</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="cpt.className"
                        placeholder="Auto-generated from post type key"
                        @input="update(index, 'className', $event.target.value)"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>URL Slug</label>
                      <input
                        type="text"
                        class="form-control"
                        :value="cpt.slug"
                        :placeholder="cpt.postType || 'slug'"
                        @input="update(index, 'slug', $event.target.value)"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>Menu Icon</label>
                      <autocomplete-input
                        :value="cpt.menuIcon || 'dashicons-admin-post'"
                        context-key="menuIcon"
                        placeholder="dashicons-admin-post"
                        @input="update(index, 'menuIcon', $event)"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Menu Position</label>
                      <input
                        type="number"
                        class="form-control"
                        :value="cpt.menuPosition"
                        placeholder="5"
                        min="1"
                        @input="update(index, 'menuPosition', parseInt($event.target.value) || null)"
                      />
                    </div>
                  </div>
                  <div class="col-md-3">
                    <div class="form-group">
                      <label>Capability Type</label>
                      <select class="form-control" :value="cpt.capabilityType || 'post'" @change="update(index, 'capabilityType', $event.target.value)">
                        <option value="post">post</option>
                        <option value="page">page</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label>Supports</label>
                      <tags-input
                        :value="cpt.supports || ['title','editor','thumbnail']"
                        :suggestions="wpSupports"
                        placeholder="title, editor, thumbnail…"
                        @input="update(index, 'supports', $event)"
                      />
                    </div>
                  </div>
                  <div class="col-md-12">
                    <div class="form-group">
                      <label>Taxonomies</label>
                      <tags-input
                        :value="cpt.taxonomies || []"
                        :suggestions="wpTaxonomies"
                        placeholder="category, post_tag…"
                        @input="update(index, 'taxonomies', $event)"
                      />
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group">
                      <label>
                        <toggle-input :value="cpt.blockTemplate === true" @input="update(index, 'blockTemplate', $event)" />
                        Add Block Template
                      </label>
                      <small class="text-muted d-block">Adds a default paragraph block template</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-dismiss="modal">Done</button>
              </div>
            </div>
          </div>
        </div>

        <hr v-if="index < cpts.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addCpt">
          + Add Post Type
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import AutocompleteInput from '@/components/Common/AutocompleteInput';
import TagsInput from '@/components/Common/TagsInput';
import ToggleInput from '@/components/Common/ToggleInput';
import { WP_POST_SUPPORTS, WP_TAXONOMIES } from '@/utils/wp-autocomplete';

export default {
  name: 'CptSection',
  components: { card, AutocompleteInput, TagsInput, ToggleInput },
  computed: {
    ...mapGetters(['cpts']),
    wpSupports() {
      return WP_POST_SUPPORTS;
    },
    wpTaxonomies() {
      return WP_TAXONOMIES;
    },
  },
  methods: {
    addCpt() {
      this.$store.dispatch('addCpt');
    },
    removeCpt(index) {
      this.$store.dispatch('removeCpt', { index });
    },
    update(index, key, value) {
      this.$store.dispatch('setCptData', { index, key, value });
    },
  },
};
</script>

<style scoped>
.wpgen-cpt-item {
  border: 1px solid #e2e4e7;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}
.wpgen-empty-state {
  padding: 20px;
  text-align: center;
}
.gap-2 {
  gap: 8px;
}
</style>
