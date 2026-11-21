import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import Modal from '../../components/admin/Modal';
import { del, get, post, put, resolveAsset } from '../../lib/api';

const blank = () => ({ title: '', alt: '', caption: '', category: 'Field Work', displayOrder: 0, published: true, image: '', file: null });

export default function GalleryAdmin() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(blank());
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const load = () => get('/gallery', { limit: 100 }).then((res) => setImages(res.data || [])).catch((err) => toast.error(err.message));
  useEffect(() => { load(); }, []);

  const startEdit = (image) => {
    setEditing(image);
    setForm({ title: image.title || '', alt: image.alt || '', caption: image.caption || '', category: image.category || 'General', displayOrder: image.displayOrder || 0, published: image.published, image: image.image || '', file: null });
    setOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = new FormData();
      ['title', 'alt', 'caption', 'category', 'displayOrder', 'published'].forEach((key) => payload.append(key, String(form[key] ?? '')));
      if (form.file) payload.append('image', form.file);
      else if (form.image) payload.append('image', form.image);
      if (editing) await put(`/gallery/${editing._id}`, payload);
      else await post('/gallery', payload);
      toast.success(editing ? 'Gallery image updated' : 'Gallery image added');
      setOpen(false); setEditing(null); setForm(blank()); load();
    } catch (err) { toast.error(err.message); }
    finally { setBusy(false); }
  };

  const remove = async (image) => {
    if (!window.confirm(`Delete “${image.title}” from the gallery?`)) return;
    try { await del(`/gallery/${image._id}`); toast.success('Gallery image deleted'); load(); }
    catch (err) { toast.error(err.message); }
  };

  return <>
    <PageHeader title="Gallery" description="Upload and publish project photos on the public website.">
      <button className="btn-outline" onClick={load}><RefreshCw className="h-4 w-4" />Refresh</button>
      <button className="btn-primary" onClick={() => { setEditing(null); setForm(blank()); setOpen(true); }}><ImagePlus className="h-4 w-4" />Add photos</button>
    </PageHeader>
    {images.length === 0 ? <div className="card text-sm text-navy/60">No gallery photos yet. Add a photo to show it on the public gallery.</div> :
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map((image) => <article key={image._id} className="card overflow-hidden p-0">
        <img src={resolveAsset(image.image)} alt={image.alt} className="h-52 w-full object-cover" />
        <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-navy">{image.title}</h2><p className="text-xs text-navy/55">{image.category} · order {image.displayOrder}</p></div><span className={`badge ${image.published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{image.published ? 'Published' : 'Draft'}</span></div>
          {image.caption && <p className="mt-2 line-clamp-2 text-sm text-navy/70">{image.caption}</p>}
          <div className="mt-4 flex gap-2"><button className="btn-outline" onClick={() => startEdit(image)}><Pencil className="h-4 w-4" />Edit</button><button className="btn-ghost text-red-600" onClick={() => remove(image)} aria-label={`Delete ${image.title}`}><Trash2 className="h-4 w-4" />Delete</button></div>
        </div>
      </article>)}</div>}
    <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit gallery photo' : 'Add gallery photo'}>
      <form onSubmit={save} className="space-y-4">
        <label className="label">Photo<input className="input mt-1" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} /><span className="mt-1 block text-xs text-navy/50">Uploaded photos are optimized and stored in Cloudinary.</span>{!form.file && <input className="input mt-2" type="url" placeholder="Or paste an existing image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />}</label>
        <label className="label">Title<input required maxLength={160} className="input mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="label">Alt text<input required maxLength={250} className="input mt-1" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} /></label>
        <label className="label">Caption<textarea className="input mt-1" rows={2} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} /></label>
        <div className="grid gap-3 sm:grid-cols-2"><label className="label">Category<input className="input mt-1" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></label><label className="label">Display order<input type="number" className="input mt-1" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} /></label></div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />Publish on public website</label>
        <div className="flex justify-end gap-2"><button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save photo'}</button></div>
      </form>
    </Modal>
  </>;
}
