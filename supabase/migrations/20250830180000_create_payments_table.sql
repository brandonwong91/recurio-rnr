CREATE TABLE
  public.payments (
    id UUID NOT NULL DEFAULT gen_random_uuid (),
    user_id UUID NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    tag TEXT NULL,
    due_date DATE NULL,
    paid_date TIMESTAMPTZ NULL,
    frequency INTEGER NOT NULL DEFAULT 0,
    done_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for authenticated users" ON public.payments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
