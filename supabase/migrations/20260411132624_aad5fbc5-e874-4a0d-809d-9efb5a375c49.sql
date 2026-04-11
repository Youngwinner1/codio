-- Enable realtime for products table
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- Create notifications table for persistent alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view business notifications"
ON public.notifications FOR SELECT
USING (business_id = get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business notifications"
ON public.notifications FOR ALL
USING (business_id = get_user_business_id(auth.uid()));

CREATE INDEX idx_notifications_business ON public.notifications(business_id, created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;