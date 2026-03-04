import React from 'react';
import useStore from '../../store/useStore';
import { toPascalCase } from '../../utils/helpers';
import Card from '../common/Card';
import SelectInput from '../common/SelectInput';
import ToggleInput from '../common/ToggleInput';

const RECIPIENT_TYPES = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'custom', label: 'Custom' },
];

const FILE_TYPE_OPTIONS = ['.csv', '.xml', '.json'];

export default function Step9EmailsImporters() {
  const emails         = useStore((s) => s.emails);
  const addEmail       = useStore((s) => s.addEmail);
  const removeEmail    = useStore((s) => s.removeEmail);
  const setEmailData   = useStore((s) => s.setEmailData);

  const importers       = useStore((s) => s.importers);
  const addImporter     = useStore((s) => s.addImporter);
  const removeImporter  = useStore((s) => s.removeImporter);
  const setImporterData = useStore((s) => s.setImporterData);

  const handleImporterIdChange = (i, id) => {
    setImporterData(i, 'id', id);
    const imp = importers[i];
    if (!imp.className || imp.className === toPascalCase(imp.id || '') + '_Importer') {
      setImporterData(i, 'className', toPascalCase(id) + '_Importer');
    }
  };

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-envelope text-primary" />
        <h4 className="mb-0">Emails &amp; Importers</h4>
      </div>
      <p className="text-muted small mb-4">
        Configure email notification handlers and WordPress importer classes.
      </p>

      {/* Emails */}
      <div className="mb-5">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">Email Handlers</h5>
            <span className="badge bg-secondary">{emails.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addEmail}
          >
            <i className="fas fa-plus me-1" />
            Add Email
          </button>
        </div>

        {emails.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No email handlers defined yet.
          </div>
        )}

        {emails.map((email, i) => (
          <Card
            key={i}
            title={email.method || `Email #${i + 1}`}
            badge={email.recipientType || ''}
            onRemove={() => removeEmail(i)}
            defaultOpen={true}
          >
            <div className="row g-3">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="wpg-label form-label">Method Name</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={email.method || ''}
                    onChange={(e) => setEmailData(i, 'method', e.target.value)}
                    placeholder="send_booking_confirmation"
                  />
                </div>
              </div>
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="wpg-label form-label">Subject</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={email.subject || ''}
                    onChange={(e) => setEmailData(i, 'subject', e.target.value)}
                    placeholder="Booking Confirmed: {event_name}"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="wpg-label form-label">Template File Path</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={email.template || ''}
                    onChange={(e) => setEmailData(i, 'template', e.target.value)}
                    placeholder="booking-confirmation.php"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <SelectInput
                  label="Recipient Type"
                  value={email.recipientType || 'user'}
                  onChange={(v) => setEmailData(i, 'recipientType', v)}
                  options={RECIPIENT_TYPES}
                />
              </div>

              <div className="col-md-3">
                <ToggleInput
                  label="HTML Email"
                  value={email.html}
                  onChange={(v) => setEmailData(i, 'html', v)}
                  description="Send as HTML"
                />
              </div>
              <div className="col-md-3">
                <ToggleInput
                  label="Attachments"
                  value={email.attachments}
                  onChange={(v) => setEmailData(i, 'attachments', v)}
                  description="Support file attachments"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Importers */}
      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0">WP Importers</h5>
            <span className="badge bg-secondary">{importers.length}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={addImporter}
          >
            <i className="fas fa-plus me-1" />
            Add Importer
          </button>
        </div>
        <p className="text-muted small mb-3">
          WordPress importers appear in <strong>Tools &gt; Import</strong>.
        </p>

        {importers.length === 0 && (
          <div className="alert alert-secondary small mb-3">
            No importers defined yet.
          </div>
        )}

        {importers.map((importer, i) => (
          <Card
            key={i}
            title={importer.name || importer.id || `Importer #${i + 1}`}
            badge={importer.fileTypes || ''}
            onRemove={() => removeImporter(i)}
            defaultOpen={true}
          >
            <div className="row g-3">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="wpg-label form-label">ID (slug)</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={importer.id || ''}
                    onChange={(e) => handleImporterIdChange(i, e.target.value)}
                    placeholder="events-importer"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="wpg-label form-label">Name</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={importer.name || ''}
                    onChange={(e) => setImporterData(i, 'name', e.target.value)}
                    placeholder="Events Importer"
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="wpg-label form-label">
                    Class Name
                    <span className="badge bg-info text-dark ms-1" style={{ fontSize: '0.65rem' }}>auto</span>
                  </label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={importer.className || ''}
                    onChange={(e) => setImporterData(i, 'className', e.target.value)}
                    placeholder="EventsImporter_Importer"
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="mb-3">
                  <label className="wpg-label form-label">Description</label>
                  <textarea
                    className="wpg-input form-control"
                    value={importer.description || ''}
                    onChange={(e) => setImporterData(i, 'description', e.target.value)}
                    placeholder="Import events from a CSV or XML file."
                    rows={2}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <label className="wpg-label form-label">Accepted File Types</label>
                  <input
                    type="text"
                    className="wpg-input form-control"
                    value={importer.fileTypes || ''}
                    onChange={(e) => setImporterData(i, 'fileTypes', e.target.value)}
                    placeholder=".csv, .xml"
                  />
                  <div className="form-text">Comma-separated extensions: .csv, .xml, .json</div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
