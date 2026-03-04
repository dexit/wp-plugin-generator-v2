<template>
  <div>
    <card section-name="Email Handlers">
      <p class="text-muted small mb-3">
        Register typed email handler methods using <code>wp_mail()</code>.
        Generates an <code>Emails</code> class with individual send methods per email type.
      </p>

      <div v-if="emails.length === 0" class="wpgen-empty-state">
        <p class="text-muted">No emails yet. Click <strong>+ Add Email</strong>.</p>
      </div>

      <div v-for="(email, ei) in emails" :key="ei" class="wpgen-email-item mb-3">
        <div class="row align-items-end">
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Method Name</label>
              <input
                type="text"
                class="form-control"
                :value="email.method"
                placeholder="send_welcome"
                @input="update(ei, 'method', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label>Subject</label>
              <input
                type="text"
                class="form-control"
                :value="email.subject"
                placeholder="Welcome to our site!"
                @input="update(ei, 'subject', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-0">
              <label>Template File</label>
              <input
                type="text"
                class="form-control"
                :value="email.template"
                placeholder="welcome.php"
                @input="update(ei, 'template', $event.target.value)"
              />
            </div>
          </div>
          <div class="col-md-2 text-right mt-4">
            <button type="button" class="btn btn-sm btn-outline-danger" @click="remove(ei)">
              <i class="fas fa-times"></i> Remove
            </button>
          </div>
        </div>

        <div class="row mt-2">
          <!-- Recipients -->
          <div class="col-md-4">
            <div class="form-group mb-0">
              <label class="small font-weight-bold">Recipient Type</label>
              <select
                class="form-control form-control-sm"
                :value="email.recipientType || 'user'"
                @change="update(ei, 'recipientType', $event.target.value)"
              >
                <option value="user">WP_User object param</option>
                <option value="email">Email string param</option>
                <option value="admin">Site admin</option>
              </select>
            </div>
          </div>
          <!-- HTML -->
          <div class="col-md-3">
            <label class="small font-weight-bold d-block">HTML Email</label>
            <toggle-input
              :value="email.html === true"
              @input="update(ei, 'html', $event)"
            />
          </div>
          <!-- Has attachments -->
          <div class="col-md-3">
            <label class="small font-weight-bold d-block">Supports Attachments</label>
            <toggle-input
              :value="email.attachments === true"
              @input="update(ei, 'attachments', $event)"
            />
          </div>
        </div>

        <hr v-if="ei < emails.length - 1" />
      </div>

      <div class="mt-3">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="add">
          + Add Email
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
  name: 'EmailsSection',
  components: { card, ToggleInput },
  computed: {
    ...mapGetters(['emails']),
  },
  methods: {
    add() { this.$store.dispatch('addEmail'); },
    remove(ei) { this.$store.dispatch('removeEmail', { index: ei }); },
    update(ei, key, value) { this.$store.dispatch('setEmailData', { index: ei, key, value }); },
  },
};
</script>

<style scoped>
.wpgen-email-item { border: 1px solid #e2e4e7; border-radius: 4px; padding: 12px; background: #fafafa; }
.wpgen-empty-state { padding: 20px; text-align: center; }
</style>
