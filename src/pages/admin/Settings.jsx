import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import { ErrorState, Loading } from '../../components/public/States';
import { get, put } from '../../lib/api';

export default function Settings() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    get('/settings')
      .then((res) => setForm(res.data.settings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await put('/settings', {
        businessName: form.businessName,
        tagline: form.tagline,
        description: form.description,
        phone: form.phone,
        altPhone: form.altPhone,
        email: form.email,
        whatsapp: form.whatsapp,
        address: form.address,
        businessHours: form.businessHours,
        googleMapsUrl: form.googleMapsUrl,
        facebook: form.facebook,
        instagram: form.instagram,
        linkedin: form.linkedin,
        youtube: form.youtube,
        logo: form.logo,
        favicon: form.favicon,
        serviceAreas: form.serviceAreas,
        siteUrl: form.siteUrl,
        defaultSeoTitle: form.defaultSeoTitle,
        defaultSeoDescription: form.defaultSeoDescription,
        quotationPrefix: form.quotationPrefix,
        invoicePrefix: form.invoicePrefix,
        defaultQuotationValidityDays: Number(form.defaultQuotationValidityDays) || 30,
        defaultTerms: form.defaultTerms,
        tax: form.tax,
      });
      setForm(res.data.settings);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Loading settings…" />;
  if (error || !form) return <ErrorState message={error || 'Unable to load settings'} onRetry={load} />;

  const areaText = (form.serviceAreas || []).join(', ');

  return (
    <>
      <PageHeader title="Settings" description="Business information used across the website and documents.">
        <button type="submit" form="settings-form" className="btn-primary" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </PageHeader>

      <form id="settings-form" onSubmit={save} className="space-y-6">
        <section className="card">
          <h2 className="mb-4 text-lg font-bold text-navy">Business</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="st-name">Business name</label>
              <input id="st-name" className="input" value={form.businessName || ''} onChange={(e) => set('businessName', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-tagline">Tagline</label>
              <input id="st-tagline" className="input" value={form.tagline || ''} onChange={(e) => set('tagline', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="st-desc">Description</label>
              <textarea id="st-desc" rows={3} className="input" value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-logo">Logo URL</label>
              <input id="st-logo" className="input" value={form.logo || ''} onChange={(e) => set('logo', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-favicon">Favicon URL</label>
              <input id="st-favicon" className="input" value={form.favicon || ''} onChange={(e) => set('favicon', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-bold text-navy">Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="st-phone">Phone</label>
              <input id="st-phone" className="input" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-altphone">Alternate phone</label>
              <input id="st-altphone" className="input" value={form.altPhone || ''} onChange={(e) => set('altPhone', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-email">Email</label>
              <input id="st-email" type="email" className="input" value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-whatsapp">WhatsApp number</label>
              <input id="st-whatsapp" className="input" placeholder="e.g. 919800000000" value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="st-address">Address</label>
              <input id="st-address" className="input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-hours">Business hours</label>
              <input id="st-hours" className="input" placeholder="e.g. Mon–Sat, 9:00 AM – 6:00 PM" value={form.businessHours || ''} onChange={(e) => set('businessHours', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-map">Google Maps embed URL</label>
              <input id="st-map" className="input" value={form.googleMapsUrl || ''} onChange={(e) => set('googleMapsUrl', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="st-areas">Service areas (comma separated)</label>
              <input
                id="st-areas"
                className="input"
                value={areaText}
                onChange={(e) => set('serviceAreas', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
              />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-bold text-navy">Social &amp; SEO</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {['facebook', 'instagram', 'linkedin', 'youtube'].map((key) => (
              <div key={key}>
                <label className="label" htmlFor={`st-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                <input id={`st-${key}`} className="input" value={form[key] || ''} onChange={(e) => set(key, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="label" htmlFor="st-site-url">Site URL</label>
              <input id="st-site-url" className="input" value={form.siteUrl || ''} onChange={(e) => set('siteUrl', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-seo-title">Default SEO title</label>
              <input id="st-seo-title" className="input" value={form.defaultSeoTitle || ''} onChange={(e) => set('defaultSeoTitle', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="st-seo-desc">Default SEO description</label>
              <input id="st-seo-desc" className="input" value={form.defaultSeoDescription || ''} onChange={(e) => set('defaultSeoDescription', e.target.value)} />
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-1 text-lg font-bold text-navy">Documents &amp; tax</h2>
          <p className="mb-4 text-sm text-navy/60">
            Tax is applied to quotations and invoices only when enabled here.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="st-qt-prefix">Quotation prefix</label>
              <input id="st-qt-prefix" className="input" value={form.quotationPrefix || ''} onChange={(e) => set('quotationPrefix', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-inv-prefix">Invoice prefix</label>
              <input id="st-inv-prefix" className="input" value={form.invoicePrefix || ''} onChange={(e) => set('invoicePrefix', e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="st-validity">Quotation validity (days)</label>
              <input id="st-validity" type="number" min="1" className="input" value={form.defaultQuotationValidityDays || 30} onChange={(e) => set('defaultQuotationValidityDays', e.target.value)} />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 pb-2.5 text-sm text-navy/70">
                <input
                  type="checkbox"
                  checked={Boolean(form.tax?.enabled)}
                  onChange={(e) => set('tax', { ...form.tax, enabled: e.target.checked })}
                />
                Enable tax
              </label>
            </div>
            <div>
              <label className="label" htmlFor="st-tax-label">Tax label</label>
              <input id="st-tax-label" className="input" value={form.tax?.label || ''} onChange={(e) => set('tax', { ...form.tax, label: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="st-tax-rate">Tax rate (%)</label>
              <input id="st-tax-rate" type="number" min="0" max="100" step="0.01" className="input" value={form.tax?.rate ?? 0} onChange={(e) => set('tax', { ...form.tax, rate: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label" htmlFor="st-tax-number">Tax registration number</label>
              <input id="st-tax-number" className="input" value={form.tax?.number || ''} onChange={(e) => set('tax', { ...form.tax, number: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="st-terms">Default terms &amp; conditions</label>
              <textarea id="st-terms" rows={3} className="input" value={form.defaultTerms || ''} onChange={(e) => set('defaultTerms', e.target.value)} />
            </div>
          </div>
        </section>
      </form>
    </>
  );
}
