import { useState } from "react";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Filter } from "lucide-react";
import { products as initialProducts, categories, formatCurrency, Product } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Products() {
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', quantity: '', minStock: '', supplier: '', unit: '' });

  const filtered = productList.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: '', category: categories[0], price: '', quantity: '', minStock: '', supplier: '', unit: 'pièce' });
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({ name: p.name, category: p.category, price: String(p.price), quantity: String(p.quantity), minStock: String(p.minStock), supplier: p.supplier, unit: p.unit });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.quantity) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (editingProduct) {
      setProductList(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p, name: form.name, category: form.category, price: Number(form.price), quantity: Number(form.quantity), minStock: Number(form.minStock), supplier: form.supplier, unit: form.unit
      } : p));
      toast.success("Produit modifié avec succès");
    } else {
      const newProduct: Product = {
        id: String(Date.now()), name: form.name, category: form.category,
        price: Number(form.price), quantity: Number(form.quantity), minStock: Number(form.minStock),
        supplier: form.supplier, unit: form.unit
      };
      setProductList(prev => [...prev, newProduct]);
      toast.success("Produit ajouté avec succès");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    toast.success("Produit supprimé");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits / Stock</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez votre inventaire ({productList.length} produits)</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter un produit
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="stat-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Produit</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Catégorie</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Prix</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Stock</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Fournisseur</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-medium">{p.name}</td>
                <td className="py-3 px-4"><Badge variant="secondary">{p.category}</Badge></td>
                <td className="py-3 px-4 text-right">{formatCurrency(p.price)}</td>
                <td className="py-3 px-4 text-right">
                  <span className="flex items-center justify-end gap-1.5">
                    {p.quantity <= p.minStock && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
                    <span className={p.quantity <= p.minStock ? 'text-warning font-semibold' : ''}>{p.quantity} {p.unit}</span>
                  </span>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{p.supplier}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} className="h-8 w-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucun produit trouvé</p>}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom *</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Prix (FCFA) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
              </div>
              <div>
                <Label>Quantité *</Label>
                <Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
              </div>
              <div>
                <Label>Stock min.</Label>
                <Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fournisseur</Label>
                <Input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} />
              </div>
              <div>
                <Label>Unité</Label>
                <Input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editingProduct ? 'Modifier' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
