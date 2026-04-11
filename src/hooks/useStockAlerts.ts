import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useStockAlerts() {
  const { business } = useBusiness();
  const qc = useQueryClient();

  useEffect(() => {
    if (!business?.id) return;

    const channel = supabase
      .channel(`stock-alerts-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
          filter: `business_id=eq.${business.id}`,
        },
        (payload) => {
          const product = payload.new as {
            id: string;
            name: string;
            quantity: number;
            min_stock: number;
            business_id: string;
          };

          if (product.quantity === 0) {
            toast.error(`🚨 Rupture de stock : ${product.name}`, {
              duration: 10000,
              description: "Ce produit est en rupture totale de stock !",
            });
            // Persist notification
            supabase.from("notifications").insert({
              business_id: product.business_id,
              product_id: product.id,
              message: `Rupture de stock : ${product.name} (0 restant)`,
              type: "stock_out",
            }).then();
          } else if (product.quantity <= product.min_stock) {
            toast.warning(`⚠️ Stock faible : ${product.name}`, {
              duration: 8000,
              description: `Seulement ${product.quantity} unité(s) restante(s) (seuil: ${product.min_stock})`,
            });
            supabase.from("notifications").insert({
              business_id: product.business_id,
              product_id: product.id,
              message: `Stock faible : ${product.name} (${product.quantity} restants, seuil: ${product.min_stock})`,
              type: "stock_low",
            }).then();
          }

          // Refresh product queries
          qc.invalidateQueries({ queryKey: ["products"] });
          qc.invalidateQueries({ queryKey: ["dashboard_stats"] });
        }
      )
      .subscribe();

    // Also subscribe to notifications for real-time badge updates
    const notifChannel = supabase
      .channel(`notifications-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `business_id=eq.${business.id}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(notifChannel);
    };
  }, [business?.id, qc]);
}
