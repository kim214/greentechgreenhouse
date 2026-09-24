import { FinanceCurrencyContext, useFinanceCurrencyState, useMoney } from "../../../hooks/useFinanceCurrency";
import { DISPLAY_CURRENCIES, CURRENCY_NAME } from "../../../lib/financeCurrency";
import { formatRelativeTime } from "../../../lib/farmApi";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";

export function FinanceCurrencyProvider({ children }: { children: React.ReactNode }) {
  const value = useFinanceCurrencyState();
  return <FinanceCurrencyContext.Provider value={value}>{children}</FinanceCurrencyContext.Provider>;
}

export function FinanceCurrencyBar() {
  const { currency, setCurrency, quote, updatedAt, live, reloadRates } = useMoney();
  const usdKes = quote("USD");
  const aedKes = quote("AED");

  return (
    <Card className="border-border/50 bg-card shadow-sm">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Display currency</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DISPLAY_CURRENCIES.map((code) => (
              <Button key={code} size="sm" variant={currency === code ? "default" : "outline"} onClick={() => setCurrency(code)}>
                {code}
                <span className="ml-1 hidden font-normal text-current/80 sm:inline">{CURRENCY_NAME[code]}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground sm:text-right">
          <p>
            Mid-market · 1 USD = {usdKes.toLocaleString("en-KE", { maximumFractionDigits: 2 })} KES · 1 AED ={" "}
            {aedKes.toLocaleString("en-KE", { maximumFractionDigits: 2 })} KES
          </p>
          <p className="mt-1 text-xs">
            {live ? "Live rate" : "Cached mid-market rate"} · updated {formatRelativeTime(updatedAt)} · figures convert from KES
            ledger totals
          </p>
          <button type="button" className="mt-1 text-xs text-primary underline-offset-2 hover:underline" onClick={() => void reloadRates()}>
            Refresh rates
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
