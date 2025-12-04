import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, AlertTriangle, TrendingUp, CheckCircle, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tipos para nossos Insights
type InsightType = 'warning' | 'danger' | 'success' | 'info';

interface Insight {
  id: number;
  type: InsightType;
  title: string;
  message: string;
  icon: any;
}

export default function AI() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = () => {
    // 1. CARREGAR DADOS
    const storedData = localStorage.getItem("finmind_transactions");
    const transactions = storedData ? JSON.parse(storedData) : [];
    
    const storedGoals = localStorage.getItem("finmind_goals");
    const goals = storedGoals ? JSON.parse(storedGoals) : [];
    const priorityGoal = goals.find((g: any) => g.isPriority === true);

    if (transactions.length === 0) {
        setInsights([{
            id: 1,
            type: 'info',
            title: "Poucos Dados",
            message: "Comece a adicionar transações para que eu possa analisar seus padrões de consumo.",
            icon: Brain
        }]);
        setLoading(false);
        return;
    }

    // 2. PREPARAR DATAS
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date();
    lastMonthDate.setMonth(now.getMonth() - 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    // 3. SEPARAR E AGRUPAR DADOS
    const currentMonthTrans = transactions.filter((t: any) => {
        const d = new Date(t.date === "Hoje" || t.date === "Ontem" ? new Date().toISOString() : t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthTrans = transactions.filter((t: any) => {
        const d = new Date(t.date === "Hoje" || t.date === "Ontem" ? new Date().toISOString() : t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
    });

    // Função auxiliar para somar por categoria
    const sumByCategory = (list: any[]) => {
        const groups: Record<string, number> = {};
        list.forEach(t => {
            if (t.type === 'expense') {
                groups[t.category] = (groups[t.category] || 0) + t.amount;
            }
        });
        return groups;
    };

    const currentCats = sumByCategory(currentMonthTrans);
    const lastCats = sumByCategory(lastMonthTrans);

    // 4. GERAR INSIGHTS (Lógica Matemática)
    const newInsights: Insight[] = [];
    let idCounter = 1;

    // ANÁLISE 1: Aumento Expressivo em Categoria (> 30%)
    Object.keys(currentCats).forEach(cat => {
        const currentVal = currentCats[cat];
        const lastVal = lastCats[cat] || 0;

        if (lastVal > 0) {
            const percentChange = ((currentVal - lastVal) / lastVal) * 100;
            
            if (percentChange > 30) {
                newInsights.push({
                    id: idCounter++,
                    type: 'warning',
                    title: `Atenção com ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
                    message: `Você gastou ${percentChange.toFixed(0)}% a mais em ${cat} comparado ao mês passado.`,
                    icon: TrendingUp
                });
            } else if (percentChange < -15) {
                 newInsights.push({
                    id: idCounter++,
                    type: 'success',
                    title: `Economia em ${cat.charAt(0).toUpperCase() + cat.slice(1)}!`,
                    message: `Seus gastos com ${cat} diminuíram ${Math.abs(percentChange).toFixed(0)}%. Ótimo trabalho!`,
                    icon: CheckCircle
                });
            }
        }
    });

    // ANÁLISE 2: Gastos Totais vs Renda (Perigo)
    const totalIncome = currentMonthTrans
        .filter((t: any) => t.type === 'income')
        .reduce((acc: number, t: any) => acc + t.amount, 0);
    
    const totalExpense = currentMonthTrans
        .filter((t: any) => t.type === 'expense')
        .reduce((acc: number, t: any) => acc + t.amount, 0);

    if (totalExpense > totalIncome && totalIncome > 0) {
        newInsights.push({
            id: idCounter++,
            type: 'danger',
            title: "Alerta: Gastos > Renda",
            message: "Cuidado! Você já gastou mais do que recebeu este mês. Evite novas compras não essenciais.",
            icon: AlertTriangle
        });
    } else if (totalIncome > 0 && totalExpense < totalIncome * 0.5) {
         newInsights.push({
            id: idCounter++,
            type: 'success',
            title: "Saúde Financeira Excelente",
            message: "Você gastou menos da metade do que ganhou. Aproveite para investir na sua meta.",
            icon: CheckCircle
        });
    }

    // ANÁLISE 3: Meta (Se existir e sobrar dinheiro)
    if (priorityGoal && (totalIncome - totalExpense) > 200) {
         newInsights.push({
            id: idCounter++,
            type: 'info',
            title: `Sugestão: ${priorityGoal.title}`,
            message: `Sobraram recursos este mês. Que tal fazer um aporte extra na sua meta principal?`,
            icon: Target
        });
    }
    
    // Se não gerou nada, dar feedback padrão
    if (newInsights.length === 0) {
        newInsights.push({
            id: idCounter++,
            type: 'info',
            title: "Tudo sob controle",
            message: "Seus gastos estão estáveis. Nenhuma anomalia detectada este mês.",
            icon: CheckCircle
        });
    }

    setInsights(newInsights);
    setLoading(false);
  };

  // Função para pegar cores baseadas no tipo
  const getCardStyles = (type: InsightType) => {
    switch (type) {
        case 'danger': return "bg-red-50 border-red-200 text-red-900";
        case 'warning': return "bg-orange-50 border-orange-200 text-orange-900";
        case 'success': return "bg-green-50 border-green-200 text-green-900";
        case 'info': return "bg-blue-50 border-blue-200 text-blue-900";
        default: return "bg-white";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="bg-[#0f292d] text-white py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#008F8C]" />
            <h1 className="text-2xl font-bold">Insights FinMind</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Análise Automática</h2>
            <p className="text-sm text-gray-500">Baseado nos seus padrões de consumo recentes.</p>
        </div>

        {loading ? (
            <div className="text-center py-10">Carregando análise...</div>
        ) : (
            <div className="space-y-4">
                {insights.map((insight) => (
                    <Card key={insight.id} className={`border-l-4 animate-slide-up ${getCardStyles(insight.type)}`}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-white/50`}>
                                    <insight.icon className="w-6 h-6" />
                                </div>
                                <CardTitle className="text-lg">{insight.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="opacity-90 leading-relaxed">
                                {insight.message}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}