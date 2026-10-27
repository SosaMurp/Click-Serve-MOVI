import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// RF-94: comprobante imprimible o compartible como PDF. Todo valor se escapa antes de ir al HTML.
export type ReceiptRow = { label: string; value: string; strong?: boolean };

const esc = (v: string) => v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export function receiptHtml(title: string, folio: string, rows: ReceiptRow[], note?: string): string {
  const body = rows.map((r) => `<tr${r.strong ? ' class="strong"' : ''}><td>${esc(r.label)}</td><td class="v">${esc(r.value)}</td></tr>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  body { font-family: -apple-system, Roboto, 'Segoe UI', sans-serif; color: #141A23; margin: 32px; }
  .brand { font-weight: 700; font-size: 22px; } .brand b { color: #0B4F85; } .brand i { color: #E8801F; font-style: normal; }
  h1 { font-size: 18px; margin: 24px 0 4px; } .folio { color: #475467; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
  td { padding: 10px 0; border-bottom: 1px solid #E6E9EF; } td.v { text-align: right; font-variant-numeric: tabular-nums; }
  tr.strong td { font-weight: 700; font-size: 16px; border-bottom: 2px solid #141A23; }
  .note { color: #667085; font-size: 12px; margin-top: 24px; }
</style></head><body>
<div class="brand"><b>Click</b><i>&amp;Serve</i></div>
<h1>${esc(title)}</h1><div class="folio">Folio ${esc(folio)}</div>
<table>${body}</table>
${note ? `<p class="note">${esc(note)}</p>` : ''}
</body></html>`;
}

export async function shareReceipt(html: string): Promise<void> {
  if (Platform.OS === 'web') {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  else await Print.printAsync({ uri });
}
