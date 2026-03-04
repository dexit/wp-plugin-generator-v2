import React from 'react';
import useStore from '../../store/useStore';
import { autofillFromName } from '../../utils/helpers';
import SelectInput from '../common/SelectInput';

const LICENSE_OPTIONS = [
  { value: 'GPL-2.0-or-later', label: 'GPL-2.0-or-later' },
  { value: 'MIT', label: 'MIT' },
  { value: 'proprietary', label: 'Proprietary' },
];

const AUTO_FILLED_FIELDS = ['textDomain', 'mainClassName', 'baseNamespace', 'constantPrefix', 'functionPrefix'];

function AutofillBadge() {
  return (
    <span
      className="badge bg-info text-dark ms-1"
      style={{ fontSize: '0.65rem', fontWeight: 500, verticalAlign: 'middle' }}
    >
      auto-filled
    </span>
  );
}

function Field({ id, label, value, onChange, placeholder = '', autoFilled = false, required = false, type = 'text' }) {
  return (
    <div className="mb-3">
      <label className="wpg-label form-label" htmlFor={id}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
        {autoFilled && <AutofillBadge />}
      </label>
      <input
        id={id}
        type={type}
        className="wpg-input form-control"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function TextareaField({ id, label, value, onChange, placeholder = '' }) {
  return (
    <div className="mb-3">
      <label className="wpg-label form-label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="wpg-input form-control"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}

export default function Step1General() {
  const general        = useStore((s) => s.general);
  const setGeneral     = useStore((s) => s.setGeneral);
  const setGeneralBulk = useStore((s) => s.setGeneralBulk);

  const handleNameChange = (name) => {
    const derived = autofillFromName(name);
    setGeneralBulk({ pluginName: name, ...derived });
  };

  const set = (key) => (val) => setGeneral(key, val);

  return (
    <div className="wpg-step-content">
      <div className="d-flex align-items-center gap-2 mb-1">
        <i className="fas fa-cog text-primary" />
        <h4 className="mb-0">General Settings</h4>
      </div>
      <p className="text-muted small mb-4">
        Fields marked <span className="text-danger">*</span> are required. Fields tagged{' '}
        <span className="badge bg-info text-dark" style={{ fontSize: '0.65rem' }}>auto-filled</span>{' '}
        are derived automatically when you type the plugin name.
      </p>

      <div className="row g-3">
        {/* Plugin Name — full width */}
        <div className="col-12">
          <div className="mb-3">
            <label className="wpg-label form-label" htmlFor="pluginName">
              Plugin Name <span className="text-danger">*</span>
            </label>
            <input
              id="pluginName"
              type="text"
              className="wpg-input form-control form-control-lg"
              value={general.pluginName || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="My Awesome Plugin"
              required
            />
            <div className="form-text">
              Typing here auto-fills: Text Domain, Class Name, Namespace, Prefixes.
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <Field
            id="pluginURI"
            label="Plugin URI"
            value={general.pluginURI}
            onChange={set('pluginURI')}
            placeholder="https://example.com/my-plugin"
            type="url"
          />
        </div>
        <div className="col-md-6">
          <Field
            id="version"
            label="Version"
            value={general.version}
            onChange={set('version')}
            placeholder="1.0.0"
          />
        </div>

        <div className="col-12">
          <TextareaField
            id="description"
            label="Description"
            value={general.description}
            onChange={set('description')}
            placeholder="A brief description of what this plugin does."
          />
        </div>

        <div className="col-md-6">
          <Field
            id="author"
            label="Author"
            value={general.author}
            onChange={set('author')}
            placeholder="Your Name"
          />
        </div>
        <div className="col-md-6">
          <Field
            id="authorEmail"
            label="Author Email"
            value={general.authorEmail}
            onChange={set('authorEmail')}
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div className="col-md-6">
          <Field
            id="authorURI"
            label="Author URI"
            value={general.authorURI}
            onChange={set('authorURI')}
            placeholder="https://example.com"
            type="url"
          />
        </div>
        <div className="col-md-6">
          <SelectInput
            id="license"
            label="License"
            value={general.license}
            onChange={set('license')}
            options={LICENSE_OPTIONS}
            placeholder="Select license..."
          />
        </div>

        <div className="col-md-6">
          <Field
            id="licenseURI"
            label="License URI"
            value={general.licenseURI}
            onChange={set('licenseURI')}
            placeholder="https://www.gnu.org/licenses/gpl-2.0.html"
            type="url"
          />
        </div>
        <div className="col-md-6">
          <Field
            id="domainPath"
            label="Domain Path"
            value={general.domainPath}
            onChange={set('domainPath')}
            placeholder="/languages"
          />
        </div>

        <div className="col-12"><hr className="my-2" /></div>
        <div className="col-12">
          <h6 className="text-muted mb-3">
            <i className="fas fa-magic me-1" />
            Auto-derived Fields
          </h6>
        </div>

        <div className="col-md-6">
          <Field
            id="textDomain"
            label="Text Domain"
            value={general.textDomain}
            onChange={set('textDomain')}
            placeholder="my-plugin"
            autoFilled={AUTO_FILLED_FIELDS.includes('textDomain')}
            required
          />
        </div>
        <div className="col-md-6">
          <Field
            id="mainClassName"
            label="Main Class Name"
            value={general.mainClassName}
            onChange={set('mainClassName')}
            placeholder="MyPlugin"
            autoFilled
          />
        </div>

        <div className="col-md-6">
          <Field
            id="baseNamespace"
            label="Base Namespace"
            value={general.baseNamespace}
            onChange={set('baseNamespace')}
            placeholder="MyPlugin"
            autoFilled
          />
        </div>
        <div className="col-md-6">
          <Field
            id="constantPrefix"
            label="Constant Prefix"
            value={general.constantPrefix}
            onChange={set('constantPrefix')}
            placeholder="MY_PLUGIN"
            autoFilled
          />
        </div>

        <div className="col-md-6">
          <Field
            id="functionPrefix"
            label="Function Prefix"
            value={general.functionPrefix}
            onChange={set('functionPrefix')}
            placeholder="my_plugin"
            autoFilled
          />
        </div>
      </div>
    </div>
  );
}
