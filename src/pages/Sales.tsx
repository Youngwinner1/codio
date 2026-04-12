import { useState } from "react";
import { Plus, Search, Eye, Printer, FileText, Trash2, Loader2 } from "lucide-react";
import { useInvoices, useCreateInvoice, useProducts } from "@/hooks/useData";
import { useBusiness } from "@/contexts/BusinessContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  paid: "bg-success/15 text-success border-success/20",
  pending: "bg-warning/15 text-warning border-warning/20",
  cancelled: "bg-destructive/15 text-destructive border-destructive/20",
};
const statusLabels: Record<string, string> = { paid: "Payée", pending: "En attente", cancelled: "Annulée" };

interface ItemForm {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export default function Sales() {
  const { business, formatCurrency } = useBusiness();
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: products = [] } = useProducts();
  const createInvoice = useCreateInvoice();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<ItemForm[]>([]);
  const [discount, setDiscount] = useState(0);
  const [printedIds, setPrintedIds] = useState<Set<string>>(new Set());

  const filtered = invoices.filter(inv =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => setItems([...items, { product_id: "", product_name: "", quantity: 1, unit_price: 0, total: 0 }]);

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    if (field === "product_id") {
      const prod = products.find(p => p.id === value);
      if (prod) {
        updated[index] = { ...updated[index], product_id: prod.id, product_name: prod.name, unit_price: prod.selling_price, total: prod.selling_price * updated[index].quantity };
      }
    } else if (field === "quantity") {
      updated[index].quantity = Number(value);
      updated[index].total = updated[index].unit_price * Number(value);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const taxRate = business?.tax_rate || 18;
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax - discount;

  const handleCreate = async () => {
    if (!clientName || items.length === 0) {
      toast.error("Remplissez le client et ajoutez au moins un produit");
      return;
    }
    await createInvoice.mutateAsync({
      client_name: clientName,
      client_phone: clientPhone || undefined,
      subtotal, tax, discount, total,
      items: items.map(i => ({ product_id: i.product_id || null, product_name: i.product_name, quantity: i.quantity, unit_price: i.unit_price, total: i.total })),
    });
    setCreateOpen(false);
    setClientName("");
    setClientPhone("");
    setItems([]);
    setDiscount(0);
  };

  const markPrinted = (id: string) => setPrintedIds(prev => new Set(prev).add(id));

  const handlePrint = (inv: any) => {
    const invItems = inv.invoice_items || [];
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Facture ${inv.invoice_number}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}
      .header{text-align:center;margin-bottom:30px;border-bottom:3px solid #1a56db;padding-bottom:20px}
      .header h1{color:#1a56db;margin:0;font-size:24px}
      .header p{margin:5px 0;color:#666}
      .info{display:flex;justify-content:space-between;margin:20px 0}
      table{width:100%;border-collapse:collapse;margin:20px 0}
      th{background:#1a56db;color:white;padding:10px;text-align:left}
      td{padding:10px;border-bottom:1px solid #eee}
      .totals{text-align:right;margin-top:20px}
      .totals p{margin:5px 0}
      .total-final{font-size:20px;font-weight:bold;color:#1a56db}</style></head>
      <body>
        <div class="header">
          <h1>${business?.name || "ENTREPRISE"}</h1>
          <p>${business?.address || ""} | Tel: ${business?.phone || ""}</p>
        </div>
        <div class="info">
          <div><strong>Facture:</strong> ${inv.invoice_number}<br><strong>Date:</strong> ${new Date(inv.date).toLocaleDateString("fr-FR")}</div>
          <div><strong>Client:</strong> ${inv.client_name}${inv.client_phone ? `<br>Tel: ${inv.client_phone}` : ""}</div>
        </div>
        <table><thead><tr><th>Produit</th><th>Qté</th><th>Prix Unit.</th><th>Total</th></tr></thead>
        <tbody>${invItems.map((i: any) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${formatCurrency(i.unit_price)}</td><td>${formatCurrency(i.total)}</td></tr>`).join("")}</tbody></table>
        <div class="totals">
          <p>Sous-total: ${formatCurrency(Number(inv.subtotal))}</p>
          <p>TVA (${taxRate}%): ${formatCurrency(Number(inv.tax))}</p>
          ${Number(inv.discount) > 0 ? `<p>Remise: -${formatCurrency(Number(inv.discount))}</p>` : ""}
          <p class="total-final">TOTAL: ${formatCurrency(Number(inv.total))}</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
    markPrinted(inv.id);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ventes / Facturation</h1>
          <p className="text-muted-foreground text-sm mt-1">{invoices.length} facture{invoices.length > 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { setCreateOpen(true); setItems([]); setClientName(""); setClientPhone(""); setDiscount(0); }} className="gap-2">
          <Plus className="w-4 h-4" /> Nouvelle facture
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher une facture..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="stat-card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">N° Facture</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Client</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Montant</th>
              <th className="text-center py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Statut</th>
              <th className="text-right py-3 px-4 font-semibold text-muted-foreground text-xs uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4 font-medium">{inv.invoice_number}</td>
                <td className="py-3 px-4 text-muted-foreground">{new Date(inv.date).toLocaleDateString("fr-FR")}</td>
                <td className="py-3 px-4">{inv.client_name}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(Number(inv.total))}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[inv.status]}`}>
                    {statusLabels[inv.status]}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewInvoice(inv)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrint(inv)}><Printer className="w-3.5 h-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Aucune facture — cliquez "Nouvelle facture" pour commencer</p>}
      </div>

      {/* View */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {viewInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Facture {viewInvoice.invoice_number}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div><span className="text-muted-foreground">Client:</span> <strong>{viewInvoice.client_name}</strong></div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(viewInvoice.date).toLocaleDateString("fr-FR")}</div>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2">Produit</th><th className="text-right py-2">Qté</th><th className="text-right py-2">P.U.</th><th className="text-right py-2">Total</th></tr></thead>
                  <tbody>
                    {(viewInvoice.invoice_items || []).map((item: any, i: number) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-2">{item.product_name}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right space-y-1 text-sm">
                  <p>Sous-total: {formatCurrency(Number(viewInvoice.subtotal))}</p>
                  <p>TVA ({taxRate}%): {formatCurrency(Number(viewInvoice.tax))}</p>
                  {Number(viewInvoice.discount) > 0 && <p>Remise: -{formatCurrency(Number(viewInvoice.discount))}</p>}
                  <p className="text-lg font-bold text-primary">Total: {formatCurrency(Number(viewInvoice.total))}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handlePrint(viewInvoice)} className="gap-2"><Printer className="w-4 h-4" /> Imprimer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nom du client *</Label><Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Moussa Diop" /></div>
              <div><Label>Téléphone client</Label><Input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+221 77..." /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Produits</Label>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="w-3 h-3" /> Ajouter</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-end">
                  <div className="flex-1">
                    <Select value={item.product_id} onValueChange={v => updateItem(idx, "product_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                      <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {formatCurrency(p.selling_price)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} />
                  </div>
                  <div className="w-28 text-right text-sm font-medium pt-2">{formatCurrency(item.total)}</div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
            <div className="max-w-[200px]">
              <Label>Remise ({business?.currency})</Label>
              <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
            <div className="text-right space-y-1 text-sm border-t pt-3">
              <p>Sous-total: {formatCurrency(subtotal)}</p>
              <p>TVA ({taxRate}%): {formatCurrency(tax)}</p>
              {discount > 0 && <p>Remise: -{formatCurrency(discount)}</p>}
              <p className="text-lg font-bold text-primary">Total: {formatCurrency(total)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={createInvoice.isPending}>
              {createInvoice.isPending ? "Création..." : "Créer la facture"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
