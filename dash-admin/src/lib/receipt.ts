import { t } from '@/i18n'
import { dateTime, rupiah, TRANSACTION_METHODS } from '@/lib/format'
import type { Tenant, Transaction } from '@/types'

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c)

// Baris ringkasan struk; [label, nilai, tebal].
function totals(tx: Transaction): [string, string, boolean][] {
  const rows: [string, string, boolean][] = []
  if (tx.discount) rows.push([t('receipt.subtotal'), rupiah(tx.subtotal), false], [t('receipt.discount'), `-${rupiah(tx.discount)}`, false])
  rows.push([t('receipt.total'), rupiah(tx.amount), true], [t('receipt.method'), TRANSACTION_METHODS[tx.payment_method], false])
  if (tx.paid_amount !== null) rows.push([t('receipt.received'), rupiah(tx.paid_amount), false], [t('receipt.change'), rupiah(tx.change), false])
  return rows
}

/** Teks struk untuk dikirim lewat WhatsApp. */
export function receiptText(tx: Transaction, tenant: Pick<Tenant, 'name'>): string {
  return [
    `*${tenant.name}*`,
    `${tx.number} · ${dateTime(tx.created_at)}`,
    '',
    ...tx.items.map((i) => `${i.qty}x ${i.name}: ${rupiah(i.subtotal)}`),
    '',
    ...totals(tx).map(([label, value]) => `${label}: ${value}`),
    '',
    t('receipt.thanks'),
  ].join('\n')
}

/** Cetak lewat iframe tersembunyi, lebar kertas thermal 58-80 mm. */
export function printReceipt(tx: Transaction, tenant: Pick<Tenant, 'name' | 'address' | 'whatsapp'>) {
  const row = (left: string, right: string, bold = false) =>
    `<tr${bold ? ' class="b"' : ''}><td>${escapeHtml(left)}</td><td class="r">${escapeHtml(right)}</td></tr>`

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(tx.number)}</title><style>
    @page { margin: 2mm; }
    body { font: 12px/1.45 ui-monospace, Consolas, monospace; color: #000; width: 70mm; margin: 0; }
    h1 { font-size: 14px; margin: 0; text-align: center; }
    p { margin: 0; text-align: center; }
    table { width: 100%; border-collapse: collapse; }
    td { vertical-align: top; padding: 1px 0; }
    .r { text-align: right; white-space: nowrap; padding-left: 8px; }
    .b { font-weight: 700; }
    hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
  </style></head><body>
    <h1>${escapeHtml(tenant.name)}</h1>
    ${tenant.address ? `<p>${escapeHtml(tenant.address)}</p>` : ''}
    ${tenant.whatsapp ? `<p>${escapeHtml(tenant.whatsapp)}</p>` : ''}
    <hr>
    <p>${escapeHtml(tx.number)}</p>
    <p>${escapeHtml(dateTime(tx.created_at))}</p>
    ${tx.customer_name ? `<p>${escapeHtml(tx.customer_name)}</p>` : ''}
    <hr>
    <table>${tx.items.map((i) => row(`${i.qty}x ${i.name}`, rupiah(i.subtotal))).join('')}</table>
    <hr>
    <table>${totals(tx).map(([l, v, bold]) => row(l, v, bold)).join('')}</table>
    <hr>
    <p>${escapeHtml(t('receipt.thanks'))}</p>
  </body></html>`

  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  frame.onload = () => {
    frame.contentWindow?.focus()
    frame.contentWindow?.print()
    setTimeout(() => frame.remove(), 1000)
  }
  frame.srcdoc = html
  document.body.appendChild(frame)
}
