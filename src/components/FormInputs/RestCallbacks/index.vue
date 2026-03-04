<template>
  <div>
    <card section-name="REST API Custom Endpoints">
      <p class="text-muted small mb-3">
        Register custom REST API routes extending <code>WP_REST_Controller</code>. Generates typed PHP 8.2+ endpoint classes.
      </p>

      <div v-if="restCallbacks.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No endpoints yet. Click <strong>+ Add REST Endpoint</strong>.</p>
      </div>

      <div v-for="(ep, i) in restCallbacks" :key="i" class="wpgen-endpoint-item mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Namespace</label>
              <input
                type="text"
                class="form-control"
                :value="ep.namespace"
                placeholder="myplugin/v1"
                @input="update(i, 'namespace', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Route</label>
              <input
                type="text"
                class="form-control"
                :value="ep.route"
                placeholder="/items"
                @input="update(i, 'route', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2">
            <div class="form-group mb-0">
              <label>Class Name</label>
              <input
                type="text"
                class="form-control"
                :value="ep.className"
                placeholder="Auto-generated"
                @input="update(i, 'className', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(i)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <div class="row mt-2">
          <!-- Methods -->
          <div class="col-md-4">
            <label class="small font-weight-bold">HTTP Methods</label>
            <tags-input
              :value="ep.methods || ['GET']"
              :suggestions="httpMethods"
              placeholder="GET, POST…"
              @input="update(i, 'methods', $event)"
            />
          </div>
          <!-- Permission -->
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label class="small font-weight-bold">Capability</label>
              <autocomplete-input
                :value="ep.capability || 'read'"
                context-key="capability"
                placeholder="read"
                @input="update(i, 'capability', $event)"
              />
            </div>
          </div>
          <!-- Auth required -->
          <div class="col-md-2">
            <label class="small font-weight-bold d-block">Auth Required</label>
            <toggle-input
              :value="ep.authRequired === true"
              @input="update(i, 'authRequired', $event)"
            />
          </div>
        </div>

        <hr v-if="i < restCallbacks.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add REST Endpoint
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import TagsInput from '@/components/Common/TagsInput';
import AutocompleteInput from '@/components/Common/AutocompleteInput';
import ToggleInput from '@/components/Common/ToggleInput';
import { WP_REST_METHODS } from '@/utils/wp-autocomplete';

export default {
  name: 'RestCallbacksSection',
  components: { card, TagsInput, AutocompleteInput, ToggleInput },
  computed: {
    ...mapGetters(['restCallbacks']),
    httpMethods() { return WP_REST_METHODS; },
  },
  methods: {
    add() { this.$store.dispatch('addRestCallback'); },
    remove(i) { this.$store.dispatch('removeRestCallback', { index: i }); },
    update(i, key, value) { this.$store.dispatch('setRestCallbackData', { index: i, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-endpoint-item { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
