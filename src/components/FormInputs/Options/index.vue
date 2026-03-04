<template>
  <div>
    <card section-name="Options API">
      <p class="text-muted small mb-3">
        Define plugin options. Generates a typed <code>Options</code> class with getter/setter/deleter for each key.
      </p>

      <div v-if="options.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No options yet. Click <strong>+ Add Option</strong>.</p>
      </div>

      <div
        v-for="(opt, i) in options"
        :key="i"
        class="row align-items-center mb-2"
      >
        <div class="col-md-3">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="opt.key"
            placeholder="option_key"
            @input="update(i, 'key', $event.target.value)"
          />
        </div>
        <div class="col-md-2">
          <select class="form-control form-control-sm" :value="opt.type || 'text'" @change="update(i, 'type', $event.target.value)">
            <option value="text">text (string)</option>
            <option value="number">number (int)</option>
            <option value="checkbox">checkbox (bool)</option>
            <option value="float">float</option>
          </select>
        </div>
        <div class="col-md-2">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="opt.default"
            placeholder="Default value"
            @input="update(i, 'default', $event.target.value)"
          />
        </div>
        <div class="col-md-3">
          <input
            type="text"
            class="form-control form-control-sm"
            :value="opt.description"
            placeholder="Description"
            @input="update(i, 'description', $event.target.value)"
          />
        </div>
        <div class="col-md-1">
          <div class="d-flex align-items-center">
            <toggle-input
              :value="opt.autoload === true"
              on-label="Auto"
              off-label="No"
              @input="update(i, 'autoload', $event)"
            />
          </div>
          <small class="text-muted d-block" style="font-size:10px">Autoload</small>
        </div>
        <div class="col-md-1 text-right">
          <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(i)">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Option
        </button>
      </div>
    </card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import card from '../card';
import ToggleInput from '@/components/Common/ToggleInput';

export default {
  name: 'OptionsSection',
  components: { card, ToggleInput },
  computed: {
    ...mapGetters(['options']),
  },
  methods: {
    add() {
      this.$store.dispatch('addOption');
    },
    remove(i) {
      this.$store.dispatch('removeOption', { index: i });
    },
    update(i, key, value) {
      this.$store.dispatch('setOptionData', { index: i, key, value });
    },
  },
};
</script>

<style scoped>
.wpgen-empty-state {
  padding: 20px;
  text-align: center;
}
</style>
