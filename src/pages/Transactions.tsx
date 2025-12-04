import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // IMPORTANTE: Adicione useLocation
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook para ler o que veio do Dashboard
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Estados do formulário
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("alimentacao");
  const [type, setType] = useState("expense");
  
  // LÓGICA DE DATA INICIAL INTELIGENTE
  // Tenta pegar a data enviada pelo Dashboard via state. 
  // Se não tiver (acesso direto), usa hoje.
  const getDefaultDate = () => {
    if (location.state && location.state.defaultDate) {
      const passedDate = new Date(location.state.defaultDate);
      
      // CORREÇÃO: Pegamos a data local (ano, mês, dia) para não sofrer com fuso horário
      const year = passedDate.getFullYear();
      const month = String(passedDate.getMonth() + 1).padStart(2, '0'); // +1 pois janeiro é 0
      const day = String(passedDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    }
    return ""; 
  };

  const [date, setDate] = useState(getDefaultDate()); 
  
  // Estados para Meta Automática
  const [priorityGoal, setPriorityGoal] = useState<any>(null);
  const [autoInvestPercent, setAutoInvestPercent] = useState(0); 

  useEffect(() => {
    const storedGoals = localStorage.getItem("finmind_goals");
    if (storedGoals) {
      const goals = JSON.parse(storedGoals);
      const priority = goals.find((g: any) => g.isPriority === true);
      setPriorityGoal(priority || null);
    }
  }, []);

  useEffect(() => {
    if (type === 'expense') setAutoInvestPercent(0);
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const numericAmount = parseFloat(amount.replace(",", "."));
      
      if (isNaN(numericAmount)) {
        throw new Error("Valor inválido");
      }

      // --- LÓGICA DA DATA DE SALVAMENTO ---
      let finalDate;
      
      if (date) {
        // Se o usuário preencheu (ou veio preenchido do dashboard), usa essa data
        finalDate = new Date(date + "T10:00:00").toISOString();
      } else {
        // Fallback de segurança: Se estiver vazio mesmo assim, usa HOJE
        finalDate = new Date().toISOString();
      }
      // ------------------------------------

      // 1. Salva a Transação
      const newTransaction = {
        id: Date.now(),
        title: description,
        amount: numericAmount,
        category: category,
        type: type,
        date: finalDate
      };

      const storedTransactions = JSON.parse(localStorage.getItem("finmind_transactions") || "[]");
      const updatedTransactions = [newTransaction, ...storedTransactions];
      localStorage.setItem("finmind_transactions", JSON.stringify(updatedTransactions));

      // 2. Investimento Automático
      if (type === 'income' && priorityGoal && autoInvestPercent > 0) {
        const investAmount = (numericAmount * autoInvestPercent) / 100;
        const storedGoals = JSON.parse(localStorage.getItem("finmind_goals") || "[]");
        const updatedGoals = storedGoals.map((g: any) => {
            if (g.id === priorityGoal.id) {
                return { ...g, currentAmount: g.currentAmount + investAmount };
            }
            return g;
        });
        localStorage.setItem("finmind_goals", JSON.stringify(updatedGoals));
        
        toast({
            title: "Investimento Realizado! 🚀",
            description: `R$ ${investAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} destinados para "${priorityGoal.title}"`,
            className: "bg-green-50 border-green-200"
        });
      }

      toast({
        title: "Sucesso!",
        description: "Transação salva com sucesso.",
      });

      // Ao voltar, também passamos a data de volta para o Dashboard não "resetar" pro mês atual
      // O Dashboard precisaria ser adaptado para ler isso também, mas por enquanto ele mantém o state local
      navigate("/dashboard");

    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao salvar",
        description: "Verifique os dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simulatedInvestAmount = amount 
    ? (parseFloat(amount.replace(",", ".")) * autoInvestPercent) / 100 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-[#0f292d] text-white py-4"> 
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Nova Transação</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`p-3 rounded-md font-medium transition-colors ${
                type === 'expense' 
                  ? 'bg-red-100 text-red-700 border-2 border-red-200' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Gasto (Saída)
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`p-3 rounded-md font-medium transition-colors ${
                type === 'income' 
                  ? 'bg-green-100 text-green-700 border-2 border-green-200' 
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              Ganho (Entrada)
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Descrição</label>
            <input
              required
              type="text"
              placeholder={type === 'income' ? "Ex: Salário Mensal" : "Ex: Almoço"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f292d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Valor (R$)</label>
                <input
                required
                type="number"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f292d]"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Data 
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={date} // Agora já vem preenchido com a data do Dashboard
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f292d] text-gray-600"
                    />
                </div>
            </div>
          </div>

          {/* Slider e Select de Categoria mantidos iguais */}
          {type === 'income' && priorityGoal && (
            <div className="bg-[#f0fdf9] p-5 rounded-xl border border-[#008F8C]/30 animate-fade-in shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#015958]">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-bold">Turbinar Meta</span>
                    </div>
                    <span className="text-xs bg-[#008F8C] text-white px-2 py-1 rounded-full font-medium">
                        {priorityGoal.title}
                    </span>
                </div>
                
                <p className="text-xs text-gray-600 mb-4">
                    Arraste para definir quanto destinar para sua meta:
                </p>

                <div className="relative mb-6 pt-2">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={autoInvestPercent}
                        onChange={(e) => setAutoInvestPercent(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#008F8C]"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-2xl font-bold text-[#008F8C]">{autoInvestPercent}%</span>
                    </div>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-[#008F8C]/20 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600">Valor destinado:</span>
                    <span className="font-bold text-[#008F8C] text-lg">
                        {simulatedInvestAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0f292d] bg-white"
            >
               {type === 'income' ? (
                 <>
                    <option value="renda">Salário / Renda</option>
                    <option value="freelance">Freelance</option>
                    <option value="investimento">Retorno Investimento</option>
                    <option value="outros">Outros</option>
                 </>
               ) : (
                 <>
                    <option value="alimentacao">Alimentação</option>
                    <option value="transporte">Transporte</option>
                    <option value="moradia">Moradia</option>
                    <option value="lazer">Lazer</option>
                    <option value="saude">Saúde</option>
                    <option value="compras">Compras</option>
                    <option value="contas">Contas</option>
                 </>
               )}
            </select>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#0f292d] hover:bg-[#1a4046] text-white py-6 text-lg"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : null}
            {type === 'income' 
                ? (autoInvestPercent > 0 ? 'Receber & Investir' : 'Receber Valor') 
                : 'Registrar Gasto'}
          </Button>

        </form>
      </main>
    </div>
  );
}