import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useAdminFinance, useFinanceFilters } from "../../../hooks/useAdminFinance";
import { rangeForPreset, writeFinanceAudit } from "../../../lib/financeApi";
import {
  buildForecast,
  buildMonthSeries,
  customerBreakdown,
  customerSplit,
  insights,
  paymentStamp,
  periodMetrics,
  sourceBreakdown,
  statusBreakdown,
} from "../../../lib/financeMetrics";
import type { FinancePayment, ForecastMode, RevenueSource } from "../../../lib/financeTypes";
import { PageError, PageLoading } from "../../layout/PageState";
import { useMoney } from "../../../hooks/useFinanceCurrency";
import { FinanceKpis } from "./FinanceKpis";
import { FinanceAnalyticsCharts, FinanceTimeline } from "./FinanceCharts";
import { FinanceLedger } from "./FinanceLedger";
import { FinanceCurrencyBar, FinanceCurrencyProvider } from "./FinanceCurrencyBar";
import {
  FinanceCustomerTable,
  FinanceDetail,
  FinanceExports,
  FinanceFilters,
  FinanceForecastPanel,
  FinanceInsights,
  FinanceSourceTable,
} from "./FinancePanels";

export function FinanceDashboard({ enabled }: { enabled: boolean }) {
  return (
    <FinanceCurrencyProvider>
      <FinanceDashboardInner enabled={enabled} />
    </FinanceCurrencyProvider>
  );
}

function FinanceDashboardInner({ enabled }: { enabled: boolean }) {
  const { payments, invoices, customers, fetchedAt, loading, error, reload } = useAdminFinance(enabled);
  const filters = useFinanceFilters();
  const [detail, setDetail] = useState<FinancePayment | null>(null);
  const [mode, setMode] = useState<ForecastMode>("both");
  const [customerId, setCustomerId] = useState("all");

  const range = useMemo(() => rangeForPreset(filters.preset, filters.custom), [filters.preset, filters.custom]);

  const bySource = useMemo(() => {
    if (filters.source === "all") return payments;
    return payments.filter((p) => p.revenue_source === filters.source);
  }, [payments, filters.source]);

  const scoped = useMemo(() => {
    if (customerId === "all") return bySource;
    return bySource.filter((p) => p.customer_id === customerId);
  }, [bySource, customerId]);

  const scopedInvoices = useMemo(() => {
    if (customerId === "all") return invoices;
    return invoices.filter((inv) => inv.customer_id === customerId);
  }, [invoices, customerId]);

  const ledgerRows = useMemo(() => {
    return scoped.filter((p) => {
      if (!inRangeStamp(p, range)) return false;
      if (filters.status !== "all") {
        if (filters.status === "pending") {
          if (p.status !== "pending" && p.status !== "initiated") return false;
        } else if (p.status !== filters.status) {
          return false;
        }
      }
      if (filters.monthKey && format(parseISO(paymentStamp(p)), "yyyy-MM") !== filters.monthKey) return false;
      return true;
    });
  }, [scoped, range, filters.status, filters.monthKey]);

  const metrics = useMemo(() => periodMetrics(scoped, scopedInvoices, range), [scoped, scopedInvoices, range]);
  const fleetMetrics = useMemo(() => periodMetrics(bySource, invoices, range), [bySource, invoices, range]);
  const month = useMemo(
    () => periodMetrics(scoped, scopedInvoices, rangeForPreset("this_month")).recordedCollected,
    [scoped, scopedInvoices]
  );
  const quarter = useMemo(
    () => periodMetrics(scoped, scopedInvoices, rangeForPreset("this_quarter")).recordedCollected,
    [scoped, scopedInvoices]
  );
  const year = useMemo(
    () => periodMetrics(scoped, scopedInvoices, rangeForPreset("this_year")).recordedCollected,
    [scoped, scopedInvoices]
  );

  const series = useMemo(() => buildMonthSeries(scoped, filters.timelineMonths), [scoped, filters.timelineMonths]);
  const forecast = useMemo(() => buildForecast(buildMonthSeries(scoped, 18), 12), [scoped]);
  const sources = useMemo(() => sourceBreakdown(scoped, range), [scoped, range]);
  const statuses = useMemo(() => statusBreakdown(scoped, range), [scoped, range]);
  const split = useMemo(() => customerSplit(scoped, range), [scoped, range]);
  const customerRows = useMemo(() => customerBreakdown(bySource, range), [bySource, range]);
  const { money, reloadRates } = useMoney();
  const insightCustomers = useMemo(
    () => (customerId === "all" ? customerRows : customerRows.filter((c) => c.customerId === customerId)),
    [customerId, customerRows]
  );
  const insightLines = useMemo(
    () => insights({ metrics, sources, series, split, customers: insightCustomers, money }),
    [metrics, sources, series, split, insightCustomers, money]
  );
  const availableSources = useMemo(() => sources.map((s) => s.source), [sources]);

  const forecast3 = forecast.slice(0, 3).reduce((s, r) => s + r.projected, 0);
  const forecast6 = forecast.slice(0, 6).reduce((s, r) => s + r.projected, 0);
  const forecast12 = forecast.reduce((s, r) => s + r.projected, 0);

  if (loading) return <PageLoading label="Loading financial records…" />;
  if (error) return <PageError description={error} onRetry={() => void reload()} />;

  return (
    <div className="space-y-6">
      <FinanceCurrencyBar />
      <FinanceFilters
        preset={filters.preset}
        onPreset={filters.setPreset}
        custom={filters.custom}
        onCustom={filters.setCustom}
        source={filters.source}
        onSource={filters.setSource}
        status={filters.status}
        onStatus={filters.setStatus}
        sources={availableSources}
        customers={customers}
        customerId={customerId}
        onCustomer={setCustomerId}
        monthKey={filters.monthKey}
        onClearMonth={() => filters.setMonthKey(null)}
        onRefresh={() => {
          void reload();
          void reloadRates();
        }}
      />

      <FinanceKpis
        metrics={metrics}
        month={month}
        quarter={quarter}
        year={year}
        spark={series}
        fetchedAt={fetchedAt}
        sourceCount={sources.length}
      />

      <FinanceTimeline
        series={series}
        forecast={forecast}
        months={filters.timelineMonths}
        onMonths={filters.setTimelineMonths}
        mode={mode}
        onMode={setMode}
        onMonth={filters.setMonthKey}
      />

      <FinanceAnalyticsCharts
        series={series}
        sources={sources}
        statuses={statuses}
        split={split}
        onSource={(source) => filters.setSource(source as RevenueSource)}
        onStatus={filters.setStatus}
        onMonth={filters.setMonthKey}
      />

      <FinanceCustomerTable
        rows={customerRows}
        selectedId={customerId}
        onSelect={setCustomerId}
        collected={fleetMetrics.recordedCollected}
      />

      <FinanceSourceTable rows={sources} onSelect={filters.setSource} />

      <FinanceLedger
        rows={ledgerRows}
        onOpen={(row) => {
          setDetail(row);
          void writeFinanceAudit("view_payment", "finance_payments", row.id);
        }}
      />

      <FinanceInsights lines={insightLines} />
      <FinanceForecastPanel months3={forecast3} months6={forecast6} months12={forecast12} />
      <FinanceExports
        payments={ledgerRows}
        monthly={series}
        range={range}
        recorded={metrics.recordedCollected}
        verified={metrics.verifiedCollected}
        tx={metrics.transactions}
        pending={metrics.pending}
        failed={metrics.failed}
        refunds={metrics.refunds}
        outstanding={metrics.outstanding}
        sources={sources}
      />

      <FinanceDetail payment={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function inRangeStamp(p: FinancePayment, range: { start: Date; end: Date }) {
  const d = parseISO(paymentStamp(p));
  if (Number.isNaN(d.getTime())) return false;
  return d >= range.start && d <= range.end;
}
