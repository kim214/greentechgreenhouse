import {
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { supabase } from "./supabaseClient";
import type { DatePreset, FinanceCustomer, FinanceInvoice, FinancePayment } from "./financeTypes";
import type { DateRange } from "./financeMetrics";

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function rangeForPreset(preset: DatePreset, custom?: DateRange, now = new Date()): DateRange {
  switch (preset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "7d":
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case "30d":
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfMonth(now) };
    case "last_month": {
      const d = subMonths(now, 1);
      return { start: startOfMonth(d), end: endOfMonth(d) };
    }
    case "this_quarter":
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case "this_year":
      return { start: startOfYear(now), end: endOfYear(now) };
    case "last_year": {
      const d = subYears(now, 1);
      return { start: startOfYear(d), end: endOfYear(d) };
    }
    case "6m":
      return { start: startOfDay(subMonths(now, 6)), end: endOfDay(now) };
    case "12m":
      return { start: startOfDay(subMonths(now, 12)), end: endOfDay(now) };
    case "18m":
      return { start: startOfDay(subMonths(now, 18)), end: endOfDay(now) };
    case "custom":
      return custom ?? { start: startOfDay(subMonths(now, 18)), end: endOfDay(now) };
  }
}

export async function fetchFinanceBundle(): Promise<{
  payments: FinancePayment[];
  invoices: FinanceInvoice[];
  customers: FinanceCustomer[];
  fetchedAt: string;
}> {
  const [payRes, invRes, custRes] = await Promise.all([
    supabase
      .from("finance_payments")
      .select("*")
      .neq("data_origin", "forecast")
      .order("created_at", { ascending: false })
      .limit(4000),
    supabase.from("finance_invoices").select("*").neq("data_origin", "forecast").limit(4000),
    supabase.from("finance_customers").select("*"),
  ]);

  if (payRes.error) throw new Error(payRes.error.message);

  const customers = (custRes.data ?? []) as FinanceCustomer[];
  const invoices = ((invRes.data ?? []) as Array<FinanceInvoice & { amount: unknown }>).map((row) => ({
    ...row,
    amount: num(row.amount),
  }));
  const byCustomer = new Map(customers.map((c) => [c.id, c]));
  const byInvoice = new Map(invoices.map((i) => [i.id, i]));

  const payments: FinancePayment[] = ((payRes.data ?? []) as Array<Record<string, unknown>>).map((row) => {
    const customer_id = String(row.customer_id);
    const invoice_id = row.invoice_id ? String(row.invoice_id) : null;
    return {
      id: String(row.id),
      transaction_id: String(row.transaction_id),
      customer_id,
      invoice_id,
      amount: num(row.amount),
      currency: String(row.currency ?? "KES"),
      payment_method: row.payment_method as FinancePayment["payment_method"],
      provider: row.provider ? String(row.provider) : null,
      provider_reference: row.provider_reference ? String(row.provider_reference) : null,
      payment_reference: String(row.payment_reference),
      status: row.status as FinancePayment["status"],
      failure_reason: row.failure_reason ? String(row.failure_reason) : null,
      revenue_source: row.revenue_source as FinancePayment["revenue_source"],
      product_name: String(row.product_name),
      receipt_number: row.receipt_number ? String(row.receipt_number) : null,
      order_id: row.order_id ? String(row.order_id) : null,
      payment_date: row.payment_date ? String(row.payment_date) : null,
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      data_origin: row.data_origin as FinancePayment["data_origin"],
      is_recurring: Boolean(row.is_recurring),
      customer: byCustomer.get(customer_id),
      invoice: invoice_id ? byInvoice.get(invoice_id) ?? null : null,
    };
  });

  return { payments, invoices, customers, fetchedAt: new Date().toISOString() };
}

export async function writeFinanceAudit(action: string, recordType: string, recordId?: string) {
  await supabase.rpc("finance_write_audit", {
    p_action: action,
    p_record_type: recordType,
    p_record_id: recordId ?? null,
    p_previous: null,
    p_next: null,
  });
}
