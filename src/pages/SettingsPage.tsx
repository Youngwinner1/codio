import { Store, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { business, refetch } = useBusiness();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    name: "", phone: "", email: "", address: "", tax_rate: "18", currency: "FCFA",
  });

  useEffect(() => {
    if (business) {
      setSettings({
        name: business.name,
        phone: business.phone || "",
        email: business.email || "",
        address: business.address || "",
        tax_rate: String(business.tax_rate),
        currency: business.currency,
      });
    }
  }, [business]);

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);
    const { error } = await supabase
      .from("business_profiles")
      .update({
        name: settings.name,
        phone: settings.phone || null,
        email: settings.email || null,
        address: settings.address || null,
        tax_rate: parseFloat(settings.tax_rate) || 18,
        currency: settings.currency,
      })
      .eq("id", business.id);
    setSaving(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    await refetch();
    toast.success("Paramètres enregistrés avec succès");
  };

  if (!business) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Configuration de votre entreprise</p>
      </div>

      <div className="stat-card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Informations de l'entreprise</h2>
            <p className="text-sm text-muted-foreground">Ces informations apparaissent sur vos factures</p>
          </div>
        </div>

        <div className="grid gap-4">
          <div><Label>Nom de l'entreprise</Label><Input value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Téléphone</Label><Input value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
          </div>
          <div><Label>Adresse</Label><Input value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Taux de TVA (%)</Label><Input type="number" value={settings.tax_rate} onChange={e => setSettings({...settings, tax_rate: e.target.value})} /></div>
            <div><Label>Devise</Label><Input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} /></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </Button>
          <Button variant="outline" onClick={signOut} className="text-destructive hover:text-destructive">
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
}
