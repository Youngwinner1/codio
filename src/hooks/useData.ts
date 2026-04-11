import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { toast } from "sonner";

export function useProducts() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["products", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name), suppliers(name)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const { business } = useBusiness();
  return useMutation({
    mutationFn: async (product: {
      name: string; category_id?: string | null; purchase_price: number;
      selling_price: number; quantity: number; min_stock: number;
      unit: string; supplier_id?: string | null; barcode?: string; description?: string;
    }) => {
      if (!business) throw new Error("No business");
      const { error } = await supabase.from("products").insert({ ...product, business_id: business.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Produit ajouté"); },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; category_id?: string | null; purchase_price?: number; selling_price?: number; quantity?: number; min_stock?: number; unit?: string; supplier_id?: string | null; barcode?: string | null; description?: string | null }) => {
      const { error } = await supabase.from("products").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Produit modifié"); },
    onError: () => toast.error("Erreur lors de la modification"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Produit supprimé"); },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useCategories() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["categories", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("categories").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  const { business } = useBusiness();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!business) throw new Error("No business");
      const { error } = await supabase.from("categories").insert({ name, business_id: business.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useSuppliers() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["suppliers", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase.from("suppliers").select("*").eq("business_id", business.id).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  const { business } = useBusiness();
  return useMutation({
    mutationFn: async (supplier: { name: string; phone?: string; email?: string; address?: string; notes?: string }) => {
      if (!business) throw new Error("No business");
      const { error } = await supabase.from("suppliers").insert({ ...supplier, business_id: business.id });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Fournisseur ajouté"); },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; phone?: string | null; email?: string | null; address?: string | null; notes?: string | null }) => {
      const { error } = await supabase.from("suppliers").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Fournisseur modifié"); },
    onError: () => toast.error("Erreur lors de la modification"),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["suppliers"] }); toast.success("Fournisseur supprimé"); },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useInvoices() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["invoices", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  const { business } = useBusiness();
  return useMutation({
    mutationFn: async (invoice: {
      client_name: string; client_phone?: string; subtotal: number; tax: number;
      discount: number; total: number; items: { product_id?: string | null; product_name: string; quantity: number; unit_price: number; total: number }[];
    }) => {
      if (!business) throw new Error("No business");
      // Generate invoice number
      const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true }).eq("business_id", business.id);
      const num = String((count || 0) + 1).padStart(3, "0");
      const invoiceNumber = `FACT-${new Date().getFullYear()}-${num}`;

      const { data: inv, error: invError } = await supabase
        .from("invoices")
        .insert({
          business_id: business.id,
          invoice_number: invoiceNumber,
          client_name: invoice.client_name,
          client_phone: invoice.client_phone,
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          discount: invoice.discount,
          total: invoice.total,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      if (invError) throw invError;

      // Insert items
      const itemsToInsert = invoice.items.map(item => ({
        invoice_id: inv.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));
      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of invoice.items) {
        if (item.product_id) {
          await supabase.rpc("get_user_business_id", { _user_id: (await supabase.auth.getUser()).data.user?.id || "" });
          // Decrement stock
          const { data: prod } = await supabase.from("products").select("quantity").eq("id", item.product_id).single();
          if (prod) {
            await supabase.from("products").update({ quantity: prod.quantity - item.quantity }).eq("id", item.product_id);
            // Record stock movement
            await supabase.from("stock_movements").insert({
              business_id: business.id,
              product_id: item.product_id,
              movement_type: "out" as const,
              quantity: item.quantity,
              reason: `Vente - Facture ${invoiceNumber}`,
              created_by: (await supabase.auth.getUser()).data.user?.id,
            });
          }
        }
      }

      return inv;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Facture créée avec succès");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useStockMovements(productId?: string) {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["stock_movements", business?.id, productId],
    queryFn: async () => {
      if (!business) return [];
      let query = supabase.from("stock_movements").select("*, products(name)").eq("business_id", business.id).order("created_at", { ascending: false }).limit(50);
      if (productId) query = query.eq("product_id", productId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useDashboardStats() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["dashboard_stats", business?.id],
    queryFn: async () => {
      if (!business) return null;
      const [productsRes, invoicesRes, lowStockRes] = await Promise.all([
        supabase.from("products").select("quantity, selling_price").eq("business_id", business.id),
        supabase.from("invoices").select("total, status, date").eq("business_id", business.id),
        supabase.from("products").select("*").eq("business_id", business.id).filter("quantity", "lte", "min_stock" as any),
      ]);

      const products = productsRes.data || [];
      const invoices = invoicesRes.data || [];
      const totalStock = products.reduce((s, p) => s + (p.quantity || 0), 0);
      const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
      const thisMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = invoices.filter(i => i.status === "paid" && i.date?.startsWith(thisMonth)).reduce((s, i) => s + Number(i.total), 0);

      // Low stock: re-query properly
      const { data: lowStock } = await supabase.rpc("get_user_business_id", { _user_id: "" }).throwOnError().then(() =>
        supabase.from("products").select("*").eq("business_id", business.id)
      );
      const lowStockProducts = (lowStock || []).filter(p => p.quantity <= p.min_stock);

      return { totalStock, totalRevenue, monthlyRevenue, lowStockCount: lowStockProducts.length, invoiceCount: invoices.length, products, invoices };
    },
    enabled: !!business,
  });
}

export function useNotifications() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["notifications", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

export function useUnreadNotificationCount() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["notifications_unread", business?.id],
    queryFn: async () => {
      if (!business) return 0;
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("is_read", false);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!business,
  });
}
