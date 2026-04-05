
-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'cashier', 'stock_manager');
CREATE TYPE public.invoice_status AS ENUM ('paid', 'pending', 'cancelled');
CREATE TYPE public.movement_type AS ENUM ('in', 'out', 'adjustment');

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Business profiles (multi-tenant)
CREATE TABLE public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT NOT NULL DEFAULT 'general',
  phone TEXT,
  email TEXT,
  address TEXT,
  currency TEXT NOT NULL DEFAULT 'FCFA',
  tax_rate NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'employee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user's business_id
CREATE OR REPLACE FUNCTION public.get_user_business_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT business_id FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Categories
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pièce',
  supplier_id UUID,
  barcode TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK for products.supplier_id
ALTER TABLE public.products ADD CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Invoices
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_name TEXT NOT NULL,
  client_phone TEXT,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  status invoice_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice items
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock movements
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_products_business ON public.products(business_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_invoices_business ON public.invoices(business_id);
CREATE INDEX idx_invoices_date ON public.invoices(date);
CREATE INDEX idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX idx_stock_movements_business ON public.stock_movements(business_id);
CREATE INDEX idx_categories_business ON public.categories(business_id);
CREATE INDEX idx_suppliers_business ON public.suppliers(business_id);

-- Enable RLS on all tables
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS: business_profiles
CREATE POLICY "Owners can manage their business" ON public.business_profiles
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Members can view their business" ON public.business_profiles
  FOR SELECT USING (id = public.get_user_business_id(auth.uid()));

-- RLS: user_roles
CREATE POLICY "Users can view their own role" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.business_id = user_roles.business_id AND ur.role = 'admin'
    )
  );

-- RLS: categories (business-scoped)
CREATE POLICY "Users can view business categories" ON public.categories
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business categories" ON public.categories
  FOR ALL USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS: products (business-scoped)
CREATE POLICY "Users can view business products" ON public.products
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business products" ON public.products
  FOR ALL USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS: suppliers (business-scoped)
CREATE POLICY "Users can view business suppliers" ON public.suppliers
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business suppliers" ON public.suppliers
  FOR ALL USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS: invoices (business-scoped)
CREATE POLICY "Users can view business invoices" ON public.invoices
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business invoices" ON public.invoices
  FOR ALL USING (business_id = public.get_user_business_id(auth.uid()));

-- RLS: invoice_items (via invoice)
CREATE POLICY "Users can view invoice items" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND i.business_id = public.get_user_business_id(auth.uid()))
  );

CREATE POLICY "Users can manage invoice items" ON public.invoice_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_items.invoice_id AND i.business_id = public.get_user_business_id(auth.uid()))
  );

-- RLS: stock_movements (business-scoped)
CREATE POLICY "Users can view business stock movements" ON public.stock_movements
  FOR SELECT USING (business_id = public.get_user_business_id(auth.uid()));

CREATE POLICY "Users can manage business stock movements" ON public.stock_movements
  FOR ALL USING (business_id = public.get_user_business_id(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create business profile and admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_business_id UUID;
BEGIN
  INSERT INTO public.business_profiles (owner_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'business_name', 'Mon Entreprise'))
  RETURNING id INTO new_business_id;

  INSERT INTO public.user_roles (user_id, business_id, role)
  VALUES (NEW.id, new_business_id, 'admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
