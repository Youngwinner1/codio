import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <p className="text-muted-foreground text-sm mt-1">Gérez les comptes et les permissions</p>
      </div>

      <div className="stat-card text-center py-12">
        <p className="text-muted-foreground mb-2">La gestion avancée des utilisateurs sera bientôt disponible.</p>
        <p className="text-sm text-muted-foreground">Pour l'instant, vous êtes l'administrateur principal de votre entreprise.</p>
      </div>
    </div>
  );
}
