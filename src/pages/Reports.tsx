import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { monthlyRevenue, topProducts, products, invoices, formatCurrency } from "@/data/mockData";
import { TrendingUp, DollarSign, Package, FileText } from "lucide-react";

const COLORS = ['hsl(215,80%,48%)', 'hsl(152,60%,42%)', 'hsl(38,92%,50%)', 'hsl(0,72%,55%)', 'hsl(270,60%,50%)'];

const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
const totalInvoices = invoices.length;
const paidInvoices = invoices.filter(i => i.status === 'paid').length;
const totalProducts = products.length;

const categoryData = products.reduce((acc, p) => {
  const existing = acc.find(c => c.name === p.category);
  if (existing) existing.value += p.quantity;
  else acc.push({ name: p.category, value: p.quantity });
  return acc;
}, [] as { name: string; value: number }[]);

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapports & Statistiques</h1>
        <p className="text-muted-foreground text-sm mt-1">Analyse détaillée de vos performances</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "CA Annuel", value: formatCurrency(totalRevenue), icon: DollarSign, color: "bg-primary/10 text-primary" },
          { label: "CA Mensuel Moy.", value: formatCurrency(Math.round(totalRevenue / 12)), icon: TrendingUp, color: "bg-success/10 text-success" },
          { label: "Factures", value: `${paidInvoices}/${totalInvoices} payées`, icon: FileText, color: "bg-info/10 text-info" },
          { label: "Produits", value: String(totalProducts), icon: Package, color: "bg-warning/10 text-warning" },
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
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} name="Revenus" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Répartition du stock par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Produits les plus vendus</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Ventes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
