import { useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Filter, Loader2 } from "lucide-react";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories, useSuppliers, useCreateCategory } from "@/hooks/useData";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Products() {
  const { formatCurrency } = useBusiness();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: suppliers = [] } = useSuppliers();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const createCategory = useCreateCategory();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", category_id: "", purchase_price: "", selling_price: "",
    quantity: "", min_stock: "", supplier_id: "", unit: "pièce", barcode: "", description: "",
  });
  const [newCategory, setNewCategory] = useState("");

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || p.category_id === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", category_id: "", purchase_price: "", selling_price: "", quantity: "", min_stock: "0", supplier_id: "", unit: "pièce", barcode: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name, category_id: p.category_id || "", purchase_price: String(p.purchase_price),
      selling_price: String(p.selling_price), quantity: String(p.quantity), min_stock: String(p.min_stock),
      supplier_id: p.supplier_id || "", unit: p.unit, barcode: p.barcode || "", description: p.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.selling_price) { toast.error("Nom et prix de vente requis"); return; }
    const data = {
      name: form.name,
      category_id: form.category_id || null,
      purchase_price: Number(form.purchase_price) || 0,
      selling_price: Number(form.selling_price),
      quantity: Number(form.quantity) || 0,
      min_stock: Number(form.min_stock) || 0,
      supplier_id: form.supplier_id || null,
      unit: form.unit,
      barcode: form.barcode || undefined,
      description: form.description || undefined,
    };
    if (editingId) {
      await updateProduct.mutateAsync({ id: editingId, ...data });
    } else {
      await createProduct.mutateAsync(data);
    }
    setDialogOpen(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    await createCategory.mutateAsync(newCategory.trim());
    setNewCategory("");
    toast.success("Catégorie ajoutée");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Produits / Stock</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} produit{products.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Ajouter un produit</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="stat-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Produit</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Catégorie</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">P. Achat</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">P. Vente</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Fournisseur</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    {p.barcode && <p className="text-xs text-muted-foreground">{p.barcode}</p>}
                  </div>
                </td>
                <td className="py-3 px-4">{p.categories ? <Badge variant="secondary">{(p.categories as any).name}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="py-3 px-4 text-right text-muted-foreground">{formatCurrency(p.purchase_price)}</td>
                <td className="py-3 px-4 text-right font-medium">{formatCurrency(p.selling_price)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="flex items-center justify-end gap-1.5">
                    {p.quantity <= p.min_stock && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    <span className={p.quantity <= p.min_stock ? "text-warning font-semibold" : ""}>{p.quantity} {p.unit}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{p.suppliers ? (p.suppliers as any).name : "—"}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteProduct.mutate(p.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucun produit — cliquez "Ajouter" pour commencer</p>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Modifier le produit" : "Ajouter un produit"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nom du produit *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Ciment CEM II" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category_id} onValueChange={v => setForm({...form, category_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex gap-2 mt-2">
                  <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nouvelle catégorie" className="text-xs h-8" />
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleAddCategory}>+</Button>
                </div>
              </div>
              <div>
                <Label>Fournisseur</Label>
                <Select value={form.supplier_id} onValueChange={v => setForm({...form, supplier_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Prix d'achat</Label><Input type="number" value={form.purchase_price} onChange={e => setForm({...form, purchase_price: e.target.value})} placeholder="0" /></div>
              <div><Label>Prix de vente *</Label><Input type="number" value={form.selling_price} onChange={e => setForm({...form, selling_price: e.target.value})} placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Quantité</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" /></div>
              <div><Label>Stock min.</Label><Input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} placeholder="0" /></div>
              <div><Label>Unité</Label><Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="pièce" /></div>
            </div>
            <div><Label>Code-barres</Label><Input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Optionnel" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={createProduct.isPending || updateProduct.isPending}>
              {editingId ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
