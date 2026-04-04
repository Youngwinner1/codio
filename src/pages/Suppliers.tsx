import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { suppliers as initialSuppliers, Supplier } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Suppliers() {
  const [supplierList, setSupplierList] = useState<Supplier[]>(initialSuppliers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const filtered = supplierList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: '', phone: '', email: '', address: '' }); setDialogOpen(true); };
  const openEdit = (s: Supplier) => { setEditing(s); setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error("Le nom est obligatoire"); return; }
    if (editing) {
      setSupplierList(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
      toast.success("Fournisseur modifié");
    } else {
      setSupplierList(prev => [...prev, { id: String(Date.now()), ...form, products: 0 }]);
      toast.success("Fournisseur ajouté");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSupplierList(prev => prev.filter(s => s.id !== id));
    toast.success("Fournisseur supprimé");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground text-sm mt-1">{supplierList.length} fournisseurs enregistrés</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher un fournisseur..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <div key={s.id} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-base">{s.name}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Edit2 className="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {s.phone}</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {s.email}</p>
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {s.address}</p>
            </div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground">{s.products} produits fournis</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Ajouter'} un fournisseur</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editing ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
