import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DISPLAY_CURRENCIES,
  FALLBACK_RATES,
  convertFromKes,
  fetchKesRates,
  formatMoney,
  formatMoneyCompact,
  quotePerUnit,
  type DisplayCurrency,
} from "../lib/financeCurrency";

const STORAGE_KEY = "greentech-finance-currency";

type MoneyContext = {
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  money: (amountKes: number) => string;
  moneyCompact: (amountKes: number) => string;
  fromKes: (amountKes: number) => number;
  rates: Record<DisplayCurrency, number>;
  updatedAt: string | null;
  live: boolean;
  reloadRates: () => Promise<void>;
  quote: (c: DisplayCurrency) => number;
};

const Ctx = createContext<MoneyContext | null>(null);

function readStored(): DisplayCurrency {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    if (v && DISPLAY_CURRENCIES.includes(v as DisplayCurrency)) return v as DisplayCurrency;
  } catch {
    /* ignore */
  }
  return "KES";
}

export function useFinanceCurrencyState(): MoneyContext {
  const [currency, setCurrencyState] = useState<DisplayCurrency>(readStored);
  const [rates, setRates] = useState<Record<DisplayCurrency, number>>({ ...FALLBACK_RATES });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const reloadRates = useCallback(async () => {
    const next = await fetchKesRates();
    setRates(next.rates);
    setUpdatedAt(next.updatedAt);
    setLive(next.live);
  }, []);

  useEffect(() => {
    void reloadRates();
  }, [reloadRates]);

  const setCurrency = useCallback((c: DisplayCurrency) => {
    setCurrencyState(c);
    try {
      sessionStorage.setItem(STORAGE_KEY, c);
    } catch {
      /* ignore */
    }
  }, []);

  return useMemo(
    () => ({
      currency,
      setCurrency,
      money: (amountKes: number) => formatMoney(amountKes, currency, rates),
      moneyCompact: (amountKes: number) => formatMoneyCompact(amountKes, currency, rates),
      fromKes: (amountKes: number) => convertFromKes(amountKes, currency, rates),
      rates,
      updatedAt,
      live,
      reloadRates,
      quote: (c: DisplayCurrency) => quotePerUnit(c, rates),
    }),
    [currency, setCurrency, rates, updatedAt, live, reloadRates]
  );
}

export const FinanceCurrencyContext = Ctx;

export function useMoney() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      currency: "KES" as DisplayCurrency,
      setCurrency: () => undefined,
      money: (n: number) => formatMoney(n, "KES", FALLBACK_RATES),
      moneyCompact: (n: number) => formatMoneyCompact(n, "KES", FALLBACK_RATES),
      fromKes: (n: number) => n,
      rates: FALLBACK_RATES,
      updatedAt: null,
      live: false,
      reloadRates: async () => undefined,
      quote: (c: DisplayCurrency) => quotePerUnit(c, FALLBACK_RATES),
    };
  }
  return ctx;
}
