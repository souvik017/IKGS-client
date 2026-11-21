import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye, Filter, Pencil, Plus, RefreshCw, Wallet, Trash2 } from 'lucide-react';

import PageHeader from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/admin/Pagination';
import StatusBadge from '../../components/admin/StatusBadge';
import Modal from '../../components/admin/Modal';
import useResource from '../../hooks/useResource';
import { get, post, put } from '../../lib/api';
import { currency, formatDate, statusStyle, titleCase } from '../../lib/format';
import { useSearchParams } from 'react-router-dom';

const PAYMENT_STATUSES = ['unpaid', 'partially-paid', 'paid'];
const blankItem = () => ({ item: '', quantity: 1, unitPrice: 0, discount: 0, description: '', hsnSac: '998512', unit: 'NOS' });

export default function Invoices() {
  const { rows, pagination, loading, error, page, setPage, search, setSearch, filters, updateFilter, reload } =
    useResource('/invoices');
  const [searchParams] = useSearchParams();

  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paymentFor, setPaymentFor] = useState(null);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [payment, setPayment] = useState({ amountPaid: '', paymentMethod: 'cash', transferAmount: '', transferReference: '' });
  const [activeService, setActiveService] = useState(null);

  const [form, setForm] = useState({
    mode: 'general',
    customer: '',
    appointment: '',
    billingPeriod: '',
    items: [blankItem()],
    discount: '',
    taxRate: '',
    terms: '',
    dueDate: '',
    shipTo: { name: '', address: '' },
  });

  useEffect(() => {
    get('/customers', { limit: 100 }).then((res) => setCustomers(res.data)).catch(() => setCustomers([]));
    get('/appointments', { limit: 100 }).then((res) => setAppointments(res.data)).catch(() => setAppointments([]));
    get('/services', { limit: 100 }).then((res) => setServices(res.data)).catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const customer = searchParams.get('customer');
    const appointment = searchParams.get('appointment');
    if (customer || appointment) {
      setForm(prev => ({ ...prev, mode: appointment ? 'appointment' : 'general', customer: customer || '', appointment: appointment || '' }));
      setOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const appointment=appointments.find(a=>a._id===form.appointment);
    if(form.mode==='appointment'&&appointment?.service?.title&&form.items.length===1&&!form.items[0].item){
      setForm(prev=>({...prev,items:[{...blankItem(),item:appointment.service.title,description:appointment.jobNotes||''}]}));
    }
  }, [appointments,form.appointment,form.items,form.mode]);

  const updateItem = (index, patch) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...patch };
      return { ...prev, items };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const invoiceItems=form.items.map(i=>({item:i.item,description:i.description,quantity:Number(i.quantity),unitPrice:Number(i.unitPrice),discount:Number(i.discount)||0,hsnSac:i.hsnSac,unit:i.unit}));
      if(editingInvoice){
        await put(`/invoices/${editingInvoice._id}`,{items:invoiceItems,discount:Number(form.discount)||0,taxRate:Number(form.taxRate)||0,dueDate:form.dueDate||null,billingPeriod:form.billingPeriod,terms:form.terms,shipTo:form.shipTo});
        toast.success('Invoice updated');
      } else if (form.mode === 'appointment') {
        await post('/invoices/appointment', { appointment: form.appointment, items: invoiceItems, shipTo:form.shipTo, discount:Number(form.discount)||0, taxRate:Number(form.taxRate)||undefined, terms:form.terms||undefined, dueDate:form.dueDate||undefined });
      } else {
        await post('/invoices', {
          customer: form.customer,
          billingPeriod: form.billingPeriod,
          shipTo:form.shipTo,
          items: invoiceItems,
          discount:Number(form.discount)||0,
          taxRate:Number(form.taxRate)||undefined,
          terms:form.terms||undefined,
          dueDate:form.dueDate||undefined,
        });
      }
      if(!editingInvoice)toast.success('Invoice created');
      setOpen(false);
      setEditingInvoice(null);
      setForm({ mode: 'general', customer: '', appointment: '', billingPeriod: '', items: [blankItem()], discount: '', taxRate: '', terms: '', dueDate: '', shipTo: { name: '', address: '' } });
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const showInvoice=async(row)=>{try{const res=await get(`/invoices/${row._id}`);setViewInvoice(res.data.invoice);}catch(err){toast.error(err.message);}};
  const editInvoice=async(row)=>{try{const res=await get(`/invoices/${row._id}`);const invoice=res.data.invoice;setEditingInvoice(invoice);setForm({mode:invoice.invoiceType||'general',customer:invoice.customer?._id||'',appointment:invoice.appointment?._id||'',billingPeriod:invoice.billingPeriod||'',items:(invoice.items||[]).map(i=>({item:i.item,description:i.description||'',quantity:i.quantity,unitPrice:i.unitPrice,discount:i.discount||0,hsnSac:i.hsnSac||'998512',unit:i.unit||'NOS'})),discount:invoice.discount||0,taxRate:invoice.taxRate||'',terms:invoice.terms||'',dueDate:invoice.dueDate?new Date(invoice.dueDate).toISOString().slice(0,10):'',shipTo:{name:invoice.shipTo?.name||'',address:invoice.shipTo?.address||''}});setOpen(true);}catch(err){toast.error(err.message);}};

  const openPayment = (row) => {
    setPaymentFor(row);
    setPayment({ amountPaid: row.amountPaid || 0, paymentMethod: row.paymentMethod || 'cash', transferAmount: row.transferAmount || (row.paymentMethod==='bank-transfer'?row.amountPaid||0:''), transferReference: row.transferReference || '' });
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await put(`/invoices/${paymentFor._id}/payment`, {
        amountPaid: Number(payment.amountPaid),
        paymentMethod: payment.paymentMethod,
        transferAmount: payment.paymentMethod==='bank-transfer'?Number(payment.transferAmount||payment.amountPaid):undefined,
        transferReference: payment.paymentMethod==='bank-transfer'?payment.transferReference:undefined,
      });
      toast.success('Payment updated');
      setPaymentFor(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const previewPdf = async (row) => {
    setPdfBusy(true);
    try {
      const [invoiceRes, settingsRes, renderer, invoiceModule] = await Promise.all([
        get(`/invoices/${row._id}`), get('/settings'), import('@react-pdf/renderer'), import('../../components/admin/TaxInvoicePdf'),
      ]);
      const TaxInvoicePdf = invoiceModule.default;
      const blob = await renderer.pdf(<TaxInvoicePdf invoice={invoiceRes.data.invoice} settings={settingsRes.data.settings} />).toBlob();
      const url = URL.createObjectURL(blob);
      setPdfPreview({ url, filename: `${row.invoiceNumber}.pdf` });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPdfBusy(false);
    }
  };
  const closePdfPreview=()=>{if(pdfPreview?.url)URL.revokeObjectURL(pdfPreview.url);setPdfPreview(null);};

  const columns = [
    { key: 'invoiceNumber', header: 'Number', render: (r) => <span className="font-mono text-xs">{r.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (r) => r.customer?.name || '—' },
    { key: 'invoiceType', header: 'Type', render: (r) => <span className="capitalize">{r.invoiceType}</span> },
    { key: 'total', header: 'Total', render: (r) => currency(r.total) },
    { key: 'balanceDue', header: 'Balance', render: (r) => currency(r.balanceDue) },
    { key: 'paymentStatus', header: 'Payment', render: (r) => <StatusBadge status={r.paymentStatus} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right whitespace-nowrap',
      render: (r) => (
        <div className="flex justify-end gap-2">
          <button type="button" className="link" title="View invoice" aria-label={`View ${r.invoiceNumber}`} onClick={() => showInvoice(r)}><Eye className="h-4 w-4" /></button>
          <button type="button" className="link" title="Edit invoice" aria-label={`Edit ${r.invoiceNumber}`} onClick={() => editInvoice(r)}><Pencil className="h-4 w-4" /></button>
          <button type="button" className="link" title="Record payment" onClick={() => openPayment(r)}>
            <Wallet className="h-4 w-4" />
          </button>
          <button type="button" className="link" title="Preview and download PDF" aria-label={`Preview PDF for ${r.invoiceNumber}`} disabled={pdfBusy} onClick={() => previewPdf(r)}>
            <Download className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const estimate = form.items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice) - (Number(i.discount) || 0),
    0
  );

  return (
    <>
      <PageHeader title="Invoices" description="Appointment-based and general billing.">
        <button type="button" className="btn-primary" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </PageHeader>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          className="input sm:max-w-xs"
          placeholder="Search invoice number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-navy/40" />
          <select className="input sm:w-44" value={filters.paymentStatus || ''} onChange={(e) => updateFilter('paymentStatus', e.target.value || undefined)}>
            <option value="">All payment states</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{titleCase(s)}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-ghost" onClick={reload}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

      <DataTable columns={columns} rows={rows} loading={loading} emptyMessage="No invoices found." />
      <Pagination pagination={pagination} onPageChange={setPage} />

      {/* Create invoice */}
      <Modal
        open={open}
        title={editingInvoice ? `Edit Invoice — ${editingInvoice.invoiceNumber}` : 'New Invoice'}
        onClose={() => {setOpen(false);setEditingInvoice(null);}}
        size="lg"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => {setOpen(false);setEditingInvoice(null);}}>Cancel</button>
            <button type="submit" form="invoice-form" className="btn-primary" disabled={busy}>
              {busy ? (editingInvoice ? 'Saving…' : 'Creating…') : (editingInvoice ? 'Save changes' : 'Create invoice')}
            </button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={submit} className="max-h-[calc(100dvh-12rem)] space-y-5 overflow-y-auto pr-1 sm:max-h-[calc(100dvh-13rem)]">
          {!editingInvoice&&<div className="flex gap-2">
            {[
              { key: 'general', label: 'General / monthly' },
              { key: 'appointment', label: 'From appointment' },
            ].map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setForm({ ...form, mode: m.key })}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  form.mode === m.key ? 'border-royal bg-royal/5 text-royal' : 'border-navy/15 text-navy/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>}

          {!editingInvoice&&form.mode === 'appointment' ? (
            <div>
              <label className="label" htmlFor="i-appointment">Appointment *</label>
              <select
                id="i-appointment"
                required
                className="input"
                value={form.appointment}
                onChange={(e) => setForm({ ...form, appointment: e.target.value })}
              >
                <option value="">Select appointment</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.appointmentId} — {a.customer?.name||a.booking?.name||'Booking'} ({formatDate(a.date)})
                  </option>
                ))}
              </select>
            </div>
          ) : !editingInvoice&&(
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="i-customer">Customer *</label>
                  <select id="i-customer" required className="input" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c._id} value={c._id}>{c.name} — {c.phone || c.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="i-period">Billing period</label>
                  <input id="i-period" className="input" placeholder="e.g. 2026-09" value={form.billingPeriod} onChange={(e) => setForm({ ...form, billingPeriod: e.target.value })} />
                </div>
              </div>
            </>
          )}
          {!editingInvoice&&form.mode === 'appointment' ? <div className="space-y-3 rounded-xl bg-mist p-3 text-sm"><p>Appointment invoice · {appointments.find(a=>a._id===form.appointment)?.customer?.name||appointments.find(a=>a._id===form.appointment)?.booking?.name||'Select appointment'}</p>{!appointments.find(a=>a._id===form.appointment)?.customer&&<label className="label">Bill to customer *<select required className="input" value={form.customer} onChange={e=>setForm({...form,customer:e.target.value})}><option value="">Select existing customer</option>{customers.map(c=><option key={c._id} value={c._id}>{c.name} · {c.phone||c.email}</option>)}</select></label>}</div> : null}
          <div className="grid gap-3 rounded-xl border border-navy/10 p-3 sm:grid-cols-2"><label className="label">Ship to name<input className="input" value={form.shipTo.name} onChange={e=>setForm({...form,shipTo:{...form.shipTo,name:e.target.value}})} placeholder="Company or recipient"/></label><label className="label sm:col-span-2">Ship to address<textarea className="input" rows="2" value={form.shipTo.address} onChange={e=>setForm({...form,shipTo:{...form.shipTo,address:e.target.value}})} placeholder="Delivery / service location"/></label></div>
          <div><span className="label">Invoice line items</span><div className="space-y-3">{form.items.map((item,index)=><div key={index} className="grid min-w-0 grid-cols-2 gap-3 rounded-xl border border-navy/10 p-3 lg:grid-cols-12">
            <div className="relative col-span-2 min-w-0 lg:col-span-3"><label className="label" htmlFor={`i-item-${index}`}>Service or item *</label><input id={`i-item-${index}`} className="input w-full min-w-0 pr-9" placeholder="Search services or type an item" required value={item.item} onFocus={()=>setActiveService(index)} onChange={e=>{updateItem(index,{item:e.target.value});setActiveService(index);}}/><button type="button" className="absolute right-2 top-7 text-red-600" onClick={()=>setForm({...form,items:form.items.filter((_,i)=>i!==index)})} disabled={form.items.length===1} aria-label="Remove line item"><Trash2 className="h-4 w-4"/></button>{activeService===index&&<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-navy/15 bg-white p-1 shadow-lg">{services.filter(s=>!item.item||s.title.toLowerCase().includes(item.item.toLowerCase())).map(s=><button type="button" key={s._id} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-mist" onClick={()=>{updateItem(index,{item:s.title,description:item.description||s.shortDescription||s.description||''});setActiveService(null);}}>{s.title}</button>)}</div>}</div>
            <label className="label col-span-1 min-w-0 lg:col-span-1">Qty<input type="number" min="1" className="input w-full min-w-0" value={item.quantity} onChange={e=>updateItem(index,{quantity:e.target.value})}/></label>
            <label className="label col-span-1 min-w-0 lg:col-span-1">Unit price<input type="number" min="0" step="0.01" className="input w-full min-w-0" value={item.unitPrice} onChange={e=>updateItem(index,{unitPrice:e.target.value})}/></label>
            <label className="label col-span-1 min-w-0 lg:col-span-1">Discount<input type="number" min="0" step="0.01" className="input w-full min-w-0" value={item.discount} onChange={e=>updateItem(index,{discount:e.target.value})}/></label>
            <label className="label col-span-1 min-w-0 lg:col-span-2">HSN/SAC<input className="input w-full min-w-0" value={item.hsnSac} onChange={e=>updateItem(index,{hsnSac:e.target.value})}/></label>
            <label className="label col-span-1 min-w-0 lg:col-span-1">Unit<input className="input w-full min-w-0" value={item.unit} onChange={e=>updateItem(index,{unit:e.target.value})}/></label>
            <label className="label col-span-2 min-w-0 lg:col-span-3">Description<input className="input w-full min-w-0" value={item.description} onChange={e=>updateItem(index,{description:e.target.value})}/></label>
          </div>)}</div><button type="button" className="link mt-2 text-sm" onClick={()=>setForm({...form,items:[...form.items,blankItem()]})}><Plus className="inline h-3.5 w-3.5"/> Add item</button></div>
          <div className="grid gap-3 sm:grid-cols-2"><label className="label">Due date<input type="date" className="input" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})}/></label><label className="label">Document discount<input type="number" min="0" step="0.01" className="input" value={form.discount||''} onChange={e=>setForm({...form,discount:e.target.value})}/></label><label className="label">Tax rate (%)<input type="number" min="0" max="100" step="0.01" className="input" value={form.taxRate||''} onChange={e=>setForm({...form,taxRate:e.target.value})}/></label><label className="label">Terms<textarea className="input" rows="1" value={form.terms||''} onChange={e=>setForm({...form,terms:e.target.value})}/></label></div>
          <p className="text-right text-sm text-navy/60">Estimated subtotal after item discounts: <b className="text-navy">{currency(estimate)}</b> <span className="text-xs"> · Final tax and totals are calculated by server</span></p>
        </form>
      </Modal>

      <Modal open={Boolean(viewInvoice)} title={viewInvoice?`Invoice ${viewInvoice.invoiceNumber}`:'Invoice details'} onClose={()=>setViewInvoice(null)} size="lg" footer={<><button type="button" className="btn-outline" onClick={()=>setViewInvoice(null)}>Close</button>{viewInvoice&&<button type="button" className="btn-outline" onClick={()=>{const row=viewInvoice;setViewInvoice(null);editInvoice(row);}}><Pencil className="h-4 w-4"/>Edit invoice</button>}</>}>
        {viewInvoice&&<div className="max-h-[65dvh] space-y-5 overflow-y-auto pr-1"><div className="grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-2"><p><span className="text-sm text-navy/55">Customer</span><br/><b>{viewInvoice.customer?.name||'—'}</b></p><p><span className="text-sm text-navy/55">Invoice type</span><br/><b className="capitalize">{viewInvoice.invoiceType}</b></p><p><span className="text-sm text-navy/55">Created</span><br/><b>{formatDate(viewInvoice.createdAt)}</b></p><p><span className="text-sm text-navy/55">Due date</span><br/><b>{viewInvoice.dueDate?formatDate(viewInvoice.dueDate):'—'}</b></p><p><span className="text-sm text-navy/55">Ship to</span><br/><b>{viewInvoice.shipTo?.name||'—'}</b><br/>{viewInvoice.shipTo?.address||'—'}</p>{viewInvoice.appointment&&<p><span className="text-sm text-navy/55">Appointment</span><br/><b>{viewInvoice.appointment.appointmentId||'—'}</b></p>}{viewInvoice.billingPeriod&&<p><span className="text-sm text-navy/55">Billing period</span><br/><b>{viewInvoice.billingPeriod}</b></p>}</div><div className="overflow-x-auto rounded-xl border border-navy/10"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-mist"><tr><th className="p-3">Service / item</th><th className="p-3">HSN/SAC</th><th className="p-3">Qty</th><th className="p-3">Unit</th><th className="p-3">Unit price</th><th className="p-3">Discount</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{viewInvoice.items?.map((item,i)=><tr key={i} className="border-t border-navy/10"><td className="p-3"><b>{item.item}</b>{item.description&&<div className="text-xs text-navy/55">{item.description}</div>}</td><td className="p-3">{item.hsnSac||'—'}</td><td className="p-3">{item.quantity}</td><td className="p-3">{item.unit||'—'}</td><td className="p-3">{currency(item.unitPrice)}</td><td className="p-3">{currency(item.discount)}</td><td className="p-3 text-right">{currency(item.lineTotal)}</td></tr>)}</tbody></table></div><div className="ml-auto max-w-xs space-y-1 text-right text-sm"><p>Subtotal <b>{currency(viewInvoice.subtotal)}</b></p><p>Discount <b>{currency(viewInvoice.discount+viewInvoice.lineDiscountTotal)}</b></p><p>Tax <b>{currency(viewInvoice.tax)}</b></p><p>Round off <b>{currency(viewInvoice.roundOff||0)}</b></p><p className="border-t pt-2 text-lg">Total <b>{currency(viewInvoice.total)}</b></p><p>Paid {currency(viewInvoice.amountPaid)} · Balance {currency(viewInvoice.balanceDue)}</p><p className="capitalize">Status: {titleCase(viewInvoice.paymentStatus)}</p>{viewInvoice.paymentMethod==='bank-transfer'&&<p>Transferred {currency(viewInvoice.transferAmount)}{viewInvoice.transferReference?` · Ref: ${viewInvoice.transferReference}`:''}</p>}</div>{viewInvoice.terms&&<div><h3 className="font-semibold">Terms</h3><p className="whitespace-pre-wrap text-sm text-navy/70">{viewInvoice.terms}</p></div>}</div>}
      </Modal>

      <Modal open={Boolean(pdfPreview)} title={pdfPreview?`Invoice preview — ${pdfPreview.filename}`:'Invoice preview'} onClose={closePdfPreview} size="lg" footer={pdfPreview&&<><button type="button" className="btn-outline" onClick={closePdfPreview}>Close</button><a className="btn-primary" href={pdfPreview.url} download={pdfPreview.filename}><Download className="h-4 w-4"/>Download PDF</a></>}>
        {pdfPreview&&<iframe title={`PDF preview ${pdfPreview.filename}`} src={pdfPreview.url} className="h-[70dvh] min-h-[360px] w-full rounded-lg border border-navy/10"/>}
      </Modal>

      {/* Payment */}
      <Modal
        open={Boolean(paymentFor)}
        title={paymentFor ? `Record payment — ${paymentFor.invoiceNumber}` : ''}
        onClose={() => setPaymentFor(null)}
        size="sm"
        footer={
          <>
            <button type="button" className="btn-outline" onClick={() => setPaymentFor(null)}>Cancel</button>
            <button type="submit" form="payment-form" className="btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save payment'}
            </button>
          </>
        }
      >
        {paymentFor ? (
          <form id="payment-form" onSubmit={submitPayment} className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-navy/60">Invoice total</span>
              <span className="font-semibold text-navy">{currency(paymentFor.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-navy/60">Current status</span>
              <span className={`badge ${statusStyle(paymentFor.paymentStatus)}`}>{titleCase(paymentFor.paymentStatus)}</span>
            </div>
            <div>
              <label className="label" htmlFor="p-amount">Amount paid</label>
              <input
                id="p-amount"
                type="number"
                min="0"
                step="0.01"
                className="input"
                value={payment.amountPaid}
                onChange={(e) => setPayment({ ...payment, amountPaid: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="p-method">Payment method</label>
              <select id="p-method" className="input" value={payment.paymentMethod} onChange={(e) => setPayment(prev => ({ ...prev, paymentMethod: e.target.value, ...(e.target.value==='bank-transfer'&&!prev.transferAmount?{transferAmount:prev.amountPaid}:{}) }))}>
                {['cash', 'upi', 'bank-transfer', 'cheque', 'card', 'other'].map((m) => (
                  <option key={m} value={m}>{titleCase(m)}</option>
                ))}
              </select>
            </div>
            {payment.paymentMethod==='bank-transfer'&&<><label className="label" htmlFor="p-transfer-amount">Transfer amount<input id="p-transfer-amount" type="number" min="0" step="0.01" className="input" value={payment.transferAmount} onChange={e=>setPayment({...payment,transferAmount:e.target.value})}/></label><label className="label" htmlFor="p-transfer-reference">Transfer reference / note<input id="p-transfer-reference" className="input" maxLength="250" value={payment.transferReference} onChange={e=>setPayment({...payment,transferReference:e.target.value})} placeholder="UTR, transaction ID, or transfer note"/></label></>}
          </form>
        ) : null}
      </Modal>
    </>
  );
}
