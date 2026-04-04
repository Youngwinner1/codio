import { useState } from "react";
import { Store, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'QUINCAILLERIE BAYE SAM',
    phone: '+221 77 000 00 00',
    email: 'contact@bayesamgestion.sn',
    address: 'Dakar, Sénégal',
    taxRate: '18',
    currency: 'FCFA',
  });

  const handleSave = () => {
    toast.success("Paramètres enregistrés avec succès");
  };

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
          <div><Label>Nom de l'entreprise</Label><Input value={settings.companyName} onChange={e => setSettings({...settings, companyName: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Téléphone</Label><Input value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})} /></div>
          </div>
          <div><Label>Adresse</Label><Input value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Taux de TVA (%)</Label><Input type="number" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: e.target.value})} /></div>
            <div><Label>Devise</Label><Input value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} /></div>
          </div>
        </div>

        <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Enregistrer</Button>
      </div>
    </div>
  );
}
