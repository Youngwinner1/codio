import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Suppliers() {
  const { data: suppliers = [], isLoading } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  const filtered = suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditingId(null); setForm({ name: "", phone: "", email: "", address: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (s: any) => { setEditingId(s.id); setForm({ name: s.name, phone: s.phone || "", email: s.email || "", address: s.address || "", notes: s.notes || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Le nom est obligatoire"); return; }
    if (editingId) {
      await updateSupplier.mutateAsync({ id: editingId, ...form });
    } else {
      await createSupplier.mutateAsync(form);
    }
    setDialogOpen(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Fournisseurs</h1>
          <p className="text-muted-foreground text-sm mt-1">{suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""}</p>
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
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSupplier.mutate(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {s.phone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {s.phone}</p>}
              {s.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {s.email}</p>}
              {s.address && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {s.address}</p>}
            </div>
            {s.notes && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground">{s.notes}</p>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center py-8 text-muted-foreground">Aucun fournisseur — cliquez "Ajouter" pour commencer</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Modifier" : "Ajouter"} un fournisseur</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nom *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Téléphone</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><Label>Adresse</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Optionnel" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createSupplier.isPending || updateSupplier.isPending}>{editingId ? "Modifier" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
