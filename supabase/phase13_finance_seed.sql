-- =============================================================================
-- GreenTech finance ledger seed — data_origin = 'sample' only
-- Safe to re-run: clears sample/forecast finance rows, keeps verified.
-- =============================================================================

DELETE FROM public.finance_revenue_records WHERE data_origin IN ('sample', 'forecast');
DELETE FROM public.finance_payments WHERE data_origin IN ('sample', 'forecast');
DELETE FROM public.finance_invoices WHERE data_origin IN ('sample', 'forecast');
DELETE FROM public.finance_customers
WHERE id NOT IN (SELECT customer_id FROM public.finance_payments);

INSERT INTO public.finance_customers (id, name, email, phone, customer_type, location, created_at)
VALUES
  ('11111111-1111-4111-8111-111111111001', 'Rift Valley Horticulture Ltd', 'accounts@riftvalleyhort.co.ke', '+254722104811', 'enterprise', 'Naivasha', '2025-02-11'),
  ('11111111-1111-4111-8111-111111111002', 'Wanjiku M.', 'wanjiku.ops@riftvalley.farms', '+254701223410', 'individual', 'Naivasha', '2025-03-02'),
  ('11111111-1111-4111-8111-111111111003', 'Kisumu Greens Cooperative', 'finance@kisumugreens.coop', '+254733880214', 'cooperative', 'Kisumu', '2025-03-18'),
  ('11111111-1111-4111-8111-111111111004', 'Amina Yusuf', 'amina.y@riftvalley.farms', '+254711904122', 'individual', 'Isiolo', '2025-04-09'),
  ('11111111-1111-4111-8111-111111111005', 'Highland Berry Growers', 'pay@highlandberry.co.ke', '+254720551903', 'farm', 'Eldoret', '2025-04-21'),
  ('11111111-1111-4111-8111-111111111006', 'Grace Atieno', 'grace.a@riftvalley.farms', '+254712448901', 'individual', 'Homa Bay', '2025-05-06'),
  ('11111111-1111-4111-8111-111111111007', 'Nyeri Herb Collective', 'hello@nyeriherbs.ke', '+254725667310', 'cooperative', 'Nyeri', '2025-05-27'),
  ('11111111-1111-4111-8111-111111111008', 'Joseph Mutiso', 'joseph.m@riftvalley.farms', '+254708331204', 'individual', 'Machakos', '2025-06-14'),
  ('11111111-1111-4111-8111-111111111009', 'Thika Leaf Ventures', 'billing@thikaleaf.co.ke', '+254736220198', 'enterprise', 'Thika', '2025-07-03'),
  ('11111111-1111-4111-8111-111111111010', 'Omar Hassan', 'omar.h@riftvalley.farms', '+254701998221', 'individual', 'Garissa', '2025-07-19'),
  ('11111111-1111-4111-8111-111111111011', 'Kiambu Rose Estates', 'accounts@kiamburose.ke', '+254722667145', 'farm', 'Kiambu', '2025-08-08'),
  ('11111111-1111-4111-8111-111111111012', 'Brian Otieno', 'brian.o@riftvalley.farms', '+254714220883', 'individual', 'Bungoma', '2025-08-26'),
  ('11111111-1111-4111-8111-111111111013', 'Siaya Mixed Greens Ltd', 'ops@siayagreens.co.ke', '+254729441002', 'enterprise', 'Siaya', '2025-09-12'),
  ('11111111-1111-4111-8111-111111111014', 'Nakuru Hilltop Produce', 'finance@hilltopproduce.ke', '+254721883044', 'farm', 'Nakuru', '2025-10-04'),
  ('11111111-1111-4111-8111-111111111015', 'Esther Cherono', 'esther.c@riftvalley.farms', '+254705662910', 'individual', 'Nakuru', '2025-10-22'),
  ('11111111-1111-4111-8111-111111111016', 'Meru Capsicum House', 'pay@merucapsicum.ke', '+254718334509', 'farm', 'Meru', '2025-11-09'),
  ('11111111-1111-4111-8111-111111111017', 'Lake Shore Peppers Ltd', 'accounts@lakeshorepeppers.ke', '+254727119334', 'enterprise', 'Isiolo', '2025-12-01'),
  ('11111111-1111-4111-8111-111111111018', 'Hannah Njeri', 'hannah.n@riftvalley.farms', '+254702884115', 'individual', 'Thika', '2026-01-14'),
  ('11111111-1111-4111-8111-111111111019', 'Kericho Riverbend Farms', 'office@riverbend.ke', '+254731002448', 'farm', 'Kericho', '2026-02-03'),
  ('11111111-1111-4111-8111-111111111020', 'Faith Wambui', 'faith.w@riftvalley.farms', '+254709551276', 'individual', 'Kiambu', '2026-03-11'),
  ('11111111-1111-4111-8111-111111111021', 'Bungoma Chili Works', 'pay@bungomachili.ke', '+254724880193', 'cooperative', 'Bungoma', '2026-04-07'),
  ('11111111-1111-4111-8111-111111111022', 'David Mwangi', 'david.m@riftvalley.farms', '+254713229087', 'individual', 'Nyeri', '2026-05-18'),
  ('11111111-1111-4111-8111-111111111023', 'Coastal Shade Nets Ltd', 'billing@coastalshade.co.ke', '+254722991004', 'enterprise', 'Mombasa', '2026-06-09'),
  ('11111111-1111-4111-8111-111111111024', 'Samuel Kiptoo', 'samuel.k@riftvalley.farms', '+254706441228', 'individual', 'Eldoret', '2026-07-02')
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
  month_start DATE;
  month_i INT;
  n_tx INT;
  i INT;
  seq INT := 0;
  cust UUID;
  src TEXT;
  product TEXT;
  amount NUMERIC(12,2);
  method TEXT;
  status TEXT;
  pay_at TIMESTAMPTZ;
  inv_id UUID;
  pay_id UUID;
  h INT;
  recurring BOOLEAN;
  customer_count INT;
BEGIN
  FOR month_i IN 0..17 LOOP
    month_start := date_trunc('month', NOW() - ((17 - month_i) || ' months')::INTERVAL)::DATE;

    n_tx := CASE
      WHEN month_i < 3 THEN 2 + (month_i % 2)
      WHEN month_i < 6 THEN 4 + (month_i % 3)
      WHEN month_i = 7 THEN 5
      WHEN month_i < 10 THEN 7 + (month_i % 3)
      WHEN month_i = 11 THEN 8
      WHEN month_i < 14 THEN 11 + (month_i % 4)
      WHEN month_i = 15 THEN 12
      ELSE 15 + (month_i % 3)
    END;

    FOR i IN 1..n_tx LOOP
      seq := seq + 1;
      h := abs(hashtext(month_start::TEXT || '-' || i::TEXT || '-' || seq::TEXT));
      customer_count := LEAST(24, 4 + month_i + (i % 3));
      SELECT id INTO cust
      FROM public.finance_customers
      ORDER BY created_at
      OFFSET (h % customer_count)
      LIMIT 1;

      IF (h % 17) = 0 THEN
        src := 'greenhouse_systems';
        product := (ARRAY[
          '8x15m tunnel house + controller',
          '12x30m commercial house kit',
          'Twin-span house with sensor hub'
        ])[1 + (h % 3)];
        amount := 214880 + (h % 47) * 1375.25 + (h % 9) * 80.40;
      ELSIF (h % 17) IN (1, 2) THEN
        src := 'installation';
        product := (ARRAY['On-site installation crew', 'Controller commissioning', 'Irrigation layout install'])[1 + (h % 3)];
        amount := 48620 + (h % 31) * 415.75;
      ELSIF (h % 17) IN (3, 4, 5) THEN
        src := 'maintenance';
        product := (ARRAY['Quarterly service visit', 'Pump & fan service', 'Sensor calibration'])[1 + (h % 3)];
        amount := 9740 + (h % 23) * 185.50;
        recurring := (h % 4) = 0;
      ELSIF (h % 17) IN (6, 7, 8) THEN
        src := 'software';
        product := (ARRAY['GreenTech OS annual seat', 'Automation rules pack', 'Analytics add-on'])[1 + (h % 3)];
        amount := 14880 + (h % 19) * 210.25;
        recurring := true;
      ELSIF (h % 17) IN (9, 10, 11) THEN
        src := 'monitoring';
        product := (ARRAY['Remote farm monitoring — 3 months', 'Sentry camera add-on', 'Climate watch plan'])[1 + (h % 3)];
        amount := 8125 + (h % 21) * 95.80;
        recurring := (h % 3) = 0;
      ELSIF (h % 17) IN (12, 13) THEN
        src := 'training';
        product := (ARRAY['Operator training day', 'Co-op workshop', 'Controller certification'])[1 + (h % 3)];
        amount := 17640 + (h % 15) * 260;
      ELSE
        src := 'other';
        product := (ARRAY['Spare sensor hub', 'Shade-net pack', 'Drip fittings kit'])[1 + (h % 3)];
        amount := 6240 + (h % 27) * 148.35;
      END IF;

      IF recurring IS NULL THEN
        recurring := false;
      END IF;

      amount := ROUND(amount, 2);

      method := (ARRAY['mpesa', 'mpesa', 'mpesa', 'card', 'bank_transfer'])[1 + (h % 5)];

      IF (h % 31) = 0 THEN
        status := 'failed';
      ELSIF (h % 23) = 0 THEN
        status := 'pending';
      ELSIF (h % 41) = 0 THEN
        status := 'refunded';
      ELSE
        status := 'successful';
      END IF;

      pay_at := month_start
        + ((3 + (h % 24)) || ' days')::INTERVAL
        + ((8 + (h % 10)) || ' hours')::INTERVAL
        + ((h % 50) || ' minutes')::INTERVAL;

      IF pay_at > NOW() THEN
        pay_at := NOW() - ((h % 36) || ' hours')::INTERVAL;
      END IF;

      INSERT INTO public.finance_invoices (
        invoice_number, customer_id, amount, currency, status, issued_at, due_at, paid_at, data_origin
      ) VALUES (
        'INV-2025-' || lpad(seq::TEXT, 5, '0'),
        cust,
        amount,
        'KES',
        CASE status
          WHEN 'successful' THEN 'paid'
          WHEN 'refunded' THEN 'paid'
          WHEN 'pending' THEN 'issued'
          ELSE 'issued'
        END,
        pay_at - INTERVAL '2 days',
        pay_at + INTERVAL '12 days',
        CASE WHEN status IN ('successful', 'refunded') THEN pay_at ELSE NULL END,
        'sample'
      )
      RETURNING id INTO inv_id;

      INSERT INTO public.finance_payments (
        transaction_id, customer_id, invoice_id, amount, currency, payment_method, provider,
        provider_reference, payment_reference, status, failure_reason, revenue_source, product_name,
        receipt_number, order_id, payment_date, created_at, updated_at, data_origin, is_recurring
      ) VALUES (
        'GT-' || to_char(pay_at, 'YYYY') || '-' || lpad(seq::TEXT, 6, '0'),
        cust,
        inv_id,
        amount,
        'KES',
        method,
        CASE method
          WHEN 'mpesa' THEN 'Safaricom M-Pesa'
          WHEN 'card' THEN 'Card processor'
          WHEN 'bank_transfer' THEN 'Bank transfer'
          ELSE 'Other'
        END,
        NULL,
        'PAY-' || to_char(pay_at, 'YYYYMM') || '-' || lpad(seq::TEXT, 5, '0'),
        status,
        CASE WHEN status = 'failed' THEN 'Checkout expired before confirmation' ELSE NULL END,
        src,
        product,
        CASE WHEN status IN ('successful', 'refunded') THEN 'RCT-' || to_char(pay_at, 'YYYY') || '-' || lpad(seq::TEXT, 5, '0') ELSE NULL END,
        'ORD-' || lpad(seq::TEXT, 6, '0'),
        CASE WHEN status = 'pending' THEN NULL ELSE pay_at END,
        pay_at - INTERVAL '6 minutes',
        pay_at,
        'sample',
        recurring
      )
      RETURNING id INTO pay_id;

      IF status = 'successful' THEN
        INSERT INTO public.finance_revenue_records (
          payment_id, customer_id, revenue_source, amount, currency, recognized_at, status, data_origin
        ) VALUES (
          pay_id, cust, src, amount, 'KES', pay_at, 'recognized', 'sample'
        );
      ELSIF status = 'refunded' THEN
        INSERT INTO public.finance_revenue_records (
          payment_id, customer_id, revenue_source, amount, currency, recognized_at, status, data_origin
        ) VALUES (
          pay_id, cust, src, amount, 'KES', pay_at, 'reversed', 'sample'
        );
      END IF;

      recurring := NULL;
    END LOOP;
  END LOOP;
END $$;
