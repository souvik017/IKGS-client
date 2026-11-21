import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';
import logo from '../../../public/images/logo/logo.jpeg';

/* ---------- ₹ glyph font ----------
   Helvetica has no ₹, so only the ₹ character uses this font (loaded from CDN).
   To work offline, download the two files into public/fonts/ and change the URLs. */
Font.register({
  family: 'NotoRupee',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.8/files/noto-sans-latin-ext-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans@5.0.8/files/noto-sans-latin-ext-700-normal.woff', fontWeight: 700 },
  ],
});

/* ---------- constants (same as the printed invoice) ---------- */
const B = 0.8; // border width
const BORDER = '#000';

const TERMS = [
  '1.By requesting pest control services from IKGS SOLUTION, you agree to the following terms: Payment is due upon completion of services. Cancellations require 24-hour notice; a 30-day notice is required for service contract cancellations. We offer a service guarantee for re-treatment if pests return within the agreed period. Customers must ensure access to the property for treatment. We use EPA-approved, safe products and follow safety guidelines. IKGS SOLUTION is not liable for damages caused by pre-existing conditions or for property damage unless caused by technician actions. Customers should follow pest prevention recommendations to maintain effectiveness. Any disputes will be resolved according to local laws. These terms may be updated at any time.',
  '2. Goods once sold will not be returned and/or exchanged. We reserve to ourselves the right to demand payment of this bill at any time.',
  '3. Payment are to be made in favour of " IKGS SOLUTION "BY A/c payee cheque or RTGS/NEFT can be done.',
];

/* ---------- styles ---------- */
const s = StyleSheet.create({
  page: { padding: 24, fontSize: 8, fontFamily: 'Helvetica', color: '#000' },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  title: { width: '50%', textAlign: 'center', fontFamily: 'Helvetica-Bold', fontSize: 8 },
  copy: { width: '25%', textAlign: 'right', fontSize: 8 },

  box: { borderWidth: B, borderColor: BORDER },
  row: { flexDirection: 'row' },
  rowB: { flexDirection: 'row', borderBottomWidth: B, borderColor: BORDER },
  half: { width: '50%' },
  halfR: { width: '50%', borderRightWidth: B, borderColor: BORDER },
  bold: { fontFamily: 'Helvetica-Bold' },
  small: { fontSize: 7.5, lineHeight: 1.35 },

  // header
  head: { minHeight: 92 },
  brandRow: { flexDirection: 'row', alignItems: 'center', padding: '5 6 2 6' },
  brandName: { fontFamily: 'Helvetica-Bold', fontSize: 11, marginLeft: 6 },
  headLine: { marginLeft: 70, lineHeight: 1.35 },
  invCol: { width: '50%', padding: '5 6' },
  lbl: { fontFamily: 'Helvetica-Bold', marginBottom: 3 },

  // parties
  party: { minHeight: 98, padding: '5 4', justifyContent: 'space-between' },
  partyBottom: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 7.5 },

  // items table
  th: { fontFamily: 'Helvetica-Bold', fontSize: 9, padding: '4 4' },
  td: { padding: '4 4' },
  vr: { borderRightWidth: B, borderColor: BORDER },
  right: { textAlign: 'right' },

  // totals
  cellPad: { padding: '5 6' },
  amtRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalAmt: { fontFamily: 'Helvetica-Bold', fontSize: 10 },

  // tax table
  taxWrap: { padding: '8 16 8 16' },
  tcell: { padding: '3 4' },
  center: { textAlign: 'center' },

  // terms + sign
  terms: { minHeight: 250 },
});

/* ---------- helpers ---------- */
const fmt = n =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ₹ + amount. `style` is the cell style (width, padding, borders).
const Amt = ({ v, style, bold, size = 8, align = 'flex-end' }) => (
  <View style={[{ flexDirection: 'row', justifyContent: align }, style]}>
    <Text style={[bold ? s.bold : null, { fontSize: size }]}>
      <Text style={{ fontFamily: 'NotoRupee', fontWeight: bold ? 700 : 400 }}>₹</Text> {fmt(v)}
    </Text>
  </View>
);
const date = v =>
  v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-') : '—';
const address = c => [c?.address?.street, c?.address?.city, c?.address?.state, c?.address?.zipCode].filter(Boolean).join(', ');
const words = n => {
  const u = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const under = x => (x < 20 ? u[x] : `${t[Math.floor(x / 10)]}${x % 10 ? ` ${u[x % 10]}` : ''}`);
  const group = (x, unit) => (x ? `${under(x)} ${unit} ` : '');
  let x = Math.round(Number(n) || 0);
  if (!x) return 'Rupees Zero Only';
  let out = '';
  if (x >= 10000000) { out += group(Math.floor(x / 10000000), 'Crore'); x %= 10000000; }
  if (x >= 100000) { out += group(Math.floor(x / 100000), 'Lakh'); x %= 100000; }
  if (x >= 1000) { out += group(Math.floor(x / 1000), 'Thousand'); x %= 1000; }
  if (x >= 100) { out += group(Math.floor(x / 100), 'Hundred'); x %= 100; }
  if (x) out += under(x) + ' ';
  return `Rupees ${out.trim()} Only`;
};

// items table column widths (%)
const COLS = { sno: 6, part: 41, hsn: 10, qty: 11, price: 12, gst: 7, amt: 13 };

/* ---------- tax summary row (HSN wise) ---------- */
const TaxRow = ({ hsn, taxable, rate, tax, totalTax, plainTotal, bold }) => {
  const f = bold ? s.bold : null;
  const bt = { borderTopWidth: B, borderColor: BORDER };
  return (
    <View style={[s.row, bt]}>
      <Text style={[s.tcell, s.vr, f, { width: '18%' }]}>{hsn}</Text>
      <Amt v={taxable} bold={bold} style={[s.tcell, s.vr, { width: '20%' }]} />
      <Text style={[s.tcell, s.vr, s.right, f, { width: '10%' }]}>{rate}</Text>
      <Amt v={tax} bold={bold} style={[s.tcell, s.vr, { width: '14%' }]} />
      <Text style={[s.tcell, s.vr, s.right, f, { width: '10%' }]}>{rate}</Text>
      <Amt v={tax} bold={bold} style={[s.tcell, s.vr, { width: '14%' }]} />
      {plainTotal ? (
        <Text style={[s.tcell, s.right, f, { width: '14%' }]}>{totalTax}</Text>
      ) : (
        <Amt v={totalTax} bold={bold} style={[s.tcell, { width: '14%' }]} />
      )}
    </View>
  );
};

export default function TaxInvoicePdf({ invoice, settings }) {
  const items = invoice.items || [];
  const defRate = Number(invoice.taxRate || 0);
  const taxable = Math.max(0, Number(invoice.subtotal || 0) - Number(invoice.lineDiscountTotal || 0) - Number(invoice.discount || 0));
  const tax = Number(invoice.tax || 0);
  const bizName = settings?.businessName || 'IKGS SOLUTION';

  const shipName = invoice.shipTo?.name || invoice.customer?.name || '—';
  const shipAddr = invoice.shipTo?.address || invoice.appointment?.address || address(invoice.customer);
  const pos = invoice.placeOfSupply || '19-West Bengal';

  // group tax by HSN/SAC
  const groups = {};
  items.forEach(it => {
    const key = it.hsnSac || '998512';
    const base = Math.max(0, Number(it.quantity || 0) * Number(it.unitPrice || 0) - Number(it.discount || 0));
    groups[key] = groups[key] || { hsn: key, rate: 0, taxable: 0, tax: 0 };
    groups[key].taxable += base;
  });
  const taxGroups = Object.values(groups);
  const groupBase = taxGroups.reduce((n, g) => n + g.taxable, 0);
  taxGroups.forEach(g => {
    g.taxable = groupBase ? g.taxable * taxable / groupBase : 0;
    g.tax = taxable ? tax * g.taxable / taxable : 0;
    g.rate = g.taxable ? g.tax * 100 / g.taxable : defRate;
  });
  const gTaxable = taxGroups.reduce((n, g) => n + g.taxable, 0);
  const gTax = taxGroups.reduce((n, g) => n + g.tax, 0);

  const totalQty = items.reduce((n, i) => n + Number(i.quantity || 0), 0);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Title row */}
        <View style={s.topRow}>
          <View style={{ width: '25%' }} />
          <Text style={s.title}>TAX INVOICE</Text>
          <Text style={s.copy}>(Original Copy)</Text>
        </View>

        <View style={s.box}>
          {/* ===== Header: business + invoice no/date ===== */}
          <View style={[s.rowB, s.head]}>
            <View style={s.halfR}>
              <View style={s.brandRow}>
                <Image src={`${window.location.origin}${logo}`} style={{ width: 62, height: 22, objectFit: 'contain' }} />
                <Text style={s.brandName}>{bizName}</Text>
              </View>
              <View style={{ marginLeft: 6 }}>
                <Text style={[s.small, { marginLeft: 62 }]}>{settings?.address || ''}</Text>
                <Text style={[s.small, { marginLeft: 62 }]}>Contact : {settings?.phone || ''}</Text>
                <Text style={[s.small, { marginLeft: 62 }]}>Email : {settings?.email || ''}</Text>
                <Text style={[s.small, { marginLeft: 62 }]}>Website : {settings?.siteUrl || ''}</Text>
                <Text style={[s.small, { marginLeft: 62 }]}>GSTIN : {settings?.tax?.number || '—'}</Text>
              </View>
            </View>
            <View style={[s.half, s.row]}>
              <View style={s.invCol}>
                <Text style={s.lbl}>Invoice No.</Text>
                <Text style={s.bold}>{invoice.invoiceNumber}</Text>
              </View>
              <View style={s.invCol}>
                <Text style={s.lbl}>Date</Text>
                <Text style={s.bold}>{date(invoice.createdAt)}</Text>
                {invoice.dueDate ? <><Text style={[s.lbl, { marginTop: 7 }]}>Due Date</Text><Text style={s.bold}>{date(invoice.dueDate)}</Text></> : null}
              </View>
            </View>
          </View>

          {/* ===== Bill To / Ship To ===== */}
          <View style={s.rowB}>
            <View style={[s.halfR, s.party]}>
              <View>
                <Text style={s.lbl}>Bill To :</Text>
                <Text style={[s.bold, { marginBottom: 4 }]}>{invoice.customer?.name || '—'}</Text>
                <Text style={s.small}>{address(invoice.customer) || (typeof invoice.customer?.address === 'string' ? invoice.customer.address : '') || '—'}</Text>
              </View>
              <View style={s.partyBottom}>
                <Text>Contact: {invoice.customer?.phone || '—'}</Text>
                <Text>PoS: {pos}</Text>
                {invoice.customer?.gstin ? <Text>GSTIN: {invoice.customer.gstin}</Text> : null}
              </View>
            </View>
            <View style={[s.half, s.party]}>
              <View>
                <Text style={s.lbl}>Ship To</Text>
                <Text style={[s.bold, { marginBottom: 4 }]}>{shipName}</Text>
                <Text style={s.small}>{shipAddr || '—'}</Text>
              </View>
              <View style={[s.partyBottom, { justifyContent: 'flex-start' }]}>
                <Text>Contact: {invoice.customer?.phone || '—'}</Text>
                <Text style={{ marginLeft: 18 }}>PoS: {pos}</Text>
              </View>
            </View>
          </View>

          {/* ===== Items table ===== */}
          <View style={s.rowB}>
            <Text style={[s.th, s.vr, { width: `${COLS.sno}%` }]}>S.No.</Text>
            <Text style={[s.th, s.vr, { width: `${COLS.part}%` }]}>PARTICULARS</Text>
            <Text style={[s.th, s.vr, { width: `${COLS.hsn}%` }]}>HSN/SAC</Text>
            <Text style={[s.th, s.vr, s.right, { width: `${COLS.qty}%` }]}>QTY</Text>
            <Text style={[s.th, s.vr, s.right, { width: `${COLS.price}%` }]}>UNIT PRICE</Text>
            <Text style={[s.th, s.vr, s.right, { width: `${COLS.gst}%` }]}>GST</Text>
            <Text style={[s.th, s.right, { width: `${COLS.amt}%` }]}>AMOUNT</Text>
          </View>

          {items.map((it, i) => (
            <View key={`${i}-${it.item}`} style={[s.row, { minHeight: 45 }]}>
              <Text style={[s.td, s.vr, { width: `${COLS.sno}%` }]}>{i + 1}</Text>
              <View style={[s.td, s.vr, { width: `${COLS.part}%` }]}>
                <Text style={[s.bold, { fontSize: 9, marginBottom: 2 }]}>{(it.item || '').toUpperCase()}</Text>
                {it.description ? <Text style={s.small}>{it.description}</Text> : null}
                {Number(it.discount) > 0 ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={s.small}>Item discount: </Text>
                    <Amt v={it.discount} size={7.5} align="flex-start" />
                  </View>
                ) : null}
              </View>
              <Text style={[s.td, s.vr, { width: `${COLS.hsn}%` }]}>{it.hsnSac || '998512'}</Text>
              <Text style={[s.td, s.vr, s.right, { width: `${COLS.qty}%` }]}>{it.quantity} {it.unit || 'NOS'}</Text>
              <Amt v={it.unitPrice} style={[s.td, s.vr, { width: `${COLS.price}%` }]} />
              <Text style={[s.td, s.vr, s.right, { width: `${COLS.gst}%` }]}>{Number(it.taxRate || defRate)}%</Text>
              <Amt v={it.lineTotal} bold style={[s.td, { width: `${COLS.amt}%` }]} />
            </View>
          ))}

          {/* TOTAL row */}
          <View style={[s.row, { borderTopWidth: B, borderBottomWidth: B, borderColor: BORDER }]}>
            <Text style={[s.td, s.vr, { width: `${COLS.sno}%` }]} />
            <Text style={[s.td, s.vr, s.bold, { width: `${COLS.part}%` }]}>TOTAL</Text>
            <Text style={[s.td, s.vr, { width: `${COLS.hsn}%` }]} />
            <Text style={[s.td, s.vr, s.bold, s.right, { width: `${COLS.qty}%` }]}>{totalQty}</Text>
            <Text style={[s.td, s.vr, { width: `${COLS.price}%` }]} />
            <Text style={[s.td, s.vr, { width: `${COLS.gst}%` }]} />
            <Amt v={invoice.subtotal} bold style={[s.td, { width: `${COLS.amt}%` }]} />
          </View>

          {/* ===== Delivery terms | Sub total / Tax ===== */}
          <View style={s.rowB}>
            <View style={[s.halfR, s.cellPad, { minHeight: 58 }]}>
              <Text style={s.bold}>Delivery Terms :</Text>
              {invoice.notes ? <Text style={[s.small, { marginTop: 3 }]}>{invoice.notes}</Text> : null}
            </View>
            <View style={[s.half, s.cellPad]}>
              <View style={[s.amtRow, { marginBottom: 6 }]}>
                <Text>Sub Total</Text>
                <Amt v={taxable} bold />
              </View>
              {Number(invoice.discount || 0) + Number(invoice.lineDiscountTotal || 0) > 0 ? <View style={[s.amtRow, { marginBottom: 6 }]}><Text>Discount</Text><Amt v={Number(invoice.discount || 0) + Number(invoice.lineDiscountTotal || 0)} bold /></View> : null}
              <View style={s.amtRow}>
                <Text>Tax Amount (+)</Text>
                <Amt v={tax} bold />
              </View>
              {Number(invoice.roundOff) ? <View style={[s.amtRow, { marginTop: 5 }]}><Text>Round Off</Text><Amt v={invoice.roundOff} bold /></View> : null}
            </View>
          </View>

          {/* ===== Amount in words | TOTAL AMOUNT ===== */}
          <View style={s.rowB}>
            <View style={[s.halfR, s.cellPad, { minHeight: 52 }]}>
              <Text style={[s.bold, { marginBottom: 6 }]}>Amount in Words :</Text>
              <Text>Amount (in words) : {words(invoice.total)}</Text>
            </View>
            <View style={[s.half, s.cellPad]}>
              <View style={s.amtRow}>
                <Text style={s.totalAmt}>TOTAL AMOUNT</Text>
                <Amt v={invoice.total} bold size={10} />
              </View>
              <View style={[s.amtRow, { marginTop: 5 }]}><Text style={s.small}>Amount paid</Text><Text style={s.small}>₹ {fmt(invoice.amountPaid)}</Text></View>
              <View style={s.amtRow}><Text style={s.small}>Balance due</Text><Text style={s.small}>₹ {fmt(invoice.balanceDue)}</Text></View>
              {invoice.paymentMethod === 'bank-transfer' ? <><Text style={[s.small, { marginTop: 3 }]}>Payment mode: Bank transfer · Transferred: ₹ {fmt(invoice.transferAmount)}</Text>{invoice.transferReference ? <Text style={s.small}>Transfer reference: {invoice.transferReference}</Text> : null}</> : invoice.paymentMethod ? <Text style={[s.small, { marginTop: 3 }]}>Payment mode: {invoice.paymentMethod}</Text> : null}
            </View>
          </View>

          {/* ===== HSN / CGST / SGST summary ===== */}
          <View style={s.taxWrap}>
            <View style={{ borderWidth: B, borderColor: BORDER }}>
              {/* header */}
              <View style={s.row}>
                <View style={[s.vr, { width: '18%', justifyContent: 'center' }]}>
                  <Text style={[s.bold, s.center]}>HSN/SAC</Text>
                </View>
                <View style={[s.vr, { width: '20%', justifyContent: 'center' }]}>
                  <Text style={[s.bold, s.center]}>Taxable Amount</Text>
                </View>
                <View style={[s.vr, { width: '24%' }]}>
                  <Text style={[s.tcell, s.bold, s.center, { borderBottomWidth: B, borderColor: BORDER }]}>CGST</Text>
                  <View style={s.row}>
                    <Text style={[s.tcell, s.bold, s.center, s.vr, { width: '42%' }]}>Rate</Text>
                    <Text style={[s.tcell, s.bold, s.center, { width: '58%' }]}>Amount</Text>
                  </View>
                </View>
                <View style={[s.vr, { width: '24%' }]}>
                  <Text style={[s.tcell, s.bold, s.center, { borderBottomWidth: B, borderColor: BORDER }]}>SGST</Text>
                  <View style={s.row}>
                    <Text style={[s.tcell, s.bold, s.center, s.vr, { width: '42%' }]}>Rate</Text>
                    <Text style={[s.tcell, s.bold, s.center, { width: '58%' }]}>Amount</Text>
                  </View>
                </View>
                <View style={{ width: '14%', justifyContent: 'center' }}>
                  <Text style={[s.bold, s.center]}>Total Tax Amount</Text>
                </View>
              </View>

              {taxGroups.map(g => (
                <TaxRow
                  key={g.hsn}
                  hsn={g.hsn}
                  taxable={g.taxable}
                  rate={`${g.rate / 2}%`}
                  tax={g.tax / 2}
                  totalTax={g.tax}
                />
              ))}
              <TaxRow
                bold
                hsn="Total"
                taxable={gTaxable}
                rate=""
                tax={gTax / 2}
                totalTax={fmt(gTax)}
                plainTotal
              />
            </View>
          </View>

          {/* ===== Terms / Declaration | Signature ===== */}
          <View style={[s.row, s.terms, { borderTopWidth: B, borderColor: BORDER }]}>
            <View style={[s.halfR, s.cellPad]}>
              <Text style={[s.bold, { marginBottom: 3 }]}>Terms / Declaration</Text>
              {TERMS.map((t, i) => (
                <Text key={i} style={s.small}>{t}</Text>
              ))}

              {invoice.dueDate ? <><Text style={[s.small, { marginTop: 10 }]}>Bank Details -</Text><Text style={s.small}>Bank Name    : {settings?.bankName || 'SBI'}</Text><Text style={s.small}>Branch       : {settings?.bankBranch || 'Kalyani'}</Text><Text style={s.small}>Account No.  : {settings?.bankAccount || '784512523690'}</Text><Text style={s.small}>IFSC         : {settings?.bankIfsc || 'SBIN0012'}</Text></> : null}
            </View>
            <View style={[s.half, { alignItems: 'center', justifyContent: 'center', padding: 8 }]}>
              {settings?.signature ? (
                <Image src={settings.signature} style={{ width: 110, height: 40, objectFit: 'contain', marginBottom: 6 }} />
              ) : (
                <View style={{ height: 46 }} />
              )}
              <Text style={s.bold}>For, {bizName}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
