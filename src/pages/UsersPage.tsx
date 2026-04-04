import { useState } from "react";
import { Plus, Shield, User, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
}

const initialUsers: AppUser[] = [
  { id: '1', name: 'Baye Sam', email: 'baye@bayesamgestion.sn', role: 'admin', status: 'active' },
  { id: '2', name: 'Amadou Diallo', email: 'amadou@bayesamgestion.sn', role: 'employee', status: 'active' },
  { id: '3', name: 'Fatou Sow', email: 'fatou@bayesamgestion.sn', role: 'employee', status: 'active' },
  { id: '4', name: 'Ousmane Ba', email: 'ousmane@bayesamgestion.sn', role: 'employee', status: 'inactive' },
];

const roleLabels = { admin: 'Administrateur', employee: 'Employé' };
const roleColors = { admin: 'bg-primary/15 text-primary border-primary/20', employee: 'bg-accent/15 text-accent border-accent/20' };

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'employee' as 'admin' | 'employee' });

  const openAdd = () => { setEditing(null); setForm({ name: '', email: '', role: 'employee' }); setDialogOpen(true); };
  const openEdit = (u: AppUser) => { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error("Veuillez remplir tous les champs"); return; }
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
      toast.success("Utilisateur modifié");
    } else {
      setUsers(prev => [...prev, { id: String(Date.now()), ...form, status: 'active' as const }]);
      toast.success("Utilisateur ajouté");
    }
    setDialogOpen(false);
  };

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-1">Gérez les comptes et les permissions</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(u => (
          <div key={u.id} className="stat-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {u.role === 'admin' ? <Shield className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-muted-foreground" />}
                </div>
                <div>
                  <h3 className="font-semibold">{u.name}</h3>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}><Edit2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toggleStatus(u.id)}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${u.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                {u.status === 'active' ? 'Actif' : 'Inactif'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Ajouter'} un utilisateur</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Nom complet *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div>
              <Label>Rôle</Label>
              <Select value={form.role} onValueChange={(v: 'admin' | 'employee') => setForm({...form, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="employee">Employé</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
