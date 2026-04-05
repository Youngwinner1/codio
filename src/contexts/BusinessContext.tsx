import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface BusinessProfile {
  id: string;
  name: string;
  business_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  tax_rate: number;
  logo_url: string | null;
}

interface BusinessContextType {
  business: BusinessProfile | null;
  loading: boolean;
  refetch: () => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const BusinessContext = createContext<BusinessContextType>({
  business: null,
  loading: true,
  refetch: async () => {},
  formatCurrency: (a) => `${a}`,
});

export const useBusiness = () => useContext(BusinessContext);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = async () => {
    if (!user) { setBusiness(null); setLoading(false); return; }
    const { data } = await supabase
      .from("business_profiles")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();
    setBusiness(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const formatCurrency = (amount: number) => {
    const currency = business?.currency || "FCFA";
    return new Intl.NumberFormat("fr-FR").format(amount) + " " + currency;
  };

  return (
    <BusinessContext.Provider value={{ business, loading, refetch: fetchBusiness, formatCurrency }}>
      {children}
    </BusinessContext.Provider>
  );
}
