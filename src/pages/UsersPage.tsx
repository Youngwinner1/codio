import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Trash2, Loader2, Users, Crown } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrateur", color: "bg-primary text-primary-foreground" },
  employee: { label: "Employé", color: "bg-secondary text-secondary-foreground" },
  cashier: { label: "Caissier", color: "bg-accent text-accent-foreground" },
  stock_manager: { label: "Gestionnaire stock", color: "bg-muted text-muted-foreground" },
};

function useBusinessUsers() {
  const { business } = useBusiness();
  return useQuery({
    queryKey: ["business_users", business?.id],
    queryFn: async () => {
      if (!business) return [];
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });
}

function useDeleteUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business_users"] });
      toast.success("Utilisateur retiré");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const { error } = await supabase.from("user_roles").update({ role: role as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["business_users"] });
      toast.success("Rôle mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export default function UsersPage() {
  const { business } = useBusiness();
  const { user } = useAuth();
  const { data: users = [], isLoading } = useBusinessUsers();
  const deleteRole = useDeleteUserRole();
  const updateRole = useUpdateUserRole();
  const [inviteOpen, setInviteOpen] = useState(false);

  const currentUserRole = users.find(u => u.user_id === user?.id);
  const isAdmin = currentUserRole?.role === "admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Utilisateurs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} membre{users.length > 1 ? "s" : ""} dans votre entreprise
          </p>
        </div>
        {isAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Inviter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Inviter un utilisateur</DialogTitle>
              </DialogHeader>
              <InviteForm businessId={business?.id || ""} onSuccess={() => setInviteOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {users.map((userRole) => {
          const isOwner = business?.owner_id === userRole.user_id;
          const isSelf = userRole.user_id === user?.id;
          const roleInfo = ROLE_LABELS[userRole.role] || ROLE_LABELS.employee;

          return (
            <div key={userRole.id} className="stat-card flex items-center gap-4">
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {userRole.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {isSelf ? "Vous" : `Utilisateur`}
                  </span>
                  {isOwner && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{userRole.user_id.slice(0, 8)}...</p>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && !isOwner && !isSelf ? (
                  <Select
                    value={userRole.role}
                    onValueChange={(role) => updateRole.mutate({ id: userRole.id, role })}
                  >
                    <SelectTrigger className="w-[160px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employé</SelectItem>
                      <SelectItem value="cashier">Caissier</SelectItem>
                      <SelectItem value="stock_manager">Gestionnaire stock</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className={`${roleInfo.color} text-xs`}>
                    {roleInfo.label}
                  </Badge>
                )}

                {isAdmin && !isOwner && !isSelf && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => deleteRole.mutate(userRole.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="stat-card text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
        </div>
      )}
    </div>
  );
}

function InviteForm({ businessId, onSuccess }: { businessId: string; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const handleInvite = async () => {
    if (!email) { toast.error("Entrez un email"); return; }
    setLoading(true);

    // Sign up the user (they'll get a confirmation email)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-10) + "A1!",
      options: {
        data: { invited: true },
        emailRedirectTo: window.location.origin,
      },
    });

    if (signUpError) {
      setLoading(false);
      toast.error(signUpError.message);
      return;
    }

    if (signUpData.user) {
      const { error } = await supabase.from("user_roles").insert({
        user_id: signUpData.user.id,
        business_id: businessId,
        role: role as any,
      });

      if (error) {
        setLoading(false);
        toast.error("Erreur: " + error.message);
        return;
      }
    }

    setLoading(false);
    qc.invalidateQueries({ queryKey: ["business_users"] });
    toast.success("Invitation envoyée à " + email);
    onSuccess();
  };

  return (
    <div className="space-y-4 pt-2">
      <div>
        <Label>Email de l'utilisateur</Label>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="employe@email.com"
        />
      </div>
      <div>
        <Label>Rôle</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Employé</SelectItem>
            <SelectItem value="cashier">Caissier</SelectItem>
            <SelectItem value="stock_manager">Gestionnaire stock</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleInvite} disabled={loading} className="w-full gap-2">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Envoyer l'invitation
      </Button>
    </div>
  );
}
