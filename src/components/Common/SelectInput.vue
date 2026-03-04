<template>
  <div :class="`col-md-${col}`">
    <div class="form-group">
      <label>{{ label }}</label>
      <span v-if="helptext" class="form-help d-block mb-1 text-muted small">{{ helptext }}</span>
      <select class="form-control" v-model="selected">
        <option v-if="placeholder" value="">{{ placeholder }}</option>
        <option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SelectInput',
  props: {
    col: {
      type: Number,
      default: 6,
    },
    label: {
      type: String,
      default: '',
    },
    helptext: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '— Select —',
    },
    /** String[] or { value, label }[] */
    options: {
      type: Array,
      default: () => [],
    },
    value: {
      type: String,
      default: '',
    },
  },
  computed: {
    normalizedOptions() {
      return this.options.map((o) =>
        typeof o === 'string' ? { value: o, label: o } : o
      );
    },
    selected: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
        this.$emit('change', val);
      },
    },
  },
};
</script>
