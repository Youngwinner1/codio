import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { products, recentSales, monthlyRevenue, topProducts, formatCurrency, notifications } from "@/data/mockData";

const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
const totalStock = products.reduce((s, p) => s + p.quantity, 0);
const todaySales = recentSales.filter(s => s.date === '2024-12-08').reduce((s, sale) => s + sale.amount, 0);

const stats = [
  { label: 'Chiffre d\'affaires (mois)', value: formatCurrency(1450000), icon: TrendingUp, trend: '+8.5%', up: true, color: 'bg-primary/10 text-primary' },
  { label: 'Ventes du jour', value: formatCurrency(todaySales), icon: ShoppingCart, trend: '+12%', up: true, color: 'bg-success/10 text-success' },
  { label: 'Produits en stock', value: totalStock.toString(), icon: Package, trend: '-3%', up: false, color: 'bg-info/10 text-info' },
  { label: 'Alertes stock', value: lowStockProducts.length.toString(), icon: AlertTriangle, trend: '', up: false, color: 'bg-warning/10 text-warning' },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm mt-1">Vue d'ensemble de votre activité</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-xl font-bold mt-1.5">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            {stat.trend && (
              <div className="flex items-center gap-1 mt-2">
                {stat.up ? <ArrowUpRight className="w-3 h-3 text-success" /> : <ArrowDownRight className="w-3 h-3 text-destructive" />}
                <span className={`text-xs font-medium ${stat.up ? 'text-success' : 'text-destructive'}`}>{stat.trend}</span>
                <span className="text-xs text-muted-foreground">vs mois dernier</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="stat-card lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Chiffre d'affaires mensuel</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000)}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} labelStyle={{ color: 'hsl(var(--foreground))' }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-4">Top produits vendus</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topProducts} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="sales" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent sales */}
        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-3">Ventes récentes</h3>
          <div className="space-y-2.5">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{sale.product}</p>
                  <p className="text-xs text-muted-foreground">{sale.date} · {sale.quantity} unités</p>
                </div>
                <span className="text-sm font-semibold text-success">{formatCurrency(sale.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & notifications */}
        <div className="stat-card">
          <h3 className="font-semibold text-sm mb-3">Notifications récentes</h3>
          <div className="space-y-2.5">
            {notifications.slice(0, 5).map((notif) => (
              <div key={notif.id} className={`flex items-start gap-3 py-2 border-b border-border/50 last:border-0 ${!notif.read ? 'opacity-100' : 'opacity-60'}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  notif.type === 'warning' ? 'bg-warning' : notif.type === 'success' ? 'bg-success' : 'bg-info'
                }`} />
                <div>
                  <p className="text-sm">{notif.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
