import { Plus, Trash2 } from 'lucide-react';
import { OBJECT_SECTIONS, ARRAY_SECTIONS } from './deepProfileConfig';

const inputClass = 'w-full px-3.5 py-2.5 bg-white text-ink-900 placeholder-ink-400 rounded-xl border border-ink-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm';

const FieldInput = ({ field, value, onChange }) =>
  field.multiline ? (
    <textarea rows={3} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
  ) : (
    <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} placeholder={field.label} />
  );

// One {overview, ...subfields} card — Academics, Admissions Process, etc.
export const ObjectSectionCard = ({ section, value, onChange }) => (
  <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
    <h2 className="font-bold text-ink-900">{section.title}</h2>
    {section.fields.map((field) => (
      <div key={field.key}>
        <label className="block text-ink-500 text-sm font-semibold mb-1">{field.label}</label>
        <FieldInput
          field={field}
          value={value?.[field.key] || ''}
          onChange={(v) => onChange({ ...value, [field.key]: v })}
        />
      </div>
    ))}
  </div>
);

// One dynamic add/remove list — Scholarships, Notable Alumni, etc.
export const ArraySectionCard = ({ section, items, onChange }) => {
  const addItem = () => onChange([...(items || []), { ...section.empty }]);
  const updateItem = (idx, key, val) => onChange(items.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));
  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="bg-white p-6 rounded-2xl border border-ink-100/70 shadow-theme-sm hover:shadow-theme-md transition-shadow duration-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink-900">{section.title}</h2>
        <button type="button" onClick={addItem} className="text-sm px-3 py-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition-all flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {(!items || items.length === 0) && (
        <p className="text-ink-500 text-sm">No {section.title.toLowerCase()} added yet.</p>
      )}
      {(items || []).map((item, idx) => (
        <div key={idx} className="bg-cream-50 border border-ink-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-500 font-bold uppercase tracking-wider">{section.itemLabel} #{idx + 1}</span>
            <button type="button" onClick={() => removeItem(idx)} aria-label={`Remove ${section.itemLabel.toLowerCase()} ${idx + 1}`} className="text-ink-500 hover:text-rose-600 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <div key={field.key} className={field.multiline ? 'sm:col-span-2' : ''}>
                <label className="block text-ink-500 text-sm font-semibold mb-1">{field.label}</label>
                <FieldInput field={field} value={item[field.key] || ''} onChange={(v) => updateItem(idx, field.key, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Renders every configured section for the active deep-form state in order.
const DeepProfileSections = ({ deepForm, setDeepForm }) => (
  <div className="space-y-6">
    {OBJECT_SECTIONS.map((section) => (
      <ObjectSectionCard
        key={section.key}
        section={section}
        value={deepForm[section.key]}
        onChange={(val) => setDeepForm((f) => ({ ...f, [section.key]: val }))}
      />
    ))}
    {ARRAY_SECTIONS.map((section) => (
      <ArraySectionCard
        key={section.key}
        section={section}
        items={deepForm[section.key]}
        onChange={(val) => setDeepForm((f) => ({ ...f, [section.key]: val }))}
      />
    ))}
  </div>
);

export default DeepProfileSections;
