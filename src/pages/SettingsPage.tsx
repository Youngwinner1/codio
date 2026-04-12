import { Store, Save, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";

export default function SettingsPage() {
  const { business, refetch } = useBusiness();
  const { signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${business.id}/logo.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("business-logos")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      toast.error("Erreur lors de l'upload");
      return;
    }

    const { data: urlData } = supabase.storage.from("business-logos").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("business_profiles")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", business.id);

    setUploading(false);
    if (updateError) { toast.error("Erreur lors de la mise à jour"); return; }
    await refetch();
    toast.success("Logo mis à jour");
  };

  const handleRemoveLogo = async () => {
    if (!business) return;
    setSaving(true);
    await supabase.from("business_profiles").update({ logo_url: null }).eq("id", business.id);
    await refetch();
    setSaving(false);
    toast.success("Logo supprimé");
  };

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

      {/* Logo Section */}
      <div className="stat-card space-y-4">
        <h2 className="font-semibold">Logo de l'entreprise</h2>
        <p className="text-sm text-muted-foreground">Ce logo apparaîtra dans la sidebar et sur vos factures</p>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted/30">
            {business.logo_url ? (
              <img src={business.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-8 h-8 text-muted-foreground/40" />
            )}
          </div>
          <div className="space-y-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {business.logo_url ? "Changer" : "Uploader"}
            </Button>
            {business.logo_url && (
              <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={handleRemoveLogo}>
                <X className="w-4 h-4" /> Supprimer
              </Button>
            )}
            <p className="text-xs text-muted-foreground">PNG, JPG. Max 2 Mo.</p>
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="stat-card space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-border/50">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <Store className="w-6 h-6 text-primary" />
            )}
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
