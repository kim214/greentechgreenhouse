import { format } from "date-fns";
import { METHOD_LABEL, SOURCE_LABEL, STATUS_LABEL, type FinancePayment } from "./financeTypes";
import { isVerifiedCollected, kes, type DateRange } from "./financeMetrics";
import { writeFinanceAudit } from "./financeApi";

function csvEscape(v: unknown) {
  const s = v == null ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportTransactionsCsv(
  rows: FinancePayment[],
  verifiedOnly: boolean,
  money: (n: number) => string = kes,
  displayCurrency = "KES"
) {
  const list = verifiedOnly ? rows.filter(isVerifiedCollected) : rows.filter((p) => p.data_origin !== "forecast");
  const header = [
    "Transaction ID",
    "Date",
    "Customer",
    "Customer type",
    "Product",
    "Source",
    "Amount (ledger KES)",
    "Amount (display)",
    "Display currency",
    "Method",
    "Payment reference",
    "Status",
    "Origin",
    "Receipt",
    "Invoice",
  ];
  const lines = [
    header.join(","),
    ...list.map((p) =>
      [
        p.transaction_id,
        p.payment_date ?? p.created_at,
        p.customer?.name ?? "",
        p.customer?.customer_type ?? "",
        p.product_name,
        SOURCE_LABEL[p.revenue_source],
        p.amount,
        money(p.amount),
        displayCurrency,
        METHOD_LABEL[p.payment_method],
        p.payment_reference,
        STATUS_LABEL[p.status],
        p.data_origin,
        p.receipt_number ?? "",
        p.invoice?.invoice_number ?? "",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];
  download(`greentech-transactions-${format(new Date(), "yyyyMMdd")}.csv`, lines.join("\n"), "text/csv");
  await writeFinanceAudit("export_transactions_csv", "finance_payments", verifiedOnly ? "verified" : "ledger");
}

export async function exportReconciliationCsv(
  rows: FinancePayment[],
  money: (n: number) => string = kes,
  displayCurrency = "KES"
) {
  const list = rows.filter((p) => p.data_origin !== "forecast");
  const header = [
    "Transaction ID",
    "Payment reference",
    "Provider",
    "Provider reference",
    "Status",
    "Amount (ledger KES)",
    "Amount (display)",
    "Display currency",
    "Method",
    "Payment date",
    "Invoice",
    "Receipt",
    "Origin",
  ];
  const lines = [
    header.join(","),
    ...list.map((p) =>
      [
        p.transaction_id,
        p.payment_reference,
        p.provider ?? "",
        p.provider_reference ?? "",
        STATUS_LABEL[p.status],
        p.amount,
        money(p.amount),
        displayCurrency,
        METHOD_LABEL[p.payment_method],
        p.payment_date ?? p.created_at,
        p.invoice?.invoice_number ?? "",
        p.receipt_number ?? "",
        p.data_origin,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];
  download(`greentech-reconciliation-${format(new Date(), "yyyyMMdd")}.csv`, lines.join("\n"), "text/csv");
  await writeFinanceAudit("export_reconciliation_csv", "finance_payments", "reconciliation");
}

export async function exportRevenueCsv(
  monthly: Array<{ label: string; collected: number; verified: number; transactions: number; average: number }>,
  money: (n: number) => string = kes
) {
  const lines = [
    ["Month", "Collected", "Provider-verified", "Transactions", "Average"].join(","),
    ...monthly.map((m) => [m.label, money(m.collected), money(m.verified), m.transactions, money(m.average)].map(csvEscape).join(",")),
  ];
  download(`greentech-revenue-monthly-${format(new Date(), "yyyyMMdd")}.csv`, lines.join("\n"), "text/csv");
  await writeFinanceAudit("export_revenue_csv", "finance_payments", "monthly");
}

export function receiptHtml(p: FinancePayment, money: (n: number) => string = kes) {
  return `<!DOCTYPE html><html><head><title>${p.receipt_number ?? p.transaction_id}</title>
  <style>body{font-family:Inter,system-ui,sans-serif;padding:32px;color:#163326}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin-top:16px}td{padding:8px 0;border-bottom:1px solid #e4eee8}</style>
  </head><body>
  <h1>GreenTech Greenhouse</h1>
  <p>Receipt ${p.receipt_number ?? "—"}</p>
  <table>
  <tr><td>Transaction</td><td>${p.transaction_id}</td></tr>
  <tr><td>Payment reference</td><td>${p.payment_reference}</td></tr>
  <tr><td>Customer</td><td>${p.customer?.name ?? "—"}</td></tr>
  <tr><td>Service</td><td>${p.product_name}</td></tr>
  <tr><td>Amount</td><td>${money(p.amount)}</td></tr>
  <tr><td>Method</td><td>${METHOD_LABEL[p.payment_method]}</td></tr>
  <tr><td>Status</td><td>${STATUS_LABEL[p.status]}</td></tr>
  <tr><td>Date</td><td>${p.payment_date ?? p.created_at}</td></tr>
  <tr><td>Verification</td><td>${p.data_origin === "verified" ? "Provider-verified" : "Ledger recorded"}</td></tr>
  </table>
  <p style="margin-top:24px;font-size:12px;color:#5b7264">Internal ledger document. Provider confirmation is shown only when a payment reference was returned by the processor.</p>
  </body></html>`;
}

export function openReceipt(p: FinancePayment, money: (n: number) => string = kes) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!w) return;
  w.document.write(receiptHtml(p, money));
  w.document.close();
}

export function downloadReceipt(p: FinancePayment, money: (n: number) => string = kes) {
  download(`${p.receipt_number ?? p.transaction_id}.html`, receiptHtml(p, money), "text/html");
}

export async function exportSummaryPdf(opts: {
  range: DateRange;
  recorded: number;
  verified: number;
  tx: number;
  pending: number;
  failed: number;
  refunds: number;
  outstanding: number;
  sources: Array<{ label: string; revenue: number; share: number }>;
  money?: (n: number) => string;
  currency?: string;
}) {
  const money = opts.money ?? kes;
  const html = `<!DOCTYPE html><html><head><title>GreenTech financial summary</title>
  <style>body{font-family:Inter,system-ui,sans-serif;padding:36px;color:#163326}h1{font-size:22px}h2{font-size:16px;margin-top:28px}td{padding:6px 12px 6px 0}</style></head><body>
  <h1>GreenTech Greenhouse — Financial summary</h1>
  <p>Period ${format(opts.range.start, "d MMM yyyy")} – ${format(opts.range.end, "d MMM yyyy")}<br/>Generated ${format(new Date(), "d MMM yyyy HH:mm")}<br/>Display currency ${opts.currency ?? "KES"}</p>
  <table>
    <tr><td>Provider-verified collected</td><td>${money(opts.verified)}</td></tr>
    <tr><td>Recorded successful receipts</td><td>${money(opts.recorded)}</td></tr>
    <tr><td>Transaction attempts</td><td>${opts.tx}</td></tr>
    <tr><td>Pending</td><td>${opts.pending}</td></tr>
    <tr><td>Failed</td><td>${opts.failed}</td></tr>
    <tr><td>Refunds</td><td>${opts.refunds}</td></tr>
    <tr><td>Outstanding invoices</td><td>${money(opts.outstanding)}</td></tr>
  </table>
  <h2>Recorded receipts by source</h2>
  <table>${opts.sources.map((s) => `<tr><td>${s.label}</td><td>${money(s.revenue)}</td><td>${s.share}%</td></tr>`).join("")}</table>
  <p style="margin-top:24px;font-size:12px">Ledger amounts are stored in KES and converted for display. Forecast values are omitted.</p>
  </body></html>`;
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
  await writeFinanceAudit("export_financial_summary", "finance_payments", "summary");
}

export function invoiceHtml(p: FinancePayment, money: (n: number) => string = kes) {
  return receiptHtml(p, money).replace("Receipt", "Invoice").replace(p.receipt_number ?? "", p.invoice?.invoice_number ?? "—");
}

export function openInvoice(p: FinancePayment, money: (n: number) => string = kes) {
  const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
  if (!w) return;
  w.document.write(invoiceHtml(p, money));
  w.document.close();
}
