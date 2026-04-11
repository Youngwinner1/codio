import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store, Phone, Mail, MapPin, ArrowRight, Check, Search } from "lucide-react";
import { toast } from "sonner";

const businessCategories = [
  {
    category: "🛒 Commerce de détail",
    types: [
      { value: "boutique", label: "🛍️ Boutique", desc: "Vêtements, accessoires, mode" },
      { value: "quincaillerie", label: "🔧 Quincaillerie", desc: "Matériaux, outils, bricolage" },
      { value: "supermarche", label: "🛒 Supermarché", desc: "Supérette, épicerie, alimentaire" },
      { value: "pharmacie", label: "💊 Pharmacie", desc: "Médicaments, produits de santé" },
      { value: "librairie", label: "📚 Librairie", desc: "Livres, papeterie, fournitures" },
      { value: "electronique", label: "📱 Électronique", desc: "Téléphones, informatique, gadgets" },
      { value: "cosmetique", label: "💄 Cosmétique", desc: "Beauté, parfumerie, soins" },
      { value: "boulangerie", label: "🥖 Boulangerie", desc: "Pâtisserie, matières premières" },
    ],
  },
  {
    category: "🏢 Grossiste & Distribution",
    types: [
      { value: "grossiste", label: "📦 Grossiste", desc: "Vente en gros, import/export" },
      { value: "distributeur", label: "🚛 Distributeur", desc: "Centrale d'achat, distribution" },
    ],
  },
  {
    category: "🏭 Industrie & Production",
    types: [
      { value: "usine", label: "🏭 Usine", desc: "Fabrication alimentaire, textile" },
      { value: "atelier", label: "🔨 Atelier", desc: "Menuiserie, métallurgie, imprimerie" },
    ],
  },
  {
    category: "🍽️ Restauration & Hôtellerie",
    types: [
      { value: "restaurant", label: "🍽️ Restaurant", desc: "Restaurant, fast-food, traiteur" },
      { value: "hotel", label: "🏨 Hôtel", desc: "Hébergement, consommables" },
    ],
  },
  {
    category: "🏥 Santé",
    types: [
      { value: "clinique", label: "🏥 Clinique", desc: "Hôpital, laboratoire, santé" },
    ],
  },
  {
    category: "🚗 Auto & Mécanique",
    types: [
      { value: "garage", label: "🚗 Garage", desc: "Pièces détachées, mécanique" },
    ],
  },
  {
    category: "🧱 BTP & Construction",
    types: [
      { value: "btp", label: "🧱 BTP", desc: "Construction, dépôt matériaux" },
    ],
  },
  {
    category: "🌾 Agriculture",
    types: [
      { value: "agriculture", label: "🌾 Agriculture", desc: "Semences, engrais, récoltes" },
    ],
  },
  {
    category: "⛽ Énergie",
    types: [
      { value: "energie", label: "⛽ Énergie", desc: "Station-service, dépôt de gaz" },
    ],
  },
  {
    category: "🧑‍🔧 Services",
    types: [
      { value: "services", label: "🧑‍🔧 Services", desc: "Maintenance, plomberie, électricité" },
    ],
  },
  {
    category: "🏫 Éducation & Institutions",
    types: [
      { value: "education", label: "🏫 Éducation", desc: "École, ONG, administration" },
    ],
  },
  {
    category: "🛒 E-commerce",
    types: [
      { value: "ecommerce", label: "🌐 E-commerce", desc: "Boutique en ligne, vente sociale" },
    ],
  },
  {
    category: "🏢 Multi-sites",
    types: [
      { value: "multisite", label: "🏢 Multi-sites", desc: "Chaînes, franchises, multi-entrepôts" },
    ],
  },
  {
    category: "🏪 Autre",
    types: [
      { value: "general", label: "🏪 Autre", desc: "Tout autre type de commerce" },
    ],
  },
];

export default function Onboarding() {
  const { user } = useAuth();
  const { refetch } = useBusiness();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [searchType, setSearchType] = useState("");
  const [form, setForm] = useState({ phone: "", email: "", address: "", currency: "FCFA", taxRate: "18" });
  const [loading, setLoading] = useState(false);

  const filteredCategories = useMemo(() => {
    if (!searchType.trim()) return businessCategories;
    const q = searchType.toLowerCase();
    return businessCategories
      .map(cat => ({
        ...cat,
        types: cat.types.filter(t => 
          t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q) || t.value.includes(q)
        ),
      }))
      .filter(cat => cat.types.length > 0);
  }, [searchType]);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("business_profiles")
      .update({
        business_type: selectedType,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        currency: form.currency,
        tax_rate: parseFloat(form.taxRate) || 18,
      })
      .eq("owner_id", user.id);
    
    if (error) { toast.error("Erreur lors de la configuration"); setLoading(false); return; }
    await refetch();
    toast.success("Configuration terminée !");
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 2 && <div className={`w-16 h-0.5 ${step > 1 ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Quel est votre domaine d'activité ?</h1>
              <p className="text-muted-foreground mt-2">Choisissez votre secteur — l'interface s'adaptera automatiquement</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un secteur..."
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[400px] pr-2">
              <div className="space-y-4">
                {filteredCategories.map(cat => (
                  <div key={cat.category}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{cat.category}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cat.types.map(t => (
                        <button
                          key={t.value}
                          onClick={() => setSelectedType(t.value)}
                          className={`p-3 rounded-xl border-2 transition-all text-left hover:shadow-md ${
                            selectedType === t.value
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <span className="text-xl block mb-1">{t.label.split(" ")[0]}</span>
                          <p className="text-sm font-medium">{t.label.split(" ").slice(1).join(" ")}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Aucun secteur trouvé</p>
                )}
              </div>
            </ScrollArea>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!selectedType} className="gap-2" size="lg">
                Continuer <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Informations de votre entreprise</h1>
              <p className="text-muted-foreground mt-2">Ces informations apparaîtront sur vos factures</p>
            </div>
            <div className="stat-card space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Téléphone</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+221 77 000 00 00" />
                </div>
                <div>
                  <Label className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> Email</Label>
                  <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="contact@entreprise.com" />
                </div>
              </div>
              <div>
                <Label className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Adresse</Label>
                <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Dakar, Sénégal" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Devise</Label>
                  <Input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} />
                </div>
                <div>
                  <Label>Taux de TVA (%)</Label>
                  <Input type="number" value={form.taxRate} onChange={e => setForm({...form, taxRate: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
              <Button onClick={handleComplete} disabled={loading} className="gap-2" size="lg">
                {loading ? "Configuration..." : "Terminer"} {!loading && <Check className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
