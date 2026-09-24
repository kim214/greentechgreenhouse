-- =============================================================================
-- GreenTech — admin finance ledger (run in Supabase SQL Editor)
-- Admin-only. Sample rows use data_origin = 'sample' and never count as
-- provider-verified collected revenue. Forecast rows are not stored as payments.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.finance_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('farm', 'cooperative', 'enterprise', 'individual')),
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.finance_customers(id) ON DELETE RESTRICT,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  status TEXT NOT NULL CHECK (status IN ('draft', 'issued', 'paid', 'overdue', 'void')),
  issued_at TIMESTAMPTZ NOT NULL,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  data_origin TEXT NOT NULL DEFAULT 'sample' CHECK (data_origin IN ('sample', 'verified', 'forecast')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.finance_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.finance_customers(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES public.finance_invoices(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'card', 'bank_transfer', 'other')),
  provider TEXT,
  provider_reference TEXT,
  payment_reference TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'pending', 'successful', 'failed', 'refunded')),
  failure_reason TEXT,
  revenue_source TEXT NOT NULL CHECK (revenue_source IN (
    'greenhouse_systems', 'installation', 'maintenance',
    'software', 'monitoring', 'training', 'other'
  )),
  product_name TEXT NOT NULL,
  receipt_number TEXT,
  order_id TEXT,
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_origin TEXT NOT NULL DEFAULT 'sample' CHECK (data_origin IN ('sample', 'verified', 'forecast')),
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_finance_payments_provider_ref
  ON public.finance_payments (provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_finance_payments_date ON public.finance_payments (payment_date);
CREATE INDEX IF NOT EXISTS idx_finance_payments_status ON public.finance_payments (status);
CREATE INDEX IF NOT EXISTS idx_finance_payments_customer ON public.finance_payments (customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_payments_source ON public.finance_payments (revenue_source);
CREATE INDEX IF NOT EXISTS idx_finance_payments_origin ON public.finance_payments (data_origin);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_customer ON public.finance_invoices (customer_id);
CREATE INDEX IF NOT EXISTS idx_finance_invoices_status ON public.finance_invoices (status);

CREATE TABLE IF NOT EXISTS public.finance_revenue_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES public.finance_payments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.finance_customers(id) ON DELETE RESTRICT,
  revenue_source TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'KES',
  recognized_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('recognized', 'reversed', 'projected')),
  data_origin TEXT NOT NULL DEFAULT 'sample' CHECK (data_origin IN ('sample', 'verified', 'forecast')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_revenue_recognized ON public.finance_revenue_records (recognized_at);
CREATE INDEX IF NOT EXISTS idx_finance_revenue_origin ON public.finance_revenue_records (data_origin);

CREATE TABLE IF NOT EXISTS public.finance_audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  record_type TEXT NOT NULL,
  record_id TEXT,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_audit_created ON public.finance_audit_log (created_at DESC);

ALTER TABLE public.finance_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "finance_customers_admin" ON public.finance_customers;
DROP POLICY IF EXISTS "finance_invoices_admin" ON public.finance_invoices;
DROP POLICY IF EXISTS "finance_payments_admin" ON public.finance_payments;
DROP POLICY IF EXISTS "finance_revenue_admin" ON public.finance_revenue_records;
DROP POLICY IF EXISTS "finance_audit_admin" ON public.finance_audit_log;

CREATE POLICY "finance_customers_admin" ON public.finance_customers
  FOR SELECT USING (public.is_admin());
CREATE POLICY "finance_invoices_admin" ON public.finance_invoices
  FOR SELECT USING (public.is_admin());
CREATE POLICY "finance_payments_admin" ON public.finance_payments
  FOR SELECT USING (public.is_admin());
CREATE POLICY "finance_revenue_admin" ON public.finance_revenue_records
  FOR SELECT USING (public.is_admin());
CREATE POLICY "finance_audit_admin" ON public.finance_audit_log
  FOR SELECT USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.finance_write_audit(
  p_action TEXT,
  p_record_type TEXT,
  p_record_id TEXT,
  p_previous JSONB DEFAULT NULL,
  p_next JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;
  SELECT id INTO pid FROM public.profiles WHERE auth_user_id = auth.uid();
  INSERT INTO public.finance_audit_log (actor_profile_id, action, record_type, record_id, previous_value, new_value)
  VALUES (pid, p_action, p_record_type, p_record_id, p_previous, p_next);
END;
$$;

-- Future provider callback. Idempotent on transaction_id. Never callable as a farmer.
CREATE OR REPLACE FUNCTION public.finance_ingest_verified_payment(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tid TEXT;
  existing UUID;
  new_id UUID;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not_admin';
  END IF;
  tid := p_payload->>'transaction_id';
  IF tid IS NULL OR length(tid) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'transaction_id_required');
  END IF;
  SELECT id INTO existing FROM public.finance_payments WHERE transaction_id = tid;
  IF existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'duplicate', true, 'id', existing);
  END IF;
  INSERT INTO public.finance_payments (
    transaction_id, customer_id, invoice_id, amount, currency, payment_method, provider,
    provider_reference, payment_reference, status, revenue_source, product_name,
    receipt_number, order_id, payment_date, data_origin, is_recurring
  ) VALUES (
    tid,
    (p_payload->>'customer_id')::UUID,
    NULLIF(p_payload->>'invoice_id', '')::UUID,
    (p_payload->>'amount')::NUMERIC,
    COALESCE(p_payload->>'currency', 'KES'),
    COALESCE(p_payload->>'payment_method', 'other'),
    p_payload->>'provider',
    NULLIF(p_payload->>'provider_reference', ''),
    COALESCE(p_payload->>'payment_reference', 'PAY-' || tid),
    'successful',
    COALESCE(p_payload->>'revenue_source', 'other'),
    COALESCE(p_payload->>'product_name', 'GreenTech service'),
    p_payload->>'receipt_number',
    p_payload->>'order_id',
    COALESCE((p_payload->>'payment_date')::TIMESTAMPTZ, NOW()),
    'verified',
    COALESCE((p_payload->>'is_recurring')::BOOLEAN, false)
  )
  RETURNING id INTO new_id;
  INSERT INTO public.finance_revenue_records (
    payment_id, customer_id, revenue_source, amount, currency, recognized_at, status, data_origin
  )
  SELECT id, customer_id, revenue_source, amount, currency, COALESCE(payment_date, created_at), 'recognized', 'verified'
  FROM public.finance_payments WHERE id = new_id;
  RETURN jsonb_build_object('ok', true, 'id', new_id);
END;
$$;

GRANT SELECT ON public.finance_customers TO authenticated;
GRANT SELECT ON public.finance_invoices TO authenticated;
GRANT SELECT ON public.finance_payments TO authenticated;
GRANT SELECT ON public.finance_revenue_records TO authenticated;
GRANT SELECT ON public.finance_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.finance_write_audit(TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finance_ingest_verified_payment(JSONB) TO authenticated;
