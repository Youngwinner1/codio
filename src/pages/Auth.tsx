import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Veuillez remplir tous les champs"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    navigate("/");
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName || !businessName) {
      toast.error("Veuillez remplir tous les champs"); return;
    }
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, business_name: businessName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.error("Entrez votre adresse email"); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Email de réinitialisation envoyé !");
    setMode("login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 p-12 flex-col justify-between text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">BayeSam</h1>
            <p className="text-sm opacity-80">Gestion Pro</p>
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Gérez votre commerce<br />de manière intelligente
          </h2>
          <p className="text-lg opacity-90 max-w-md">
            Stocks, ventes, facturation et rapports — tout en un seul endroit. 
            Adapté à votre métier, simple et professionnel.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {["📦 Gestion des stocks", "🧾 Facturation pro", "📊 Rapports détaillés", "👥 Multi-utilisateurs"].map(f => (
              <div key={f} className="bg-primary-foreground/10 rounded-lg p-3 text-sm">{f}</div>
            ))}
          </div>
        </div>
        <p className="text-sm opacity-60">© 2025 BayeSam Gestion Pro</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">BayeSam Gestion Pro</h1>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {mode === "login" ? "Connexion" : mode === "signup" ? "Créer un compte" : "Mot de passe oublié"}
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              {mode === "login" ? "Connectez-vous à votre espace" : mode === "signup" ? "Commencez gratuitement" : "Entrez votre email pour réinitialiser"}
            </p>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label>Nom complet</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Votre nom" className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label>Nom de l'entreprise</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ex: Quincaillerie Baye Sam" className="pl-10" />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" className="pl-10" />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <Label>Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === "login" && (
              <button onClick={() => setMode("forgot")} className="text-sm text-primary hover:underline block ml-auto">
                Mot de passe oublié ?
              </button>
            )}

            <Button
              onClick={mode === "login" ? handleLogin : mode === "signup" ? handleSignup : handleForgotPassword}
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          <div className="text-center text-sm">
            {mode === "login" ? (
              <p>Pas encore de compte ?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Créer un compte</button>
              </p>
            ) : (
              <p>Déjà un compte ?{" "}
                <button onClick={() => setMode("login")} className="text-primary font-medium hover:underline">Se connecter</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
