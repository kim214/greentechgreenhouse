import { useMemo, useState } from "react";
import { Download, Eye, FileText, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { StatusBadge } from "../adminUi";
import { METHOD_LABEL, SOURCE_LABEL, STATUS_LABEL, type FinancePayment } from "../../../lib/financeTypes";
import { paymentStamp } from "../../../lib/financeMetrics";
import { useMoney } from "../../../hooks/useFinanceCurrency";
import { downloadReceipt, openInvoice, openReceipt } from "../../../lib/financeExport";
import { format } from "date-fns";

function tone(status: FinancePayment["status"]) {
  if (status === "successful") return "ok" as const;
  if (status === "pending" || status === "initiated") return "warn" as const;
  if (status === "failed") return "bad" as const;
  return "neutral" as const;
}

export function FinanceLedger({
  rows,
  onOpen,
}: {
  rows: FinancePayment[];
  onOpen: (row: FinancePayment) => void;
}) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const { money } = useMoney();
  const pageSize = 12;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) =>
      [p.transaction_id, p.payment_reference, p.product_name, p.customer?.name, p.receipt_number, p.invoice?.invoice_number]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const slice = filtered.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-display text-lg">Payment ledger</CardTitle>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search customer, reference, product…"
          className="max-w-sm rounded-xl"
        />
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-muted-foreground">
                    No payments match this filter.
                  </TableCell>
                </TableRow>
              ) : (
                slice.map((p) => (
                  <TableRow key={p.id} className="cursor-pointer" onClick={() => onOpen(p)}>
                    <TableCell className="font-medium">{p.transaction_id}</TableCell>
                    <TableCell>{format(new Date(paymentStamp(p)), "d MMM yyyy")}</TableCell>
                    <TableCell>
                      <div>{p.customer?.name ?? "—"}</div>
                      <div className="text-xs capitalize text-muted-foreground">{p.customer?.customer_type}</div>
                    </TableCell>
                    <TableCell>
                      <div>{p.product_name}</div>
                      <div className="text-xs text-muted-foreground">{SOURCE_LABEL[p.revenue_source]}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{money(p.amount)}</TableCell>
                    <TableCell>{METHOD_LABEL[p.payment_method]}</TableCell>
                    <TableCell>
                      <StatusBadge label={STATUS_LABEL[p.status]} tone={tone(p.status)} />
                    </TableCell>
                    <TableCell className="text-xs">{p.payment_reference}</TableCell>
                    <TableCell className="text-xs">{p.invoice?.invoice_number ?? "—"}</TableCell>
                    <TableCell className="text-xs">{p.receipt_number ?? "—"}</TableCell>
                    <TableCell>
                      <RowActions p={p} onOpen={onOpen} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {slice.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpen(p)}
              className="w-full rounded-xl border border-border/50 p-3 text-left"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{p.customer?.name ?? p.transaction_id}</span>
                <StatusBadge label={STATUS_LABEL[p.status]} tone={tone(p.status)} />
              </div>
              <div className="mt-1 text-sm tabular-nums">{money(p.amount)}</div>
              <div className="text-xs text-muted-foreground">
                {p.product_name} · {format(new Date(paymentStamp(p)), "d MMM yyyy")}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filtered.length} row{filtered.length === 1 ? "" : "s"}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RowActions({ p, onOpen }: { p: FinancePayment; onOpen: (row: FinancePayment) => void }) {
  const { money } = useMoney();
  return (
    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
      <Button size="icon" variant="ghost" aria-label="View" onClick={() => onOpen(p)}>
        <Eye className="h-4 w-4" />
      </Button>
      {p.status === "successful" && (
        <>
          <Button size="icon" variant="ghost" aria-label="Receipt" onClick={() => openReceipt(p, money)}>
            <Receipt className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Invoice" onClick={() => openInvoice(p, money)}>
            <FileText className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" aria-label="Download receipt" onClick={() => downloadReceipt(p, money)}>
            <Download className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
