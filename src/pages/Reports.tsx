import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { useProducts, useInvoices, useCategories } from "@/hooks/useData";
import { useBusiness } from "@/contexts/BusinessContext";
import { TrendingUp, DollarSign, Package, FileText, Loader2 } from "lucide-react";

const COLORS = ["hsl(215,80%,48%)", "hsl(152,60%,42%)", "hsl(38,92%,50%)", "hsl(0,72%,55%)", "hsl(270,60%,50%)", "hsl(180,60%,40%)"];

export default function Reports() {
  const { formatCurrency } = useBusiness();
  const { data: products = [], isLoading: lp } = useProducts();
  const { data: invoices = [], isLoading: li } = useInvoices();
  const { data: categories = [] } = useCategories();

  if (lp || li) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const paidInvoices = invoices.filter(i => i.status === "paid");
  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.total), 0);

  const now = new Date();
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const monthlyData = monthNames.map((month, idx) => {
    const monthStr = `${now.getFullYear()}-${String(idx + 1).padStart(2, "0")}`;
    const rev = paidInvoices.filter(i => i.date?.startsWith(monthStr)).reduce((s, i) => s + Number(i.total), 0);
    return { month, revenue: rev };
  });

  // Category data
  const categoryMap = new Map<string, number>();
  products.forEach(p => {
    const catName = p.categories ? (p.categories as any).name : "Sans catégorie";
    categoryMap.set(catName, (categoryMap.get(catName) || 0) + p.quantity);
  });
  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

  // Top products by quantity sold (from invoice items)
  const productSales = new Map<string, number>();
  invoices.forEach(inv => {
    (inv.invoice_items || []).forEach((item: any) => {
      productSales.set(item.product_name, (productSales.get(item.product_name) || 0) + item.quantity);
    });
  });
  const topProducts = Array.from(productSales.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, sales]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, sales }));

  const monthsWithData = monthlyData.filter(m => m.revenue > 0).length || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports & Statistiques</h1>
        <p className="text-muted-foreground text-sm mt-1">Analyse détaillée de vos performances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CA Total", value: formatCurrency(totalRevenue), icon: DollarSign, color: "bg-primary/10 text-primary" },
          { label: "CA Mensuel Moy.", value: formatCurrency(Math.round(totalRevenue / monthsWithData)), icon: TrendingUp, color: "bg-success/10 text-success" },
          { label: "Factures", value: `${paidInvoices.length}/${invoices.length} payées`, icon: FileText, color: "bg-info/10 text-info" },
          { label: "Produits", value: String(products.length), icon: Package, color: "bg-warning/10 text-warning" },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-lg font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Évolution du chiffre d'affaires</h3>
          {totalRevenue > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Revenus" />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-20 text-muted-foreground text-sm">Données insuffisantes</p>}
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Répartition du stock par catégorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-20 text-muted-foreground text-sm">Ajoutez des produits</p>}
        </div>

        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Produits les plus vendus</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Ventes" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center py-20 text-muted-foreground text-sm">Créez des factures pour voir les statistiques</p>}
        </div>
      </div>
    </div>
  );
}
