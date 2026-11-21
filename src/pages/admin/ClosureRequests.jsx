import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, ExternalLink, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import { get, put } from '../../lib/api';
import { currency, formatDate } from '../../lib/format';

export default function ClosureRequests(){
  const [rows,setRows]=useState([]);const [busy,setBusy]=useState('');
  const load=()=>get('/closures',{status:'pending-review',limit:100}).then(r=>setRows(r.data||[])).catch(e=>toast.error(e.message));
  useEffect(()=>{load();},[]);
  const action=async(row,kind)=>{let reason='';if(kind==='reject'){reason=window.prompt('Reason for rejection (shown to employee):')||'';if(!reason.trim())return;}
    setBusy(`${row._id}:${kind}`);try{await put(`/closures/${row._id}/${kind}`,kind==='reject'?{reason}:{});toast.success(kind==='approve'?'Appointment finally closed':'Request returned to employee');load();}catch(e){toast.error(e.message);}finally{setBusy('');}};
  return <><PageHeader title="Closure requests" description="Review employee site photos and appointment invoices before final close."><button className="btn-outline" onClick={load}><RefreshCw className="h-4 w-4"/>Refresh</button></PageHeader>
    <div className="space-y-4">{rows.length===0?<div className="card text-sm text-navy/60">No appointment close requests are waiting for review.</div>:rows.map(row=>{const a=row.appointment||{};const invoice=row.invoice;return <article key={row._id} className="card grid gap-5 xl:grid-cols-[1.2fr_1fr_auto]">
      <div><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-bold text-navy">{a.appointmentId||'Appointment'}</h2><span className="badge bg-amber-100 text-amber-800">Pending review</span></div><p className="mt-2 text-sm text-navy/70">{a.customer?.name||'Customer'} · {a.service?.title||'Service'}</p><p className="mt-1 text-sm text-navy/60">{formatDate(a.date)} {a.time||''} · {a.address||'No location provided'}</p><p className="mt-1 text-sm text-navy/60">Assigned to: {a.employee?.name||'—'} · submitted {formatDate(row.completedAt)}</p>
        {invoice?<p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">Invoice {invoice.invoiceNumber} · {currency(invoice.total)} · {invoice.paymentStatus}</p>:<div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Appointment invoice required before approval.<Link className="ml-2 inline-flex items-center gap-1 font-semibold underline" to={`/admin/invoices?appointment=${a._id}`}>Create invoice <ExternalLink className="h-3 w-3"/></Link></div>}</div>
      <div className="grid grid-cols-2 gap-2">{(row.images||[]).map((src,i)=><a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt={`Site photo ${i+1}`} className="h-36 w-full rounded-xl object-cover"/></a>)}</div>
      <div className="flex items-start gap-2 xl:flex-col"><button className="btn-primary" disabled={!invoice||!!busy} onClick={()=>action(row,'approve')}><Check className="h-4 w-4"/>{busy===`${row._id}:approve`?'Approving…':'Approve & close'}</button><button className="btn-outline" disabled={!!busy} onClick={()=>action(row,'reject')}><X className="h-4 w-4"/>Return to employee</button></div>
    </article>;})}</div></>;
}
