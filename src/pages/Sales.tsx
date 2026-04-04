import { useState } from "react";
import { Plus, Search, Eye, Printer, Download, FileText, Trash2 } from "lucide-react";
import { invoices as initialInvoices, products, formatCurrency, Invoice, InvoiceItem } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const statusColors = {
  paid: 'bg-success/15 text-success border-success/20',
  pending: 'bg-warning/15 text-warning border-warning/20',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/20',
};
const statusLabels = { paid: 'Payée', pending: 'En attente', cancelled: 'Annulée' };

export default function Sales() {
  const [invoiceList, setInvoiceList] = useState<Invoice[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [clientName, setClientName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState(0);

  const filtered = invoiceList.filter(inv =>
    inv.number.toLowerCase().includes(search.toLowerCase()) ||
    inv.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        updated[index] = { ...updated[index], productId: prod.id, productName: prod.name, unitPrice: prod.price, total: prod.price * updated[index].quantity };
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Number(value);
      updated[index].total = updated[index].unitPrice * Number(value);
    }
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax - discount;

  const handleCreate = () => {
    if (!clientName || items.length === 0) {
      toast.error("Veuillez remplir le nom du client et ajouter au moins un produit");
      return;
    }
    const newInvoice: Invoice = {
      id: String(Date.now()),
      number: `FACT-2024-${String(invoiceList.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      clientName, items, subtotal, tax, discount, total,
      status: 'pending'
    };
    setInvoiceList(prev => [newInvoice, ...prev]);
    setCreateOpen(false);
    setClientName("");
    setItems([]);
    setDiscount(0);
    toast.success(`Facture ${newInvoice.number} créée avec succès`);
  };

  const handlePrint = (inv: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Facture ${inv.number}</title>
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
          <h1>QUINCAILLERIE BAYE SAM</h1>
          <p>Dakar, Sénégal | Tel: +221 77 000 00 00</p>
        </div>
        <div class="info">
          <div><strong>Facture:</strong> ${inv.number}<br><strong>Date:</strong> ${inv.date}</div>
          <div><strong>Client:</strong> ${inv.clientName}</div>
        </div>
        <table><thead><tr><th>Produit</th><th>Qté</th><th>Prix Unit.</th><th>Total</th></tr></thead>
        <tbody>${inv.items.map(i => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${formatCurrency(i.unitPrice)}</td><td>${formatCurrency(i.total)}</td></tr>`).join('')}</tbody></table>
        <div class="totals">
          <p>Sous-total: ${formatCurrency(inv.subtotal)}</p>
          <p>TVA (18%): ${formatCurrency(inv.tax)}</p>
          ${inv.discount > 0 ? `<p>Remise: -${formatCurrency(inv.discount)}</p>` : ''}
          <p class="total-final">TOTAL: ${formatCurrency(inv.total)}</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ventes / Facturation</h1>
          <p className="text-muted-foreground text-sm mt-1">{invoiceList.length} factures</p>
        </div>
        <Button onClick={() => { setCreateOpen(true); setItems([]); setClientName(""); setDiscount(0); }} className="gap-2">
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
                <td className="py-3 px-4 font-medium">{inv.number}</td>
                <td className="py-3 px-4 text-muted-foreground">{inv.date}</td>
                <td className="py-3 px-4">{inv.clientName}</td>
                <td className="py-3 px-4 text-right font-semibold">{formatCurrency(inv.total)}</td>
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
      </div>

      {/* View Invoice */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {viewInvoice && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Facture {viewInvoice.number}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <div><span className="text-muted-foreground">Client:</span> <strong>{viewInvoice.clientName}</strong></div>
                  <div><span className="text-muted-foreground">Date:</span> {viewInvoice.date}</div>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2">Produit</th><th className="text-right py-2">Qté</th><th className="text-right py-2">P.U.</th><th className="text-right py-2">Total</th></tr></thead>
                  <tbody>
                    {viewInvoice.items.map((item, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="py-2">{item.productName}</td>
                        <td className="py-2 text-right">{item.quantity}</td>
                        <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right space-y-1 text-sm">
                  <p>Sous-total: {formatCurrency(viewInvoice.subtotal)}</p>
                  <p>TVA (18%): {formatCurrency(viewInvoice.tax)}</p>
                  {viewInvoice.discount > 0 && <p>Remise: -{formatCurrency(viewInvoice.discount)}</p>}
                  <p className="text-lg font-bold text-primary">Total: {formatCurrency(viewInvoice.total)}</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => handlePrint(viewInvoice)} className="gap-2"><Printer className="w-4 h-4" /> Imprimer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du client *</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Moussa Diop" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Produits</Label>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="w-3 h-3" /> Ajouter</Button>
              </div>
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2 items-end">
                  <div className="flex-1">
                    <Select value={item.productId} onValueChange={v => updateItem(idx, 'productId', v)}>
                      <SelectTrigger><SelectValue placeholder="Produit" /></SelectTrigger>
                      <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} placeholder="Qté" />
                  </div>
                  <div className="w-28 text-right text-sm font-medium pt-2">{formatCurrency(item.total)}</div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removeItem(idx)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              ))}
            </div>
            <div className="max-w-[200px]">
              <Label>Remise (FCFA)</Label>
              <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} />
            </div>
            <div className="text-right space-y-1 text-sm border-t pt-3">
              <p>Sous-total: {formatCurrency(subtotal)}</p>
              <p>TVA (18%): {formatCurrency(tax)}</p>
              {discount > 0 && <p>Remise: -{formatCurrency(discount)}</p>}
              <p className="text-lg font-bold text-primary">Total: {formatCurrency(total)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate}>Créer la facture</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
