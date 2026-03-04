<template>
  <div class="wpgen-toggle" :class="{ 'is-checked': value }">
    <label class="toggle-label">
      <span class="toggle-track" @click="toggle">
        <span class="toggle-thumb"></span>
      </span>
      <input
        type="checkbox"
        :checked="value"
        class="sr-only"
        @change="toggle"
      />
      <span class="toggle-text">{{ value ? onLabel : offLabel }}</span>
    </label>
    <span v-if="helptext" class="form-help d-block text-muted small mt-1">{{ helptext }}</span>
  </div>
</template>

<script>
export default {
  name: 'ToggleInput',
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    onLabel: {
      type: String,
      default: 'Yes',
    },
    offLabel: {
      type: String,
      default: 'No',
    },
    helptext: {
      type: String,
      default: '',
    },
  },
  methods: {
    toggle() {
      this.$emit('input', !this.value);
      this.$emit('change', !this.value);
    },
  },
};
</script>

<style scoped>
.wpgen-toggle {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}
.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
.toggle-track {
  display: inline-block;
  width: 36px;
  height: 20px;
  background: #ccc;
  border-radius: 10px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.is-checked .toggle-track {
  background: #2271b1;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}
.is-checked .toggle-thumb {
  transform: translateX(16px);
}
.toggle-text {
  font-size: 13px;
  color: #3c434a;
  min-width: 28px;
}
</style>
