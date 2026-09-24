import { useCallback, useEffect, useState } from "react";
import { fetchFinanceBundle } from "../lib/financeApi";
import type { DatePreset, FinanceCustomer, FinanceInvoice, FinancePayment, RevenueSource } from "../lib/financeTypes";
import type { DateRange } from "../lib/financeMetrics";

export function useAdminFinance(enabled: boolean) {
  const [payments, setPayments] = useState<FinancePayment[]>([]);
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [customers, setCustomers] = useState<FinanceCustomer[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    try {
      const next = await fetchFinanceBundle();
      setPayments(next.payments);
      setInvoices(next.invoices);
      setCustomers(next.customers);
      setFetchedAt(next.fetchedAt);
      setError(null);
    } catch {
      setError("Could not load financial records. Confirm phase13 finance SQL has been run and you are signed in as admin.");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void reload();
  }, [enabled, reload]);

  return { payments, invoices, customers, fetchedAt, loading, error, reload };
}

export function useFinanceFilters() {
  const [preset, setPreset] = useState<DatePreset>("18m");
  const [custom, setCustom] = useState<DateRange | undefined>();
  const [source, setSource] = useState<RevenueSource | "all">("all");
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [monthKey, setMonthKey] = useState<string | null>(null);
  const [timelineMonths, setTimelineMonths] = useState<6 | 12 | 18>(18);

  const resetDrill = useCallback(() => {
    setMonthKey(null);
    setSource("all");
    setStatus("all");
  }, []);

  return {
    preset,
    setPreset,
    custom,
    setCustom,
    source,
    setSource,
    status,
    setStatus,
    query,
    setQuery,
    monthKey,
    setMonthKey,
    timelineMonths,
    setTimelineMonths,
    resetDrill,
  };
}
