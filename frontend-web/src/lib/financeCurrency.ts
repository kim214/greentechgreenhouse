export type DisplayCurrency = "KES" | "USD" | "AED";

export const DISPLAY_CURRENCIES: DisplayCurrency[] = ["KES", "USD", "AED"];

export const CURRENCY_NAME: Record<DisplayCurrency, string> = {
  KES: "Kenyan Shilling",
  USD: "US Dollar",
  AED: "UAE Dirham",
};

/** Units of target currency per 1 KES. Used if the live feed is unreachable. */
export const FALLBACK_RATES: Record<DisplayCurrency, number> = {
  KES: 1,
  USD: 1 / 129.45,
  AED: 1 / 35.27,
};

export type FxBundle = {
  rates: Record<DisplayCurrency, number>;
  updatedAt: string;
  live: boolean;
};

const LOCALES: Record<DisplayCurrency, string> = {
  KES: "en-KE",
  USD: "en-US",
  AED: "en-AE",
};

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function fetchKesRates(): Promise<FxBundle> {
  const urls = ["https://open.er-api.com/v6/latest/KES", "https://api.exchangerate-api.com/v4/latest/KES"];
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal });
      window.clearTimeout(timer);
      if (!res.ok) continue;
      const json = (await res.json()) as { rates?: Record<string, unknown>; time_last_update_utc?: string; date?: string };
      const raw = json.rates ?? {};
      const usd = num(raw.USD);
      const aed = num(raw.AED);
      if (usd && aed) {
        return {
          rates: { KES: 1, USD: usd, AED: aed },
          updatedAt: json.time_last_update_utc ?? json.date ?? new Date().toISOString(),
          live: true,
        };
      }
    } catch {
      /* try next source */
    }
  }
  return { rates: { ...FALLBACK_RATES }, updatedAt: new Date().toISOString(), live: false };
}

export function convertFromKes(amountKes: number, currency: DisplayCurrency, rates: Record<DisplayCurrency, number>) {
  const rate = rates[currency] || FALLBACK_RATES[currency];
  return amountKes * rate;
}

export function formatMoney(amountKes: number, currency: DisplayCurrency, rates: Record<DisplayCurrency, number>) {
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertFromKes(amountKes, currency, rates));
}

export function formatMoneyCompact(amountKes: number, currency: DisplayCurrency, rates: Record<DisplayCurrency, number>) {
  const value = convertFromKes(amountKes, currency, rates);
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return new Intl.NumberFormat(LOCALES[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 1,
    }).format(value / 1_000_000) + "M";
  }
  if (abs >= 1000) {
    return new Intl.NumberFormat(LOCALES[currency], {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value / 1000) + "k";
  }
  return new Intl.NumberFormat(LOCALES[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function quotePerUnit(currency: DisplayCurrency, rates: Record<DisplayCurrency, number>) {
  if (currency === "KES") return 1;
  const perKes = rates[currency] || FALLBACK_RATES[currency];
  return perKes > 0 ? 1 / perKes : 0;
}
