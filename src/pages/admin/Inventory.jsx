import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowDownCircle, ArrowUpCircle, Package, RefreshCw } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, post, put } from '../../lib/api';
import { currency, formatDate } from '../../lib/format';

const UNITS = ['kg', 'liter', 'piece', 'box', 'bundle', 'bottle', 'packet'];
const blankForm = { itemName: '', sku: '', category: '', unit: 'piece', purchasePrice: 0, supplier: '', lowStockThreshold: 10 };
const blankMovement = { type: 'stock-in', quantity: '', reference: '', notes: '' };

export default function Inventory() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, reload } = useResource('/inventory/items', {
    initialFilters: { active: 'all' },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [movementFor, setMovementFor] = useState(null);
  const [movement, setMovement] = useState(blankMovement);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const startCreate = () => {
    setEditing(null);
    setForm(blankForm);
    setCreateOpen(true);
  };

  const startEdit = (row) => {
    setEditing(row);
    setForm({
      itemName: row.itemName || '',
      sku: row.sku || '',
      category: row.category || '',
      unit: row.unit || 'piece',
      purchasePrice: row.purchasePrice || 0,
      supplier: row.supplier || '',
      lowStockThreshold: row.lowStockThreshold ?? 10,
    });
    setCreateOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await put(`/inventory/items/${editing._id}`, form);
        toast.success('Item updated');
      } else {
        await post('/inventory/items', { ...form, quantity: Number(form.quantity) || 0 });
        toast.success('Item created');
      }
      setCreateOpen(false);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitMovement = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await post('/inventory/movements', {
        item: movementFor._id,
        type: movement.type,
        quantity: Number(movement.quantity),
        reference: movement.reference,
        notes: movement.notes,
      });
      toast.success('Stock movement recorded');
      setMovementFor(null);
      setMovement(blankMovement);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const viewDetail = async (row) => {
    try {
      const res = await get(`/inventory/items/${row._id}`);
      setDetail(res.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      key: 'itemName',
      header: 'Item',
      render: (r) => (
        <div>
          <p className="font-medium text-navy">{r.itemName}</p>
          <p className="text-xs text-navy/50">{r.sku || r.category || '—'}</p>
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Stock',
      render: (r) => (
        <span className={`font-semibold ${r.quantity <= r.lowStockThreshold ? 'text-red-600' : 'text-navy'}`}>
          {r.quantity} {r.unit}
          {r.quantity <= r.lowStockThreshold ? <span className="ml-2 badge bg-red-100 text-red-700">Low</span> : null}
        </span>
      ),
    },
    { key: 'purchasePrice', header: 'Unit price', render: (r) => currency(r.purchasePrice) },
    { key: 'supplier', header: 'Supplier', render: (r) => r.supplier || '—' },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" className="link" title="Stock in" onClick={() => { setMovementFor(r); setMovement({ ...blankMovement, type: 'stock-in' }); }}>
            <ArrowUpCircle className="h-4 w-4" />
          </button>
          <button type="button" className="link" title="Stock out" onClick={() => { setMovementFor(r); setMovement({ ...blankMovement, type: 'stock-out' }); }}>
            <ArrowDownCircle className="h-4 w-4" />
          </button>
          <button type="button" className="link text-sm" title="Details" onClick={() => viewDetail(r)}>
            <Package className="h-4 w-4" />
          </button>
          <button type="button" className="link text-sm" title="Edit" onClick={() => startEdit(r)}>
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Inventory" description="Stock levels, movements and low-stock alerts.">
        <button type="button" className="btn-primary" onClick={startCreate}>
          Add Item
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No inventory items found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create/edit item */}
      <Modal
        open={createOpen}
        title={editing ? 'Edit Item' : 'Add Inventory Item'}
        onClose={() => setCreateOpen(false)}
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setCreateOpen(false)}>Cancel</button>
            <button type="submit" form="item-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <form id="item-form" onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="it-name">Item name *</label>
              <input id="it-name" required className="input" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="it-sku">SKU</label>
              <input id="it-sku" className="input" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="it-category">Category</label>
              <input id="it-category" className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="it-unit">Unit</label>
              <select id="it-unit" className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {!editing ? (
              <div>
                <label className="label" htmlFor="it-qty">Opening quantity</label>
                <input id="it-qty" type="number" min="0" className="input" value={form.quantity || 0} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="it-price">Purchase price</label>
              <input id="it-price" type="number" min="0" step="0.01" className="input" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="it-supplier">Supplier</label>
              <input id="it-supplier" className="input" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="it-threshold">Low-stock threshold</label>
              <input id="it-threshold" type="number" min="0" className="input" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </div>
          </div>
          {editing ? (
            <p className="rounded-lg bg-mist px-3 py-2 text-xs text-navy/60">
              Stock quantity is changed only through stock movements so every change is recorded.
            </p>
          ) : null}
        </form>
      </Modal>

      {/* Stock movement */}
      <Modal
        open={Boolean(movementFor)}
        title={movementFor ? `Stock ${movement.type === 'stock-in' ? 'in' : 'out'} — ${movementFor.itemName}` : ''}
        onClose={() => setMovementFor(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setMovementFor(null)}>Cancel</button>
            <button type="submit" form="movement-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Record movement'}
            </button>
          </>
        }
      >
        {movementFor ? (
          <form id="movement-form" onSubmit={submitMovement} className="space-y-4">
            <p className="text-sm text-navy/60">
              Current stock: <span className="font-semibold text-navy">{movementFor.quantity} {movementFor.unit}</span>
            </p>
            <div className="flex gap-2">
              {['stock-in', 'stock-out'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMovement({ ...movement, type: t })}
                  className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold ${
                    movement.type === t ? 'border-royal bg-royal/5 text-royal' : 'border-navy/15 text-navy/60'
                  }`}
                >
                  {t === 'stock-in' ? 'Stock in' : 'Stock out'}
                </button>
              ))}
            </div>
            <div>
              <label className="label" htmlFor="m-qty">Quantity *</label>
              <input id="m-qty" type="number" min="1" required className="input" value={movement.quantity} onChange={(e) => setMovement({ ...movement, quantity: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="m-ref">Reference</label>
              <input id="m-ref" className="input" placeholder="Invoice, job or supplier ref" value={movement.reference} onChange={(e) => setMovement({ ...movement, reference: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="m-notes">Notes</label>
              <input id="m-notes" className="input" value={movement.notes} onChange={(e) => setMovement({ ...movement, notes: e.target.value })} />
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Detail */}
      <Modal open={Boolean(detail)} title={detail ? detail.item.itemName : ''} onClose={() => setDetail(null)} size="lg">
        {detail ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-mist p-3">
                <p className="text-xs uppercase text-navy/50">In stock</p>
                <p className="text-lg font-bold text-navy">{detail.item.quantity} {detail.item.unit}</p>
              </div>
              <div className="rounded-lg bg-mist p-3">
                <p className="text-xs uppercase text-navy/50">Threshold</p>
                <p className="text-lg font-bold text-navy">{detail.item.lowStockThreshold}</p>
              </div>
              <div className="rounded-lg bg-mist p-3">
                <p className="text-xs uppercase text-navy/50">Category</p>
                <p className="text-lg font-bold text-navy">{detail.item.category || '—'}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-navy">Recent movements</p>
              <ul className="space-y-2">
                {detail.transactions.length === 0 ? (
                  <li className="text-sm text-navy/50">No movements recorded yet.</li>
                ) : (
                  detail.transactions.map((t) => (
                    <li key={t._id} className="flex items-center justify-between rounded-lg border border-navy/10 px-3 py-2 text-sm">
                      <span className={t.type === 'stock-in' ? 'text-emerald-600' : 'text-red-600'}>
                        {t.type === 'stock-in' ? '+' : '-'}{t.quantity}
                      </span>
                      <span className="text-xs text-navy/50">Balance {t.balanceAfter}</span>
                      <span className="text-xs text-navy/40">{formatDate(t.createdAt, true)}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
