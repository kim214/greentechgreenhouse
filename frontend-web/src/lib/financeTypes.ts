export type PaymentStatus = "initiated" | "pending" | "successful" | "failed" | "refunded";
export type DataOrigin = "sample" | "verified" | "forecast";
export type RevenueSource =
  | "greenhouse_systems"
  | "installation"
  | "maintenance"
  | "software"
  | "monitoring"
  | "training"
  | "other";
export type PaymentMethod = "mpesa" | "card" | "bank_transfer" | "other";
export type CustomerType = "farm" | "cooperative" | "enterprise" | "individual";

export type FinanceCustomer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  customer_type: CustomerType;
  location: string | null;
  created_at: string;
};

export type FinanceInvoice = {
  id: string;
  invoice_number: string;
  customer_id: string;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  data_origin: DataOrigin;
};

export type FinancePayment = {
  id: string;
  transaction_id: string;
  customer_id: string;
  invoice_id: string | null;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  provider: string | null;
  provider_reference: string | null;
  payment_reference: string;
  status: PaymentStatus;
  failure_reason: string | null;
  revenue_source: RevenueSource;
  product_name: string;
  receipt_number: string | null;
  order_id: string | null;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  data_origin: DataOrigin;
  is_recurring: boolean;
  customer?: FinanceCustomer;
  invoice?: FinanceInvoice | null;
};

export type DatePreset =
  | "today"
  | "7d"
  | "30d"
  | "this_month"
  | "last_month"
  | "this_quarter"
  | "this_year"
  | "last_year"
  | "6m"
  | "12m"
  | "18m"
  | "custom";

export type TimelineRange = 6 | 12 | 18;
export type ForecastMode = "actual" | "forecast" | "both";

export const SOURCE_LABEL: Record<RevenueSource, string> = {
  greenhouse_systems: "Greenhouse system sales",
  installation: "Installation",
  maintenance: "Maintenance",
  software: "Software / intelligence",
  monitoring: "Farm monitoring",
  training: "Training",
  other: "Other services",
};

export const METHOD_LABEL: Record<PaymentMethod, string> = {
  mpesa: "M-Pesa",
  card: "Card",
  bank_transfer: "Bank transfer",
  other: "Other",
};

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  initiated: "Initiated",
  pending: "Pending",
  successful: "Successful",
  failed: "Failed",
  refunded: "Refunded",
};
