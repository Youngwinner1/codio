export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  supplier: string;
  unit: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  products: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  clientName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  date: string;
  product: string;
  quantity: number;
  amount: number;
}

export const categories = [
  'Ciment', 'Vis & Clous', 'Outils', 'Peinture', 'Plomberie',
  'Électricité', 'Quincaillerie', 'Bois', 'Fer', 'Sanitaire'
];

export const products: Product[] = [
  { id: '1', name: 'Ciment CEM II 42.5', category: 'Ciment', price: 4500, quantity: 120, minStock: 20, supplier: 'SOCOCIM', unit: 'sac' },
  { id: '2', name: 'Vis à bois 4x40mm', category: 'Vis & Clous', price: 1500, quantity: 45, minStock: 50, supplier: 'Quincaillerie Import', unit: 'boîte' },
  { id: '3', name: 'Marteau 500g', category: 'Outils', price: 3500, quantity: 30, minStock: 10, supplier: 'Toolmax', unit: 'pièce' },
  { id: '4', name: 'Peinture Vinylique 20L', category: 'Peinture', price: 18000, quantity: 8, minStock: 5, supplier: 'Seigneurie', unit: 'seau' },
  { id: '5', name: 'Tuyau PVC 100mm', category: 'Plomberie', price: 5500, quantity: 60, minStock: 15, supplier: 'PlastiSen', unit: 'barre' },
  { id: '6', name: 'Câble électrique 2.5mm²', category: 'Électricité', price: 2800, quantity: 100, minStock: 20, supplier: 'ElectroDist', unit: 'mètre' },
  { id: '7', name: 'Serrure de porte', category: 'Quincaillerie', price: 8500, quantity: 15, minStock: 5, supplier: 'SecuriLock', unit: 'pièce' },
  { id: '8', name: 'Fer à béton 10mm', category: 'Fer', price: 3200, quantity: 200, minStock: 50, supplier: 'MetalSen', unit: 'barre' },
  { id: '9', name: 'Clous 80mm', category: 'Vis & Clous', price: 800, quantity: 5, minStock: 30, supplier: 'Quincaillerie Import', unit: 'kg' },
  { id: '10', name: 'Robinet mitigeur', category: 'Sanitaire', price: 12000, quantity: 10, minStock: 5, supplier: 'SaniPro', unit: 'pièce' },
  { id: '11', name: 'Disjoncteur 20A', category: 'Électricité', price: 4200, quantity: 25, minStock: 10, supplier: 'ElectroDist', unit: 'pièce' },
  { id: '12', name: 'Ciment Blanc', category: 'Ciment', price: 6000, quantity: 40, minStock: 10, supplier: 'SOCOCIM', unit: 'sac' },
];

export const suppliers: Supplier[] = [
  { id: '1', name: 'SOCOCIM', phone: '+221 33 879 10 00', email: 'contact@sococim.sn', address: 'Rufisque, Dakar', products: 3 },
  { id: '2', name: 'Quincaillerie Import', phone: '+221 77 123 45 67', email: 'info@quincimport.sn', address: 'Colobane, Dakar', products: 5 },
  { id: '3', name: 'Toolmax', phone: '+221 76 234 56 78', email: 'vente@toolmax.sn', address: 'Pikine, Dakar', products: 8 },
  { id: '4', name: 'Seigneurie', phone: '+221 33 823 45 67', email: 'commande@seigneurie.sn', address: 'Almadies, Dakar', products: 4 },
  { id: '5', name: 'PlastiSen', phone: '+221 77 345 67 89', email: 'contact@plastisen.sn', address: 'Thiaroye, Dakar', products: 6 },
  { id: '6', name: 'ElectroDist', phone: '+221 76 456 78 90', email: 'info@electrodist.sn', address: 'Médina, Dakar', products: 10 },
  { id: '7', name: 'MetalSen', phone: '+221 33 834 56 78', email: 'vente@metalsen.sn', address: 'Zone Industrielle, Dakar', products: 7 },
];

export const invoices: Invoice[] = [
  {
    id: '1', number: 'FACT-2024-001', date: '2024-12-01', clientName: 'Moussa Diop',
    items: [
      { productId: '1', productName: 'Ciment CEM II 42.5', quantity: 10, unitPrice: 4500, total: 45000 },
      { productId: '8', productName: 'Fer à béton 10mm', quantity: 20, unitPrice: 3200, total: 64000 },
    ],
    subtotal: 109000, tax: 19620, discount: 0, total: 128620, status: 'paid'
  },
  {
    id: '2', number: 'FACT-2024-002', date: '2024-12-03', clientName: 'Awa Ndiaye',
    items: [
      { productId: '4', productName: 'Peinture Vinylique 20L', quantity: 3, unitPrice: 18000, total: 54000 },
    ],
    subtotal: 54000, tax: 9720, discount: 5000, total: 58720, status: 'paid'
  },
  {
    id: '3', number: 'FACT-2024-003', date: '2024-12-05', clientName: 'Ibrahima Fall',
    items: [
      { productId: '6', productName: 'Câble électrique 2.5mm²', quantity: 50, unitPrice: 2800, total: 140000 },
      { productId: '11', productName: 'Disjoncteur 20A', quantity: 5, unitPrice: 4200, total: 21000 },
    ],
    subtotal: 161000, tax: 28980, discount: 0, total: 189980, status: 'pending'
  },
  {
    id: '4', number: 'FACT-2024-004', date: '2024-12-08', clientName: 'Fatou Sarr',
    items: [
      { productId: '3', productName: 'Marteau 500g', quantity: 2, unitPrice: 3500, total: 7000 },
      { productId: '7', productName: 'Serrure de porte', quantity: 3, unitPrice: 8500, total: 25500 },
    ],
    subtotal: 32500, tax: 5850, discount: 0, total: 38350, status: 'paid'
  },
];

export const recentSales: Sale[] = [
  { id: '1', date: '2024-12-08', product: 'Ciment CEM II 42.5', quantity: 5, amount: 22500 },
  { id: '2', date: '2024-12-08', product: 'Fer à béton 10mm', quantity: 15, amount: 48000 },
  { id: '3', date: '2024-12-07', product: 'Peinture Vinylique 20L', quantity: 2, amount: 36000 },
  { id: '4', date: '2024-12-07', product: 'Câble électrique 2.5mm²', quantity: 30, amount: 84000 },
  { id: '5', date: '2024-12-06', product: 'Serrure de porte', quantity: 1, amount: 8500 },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 850000 },
  { month: 'Fév', revenue: 920000 },
  { month: 'Mar', revenue: 1050000 },
  { month: 'Avr', revenue: 980000 },
  { month: 'Mai', revenue: 1120000 },
  { month: 'Jun', revenue: 1350000 },
  { month: 'Jul', revenue: 1200000 },
  { month: 'Aoû', revenue: 1080000 },
  { month: 'Sep', revenue: 1250000 },
  { month: 'Oct', revenue: 1400000 },
  { month: 'Nov', revenue: 1320000 },
  { month: 'Déc', revenue: 1450000 },
];

export const topProducts = [
  { name: 'Ciment CEM II', sales: 340 },
  { name: 'Fer à béton', sales: 280 },
  { name: 'Câble élect.', sales: 220 },
  { name: 'Peinture', sales: 150 },
  { name: 'Vis à bois', sales: 130 },
];

export const notifications = [
  { id: '1', type: 'warning' as const, message: 'Stock faible : Clous 80mm (5 restants)', date: '2024-12-08', read: false },
  { id: '2', type: 'success' as const, message: 'Vente importante : 128 620 FCFA - Moussa Diop', date: '2024-12-08', read: false },
  { id: '3', type: 'warning' as const, message: 'Stock faible : Vis à bois 4x40mm (45 restants)', date: '2024-12-07', read: true },
  { id: '4', type: 'info' as const, message: 'Nouveau fournisseur ajouté : SaniPro', date: '2024-12-06', read: true },
  { id: '5', type: 'success' as const, message: 'Facture FACT-2024-004 payée', date: '2024-12-05', read: true },
];

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
};
