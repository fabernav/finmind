import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de autenticação
    if (isLogin) {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      if (!name.trim()) {
        toast.error("Por favor, insira seu nome");
        return;
      }
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
    }
  };

  const handleGoogleLogin = () => {
    toast.info("Login com Google em breve!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* AQUI: Mudei bg-card-secondary para bg-white e adicionei shadow para destacar */}
        <div className="finmind-card p-8 bg-white animate-fade-in shadow-xl rounded-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-[#b3e6d9] p-3 rounded-xl mr-2">
                <Brain className="w-8 h-8 text-[#008F8C]" />
            </div>
            <h1 className="text-3xl font-bold text-finmind-dark">FinMind</h1>
          </div>

          {/* Título */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? "Bem-vindo ao FinMind" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground">
              Organize suas finanças de forma inteligente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-gray-50 border-border focus:bg-white transition-colors"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-50 border-border focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-50 border-border focus:bg-white transition-colors"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#008F8C] hover:bg-[#015958]" size="lg">
              {isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              {/* AQUI: Mudei bg-card-secondary para bg-white para o texto 'ou' não ficar com fundo verde */}
              <span className="px-2 bg-white text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Entrar com Google
          </Button>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-[#008F8C] hover:underline font-medium"
            >
              {isLogin
                ? "Não tem uma conta? Criar conta"
                : "Já tem uma conta? Fazer login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}