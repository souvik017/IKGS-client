import { useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Pencil, Plus, Power, Trash2, X } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useResource from '../../hooks/useResource';
import { del, post, put, resolveAsset } from '../../lib/api';
import { currency } from '../../lib/format';
import { SERVICE_IMAGES } from '../../lib/brand';

const blankForm = {
  title: '',
  shortDescription: '',
  description: '',
  image: '',
  startingPrice: 0,
  displayOrder: 0,
  featured: false,
  active: true,
  seoTitle: '',
  seoDescription: '',
};

/** Bundled images an admin can point a service at without uploading anything. */
const IMAGE_LIBRARY = Object.entries(SERVICE_IMAGES);

export default function ServicesAdmin() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, reload } = useResource('/services', {
    initialFilters: { active: 'all' },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const resetImageState = () => {
    // Release the object URL so a long admin session does not leak memory.
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(blankForm);
    resetImageState();
    setOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      title: row.title || '',
      shortDescription: row.shortDescription || '',
      description: row.description || '',
      image: row.image || '',
      startingPrice: row.startingPrice || 0,
      displayOrder: row.displayOrder || 0,
      featured: Boolean(row.featured),
      active: row.active,
      seoTitle: row.seoTitle || '',
      seoDescription: row.seoDescription || '',
    });
    resetImageState();
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetImageState();
  };

  const onPickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearFile = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  /**
   * An attached file forces multipart/form-data; otherwise plain JSON is sent.
   * The API normalises string values, so both paths behave identically.
   */
  const buildPayload = () => {
    if (!imageFile) return form;
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
    if (imageFile) data.append('images', imageFile);
    return data;
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await put(`/services/${editing._id}`, buildPayload());
        toast.success('Service updated');
      } else {
        await post('/services', buildPayload());
        toast.success('Service created');
      }
      closeModal();
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (row) => {
    try {
      await put(`/services/${row._id}`, { active: !row.active });
      toast.success(row.active ? 'Service hidden' : 'Service published');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await del(`/services/${confirmDelete._id}`);
      toast.success('Service deleted');
      setConfirmDelete(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Uploaded image (if any) > stored image > bundled fallback for that slug.
  const previewSrc = imagePreview || resolveAsset(form.image) || SERVICE_IMAGES[editing?.slug] || null;

  const columns = [
    {
      key: 'title',
      header: 'Service',
      render: (r) => (
        <div className="flex items-center gap-3">
          {SERVICE_IMAGES[r.slug] || r.image ? (
            <img
              src={resolveAsset(r.image) || SERVICE_IMAGES[r.slug]}
              alt=""
              className="h-10 w-14 shrink-0 rounded-md object-cover"
            />
          ) : null}
          <div>
            <p className="font-medium text-navy">{r.title}</p>
            <p className="text-xs text-navy/50">/{r.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'startingPrice', header: 'From', render: (r) => (Number(r.startingPrice) > 0 ? currency(r.startingPrice) : 'On request') },
    { key: 'displayOrder', header: 'Order', render: (r) => r.displayOrder ?? 0 },
    { key: 'featured', header: 'Featured', render: (r) => (r.featured ? 'Yes' : '—') },
    { key: 'active', header: 'Status', render: (r) => <StatusBadge status={r.active ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" className="link" title="Edit" aria-label={`Edit ${r.title}`} onClick={() => startEdit(r)}>
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="link"
            title={r.active ? 'Hide' : 'Publish'}
            aria-label={`${r.active ? 'Hide' : 'Publish'} ${r.title}`}
            onClick={() => toggleActive(r)}
          >
            <Power className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="link text-red-600"
            title="Delete"
            aria-label={`Delete ${r.title}`}
            onClick={() => setConfirmDelete(r)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Services" description="Manage the public service catalogue.">
        <button type="button" className="btn-primary" onClick={startCreate}>
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </PageHeader>

      <div className="mb-4">
        <input type="search" className="input sm:max-w-xs" placeholder="Search services…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No services found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal
        open={open}
        title={editing ? 'Edit Service' : 'Add Service'}
        onClose={closeModal}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={closeModal} disabled={busy}>
              Cancel
            </button>
            <button type="submit" form="service-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="service-form" onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="s-title">Title *</label>
            <input id="s-title" required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-short">Short description</label>
            <input id="s-short" className="input" maxLength={300} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="s-desc">Full description</label>
            <textarea id="s-desc" rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* ---- Image ---- */}
          <fieldset className="space-y-4 rounded-xl border border-navy/10 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-navy/50">
              Service image
            </legend>

            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Service image preview"
                className="h-40 w-full rounded-xl border border-navy/10 object-cover"
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="s-image">Image path or URL</label>
                <input
                  id="s-image"
                  className="input"
                  placeholder="/images/services/… or https://…"
                  value={form.image}
                  onChange={(e) => {
                    setForm({ ...form, image: e.target.value });
                    if (imageFile) clearFile();
                  }}
                />
              </div>
              <div>
                <span className="label">Or upload a file</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="s-image-file"
                    className="btn-outline cursor-pointer"
                  >
                    <ImagePlus className="h-4 w-4" /> Choose file
                  </label>
                  <input
                    id="s-image-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={onPickFile}
                  />
                  {imageFile ? (
                    <button type="button" className="btn-ghost btn-sm" onClick={clearFile}>
                      <X className="h-3.5 w-3.5" /> Remove
                    </button>
                  ) : (
                    <span className="text-xs text-navy/50">JPEG, PNG or WEBP up to 5 MB</span>
                  )}
                </div>
              </div>
            </div>

            <details className="text-sm">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-navy/50">
                Use a bundled image
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {IMAGE_LIBRARY.map(([slug, path]) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => {
                      if (imageFile) clearFile();
                      setForm({ ...form, image: path });
                    }}
                    className={`overflow-hidden rounded-lg border text-left transition ${
                      form.image === path ? 'border-primary ring-2 ring-primary/30' : 'border-navy/10 hover:border-primary/40'
                    }`}
                  >
                    <img src={path} alt="" className="h-16 w-full object-cover" />
                    <span className="block truncate px-2 py-1 text-[10px] text-navy/60">{slug}</span>
                  </button>
                ))}
              </div>
            </details>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-price">Starting price</label>
              <input id="s-price" type="number" min="0" step="0.01" className="input" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-order">Display order</label>
              <input id="s-order" type="number" className="input" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
            </div>
            <div className="flex items-center gap-4 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
              </label>
              <label className="flex items-center gap-2 text-sm text-navy/70">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
              </label>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="s-seo-title">SEO title</label>
              <input id="s-seo-title" className="input" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="s-seo-desc">SEO description</label>
              <input id="s-seo-desc" className="input" value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete this service?"
        message="Deleting removes the service from the public catalogue permanently."
        confirmLabel="Delete"
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirmDelete(null)}
      />
    </>
  );
}
