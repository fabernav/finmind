import { useState, useEffect } from "react";
import {
  Wallet,
  TrendingDown,
  Target,
  Plus,
  Brain,
  Receipt,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Menu,
  AlertTriangle, // Importei icones novos
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- ESTADOS ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([]);
  const [currentGoal, setCurrentGoal] = useState<any>(null);

  // Estados Calculados
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    expenses: 0,
    balanceTrend: 0, 
    expensesTrend: 0, 
    hasPrevData: false, 
    hasCurrentData: false 
  });

  // --- FUNÇÕES AUXILIARES DE DATA ---
  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // --- EFEITO: CARREGAR E CALCULAR DADOS ---
  useEffect(() => {
    const storedData = localStorage.getItem("finmind_transactions");
    let allTransactions = storedData ? JSON.parse(storedData) : [];

    if (allTransactions.length === 0) {
      const today = new Date();
      allTransactions = [
        { id: 1, title: "Salário Inicial", category: "Renda", amount: 3000, type: "income", date: today.toISOString() },
        { id: 2, title: "Almoço Teste", category: "Alimentação", amount: 50, type: "expense", date: today.toISOString() }
      ];
      localStorage.setItem("finmind_transactions", JSON.stringify(allTransactions));
    }
    setTransactions(allTransactions);

    // FILTRAGEM E CÁLCULOS
    const selectedMonth = currentDate.getMonth();
    const selectedYear = currentDate.getFullYear();
    const prevDate = new Date(currentDate);
    prevDate.setMonth(prevDate.getMonth() - 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const currentMonthTrans = allTransactions.filter((t: any) => {
      const tDate = new Date(t.date === "Hoje" || t.date === "Ontem" ? new Date().toISOString() : t.date);
      return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
    });

    const prevMonthTrans = allTransactions.filter((t: any) => {
      const tDate = new Date(t.date === "Hoje" || t.date === "Ontem" ? new Date().toISOString() : t.date);
      return tDate.getMonth() === prevMonth && tDate.getFullYear() === prevYear;
    });

    const calcTotals = (list: any[]) => {
      let bal = 0;
      let exp = 0;
      list.forEach(t => {
        if (t.type === 'income') bal += t.amount;
        else {
          bal -= t.amount;
          exp += t.amount;
        }
      });
      return { balance: bal, expenses: exp };
    };

    const currentTotals = calcTotals(currentMonthTrans);
    const prevTotals = calcTotals(prevMonthTrans);

    const calcTrend = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    setDashboardData({
      balance: currentTotals.balance,
      expenses: currentTotals.expenses,
      balanceTrend: calcTrend(currentTotals.balance, prevTotals.balance),
      expensesTrend: calcTrend(currentTotals.expenses, prevTotals.expenses),
      hasPrevData: prevMonthTrans.length > 0,
      hasCurrentData: currentMonthTrans.length > 0
    });

    const storedGoals = localStorage.getItem("finmind_goals");
    if (storedGoals) {
      const parsedGoals = JSON.parse(storedGoals);
      const priorityGoal = parsedGoals.find((g: any) => g.isPriority === true);
      setCurrentGoal(priorityGoal || null);
    }

  }, [currentDate]); 

  const handleLogout = () => {
    toast.success("Até logo!");
    navigate("/auth");
  };

  const recentTransactions = transactions
    .filter((t: any) => {
       const tDate = new Date(t.date === "Hoje" || t.date === "Ontem" ? new Date().toISOString() : t.date);
       return tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
    });

  // --- LÓGICA DE ESTILO DA IA ---
  // Define a cor e o ícone do card baseado na tendência de gastos
  const getAIStatus = () => {
      const trend = dashboardData.expensesTrend;
      
      if (trend > 20) {
          return {
              colorClass: "bg-gradient-to-br from-red-50 to-orange-50 border-red-200",
              iconColor: "text-red-500",
              title: "Atenção Necessária",
              icon: AlertTriangle,
              message: `Seus gastos subiram ${trend.toFixed(0)}% comparado ao mês passado. Cuidado!`
          };
      } else if (trend > 0) {
          return {
              colorClass: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
              iconColor: "text-yellow-600",
              title: "Ponto de Atenção",
              icon: TrendingUp,
              message: `Pequeno aumento de ${trend.toFixed(0)}% nos gastos. Mantenha o monitoramento.`
          };
      } else {
          return {
              colorClass: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
              iconColor: "text-emerald-600",
              title: "Tudo sob controle",
              icon: CheckCircle,
              message: "Seus gastos estão estáveis ou diminuíram. Ótimo trabalho!"
          };
      }
  };

  const aiStatus = getAIStatus();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-finmind-darker text-white sticky top-0 z-40 shadow-md">
        <div className="finmind-container py-3">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center justify-between w-full lg:w-auto">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-xl font-bold leading-tight">FinMind</h1>
                  <p className="text-xs text-white/70">Olá, Usuário!</p>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden text-white hover:bg-white/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center bg-white/10 rounded-full p-1 px-2 border border-white/20 backdrop-blur-sm w-full lg:w-auto justify-between lg:justify-center">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => changeMonth('prev')}
                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="mx-4 flex items-center gap-2 min-w-[140px] justify-center">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm capitalize">{formatMonthYear(currentDate)}</span>
                </div>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => changeMonth('next')}
                    className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/transactions", { state: { defaultDate: currentDate } })} className="text-white hover:bg-white/10 hover:text-white">
                <Receipt className="w-4 h-4 mr-2" /> Transações
              </Button>
              <Button variant="ghost" onClick={() => navigate("/goals")} className="text-white hover:bg-white/10 hover:text-white">
                <Target className="w-4 h-4 mr-2" /> Metas
              </Button>
              <Button variant="ghost" onClick={() => navigate("/ai")} className="text-white hover:bg-white/10 hover:text-white">
                <Brain className="w-4 h-4 mr-2" /> IA
              </Button>
              <Button variant="outline" size="icon" onClick={handleLogout} className="border-white/20 text-white bg-transparent hover:bg-white/20 hover:text-white">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {menuOpen && (
            <div className="lg:hidden border-t border-white/10 bg-finmind-darker/95 backdrop-blur-md animate-slide-up">
                <div className="finmind-container py-4 space-y-2">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate("/transactions", { state: { defaultDate: currentDate } })} 
                        className="w-full justify-start text-white hover:bg-white/10"
                    >
                        <Receipt className="w-4 h-4 mr-2" /> Transações
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate("/goals")} 
                        className="w-full justify-start text-white hover:bg-white/10"
                    >
                        <Target className="w-4 h-4 mr-2" /> Metas
                    </Button>
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate("/ai")} 
                        className="w-full justify-start text-white hover:bg-white/10"
                    >
                        <Brain className="w-4 h-4 mr-2" /> IA
                    </Button>
                    <div className="pt-2 border-t border-white/10">
                        <Button 
                            variant="ghost" 
                            onClick={handleLogout} 
                            className="w-full justify-start text-red-300 hover:bg-red-500/10 hover:text-red-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Sair
                        </Button>
                    </div>
                </div>
            </div>
        )}
      </header>

      <main className="flex-1 finmind-container py-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card Saldo */}
          <Card className="finmind-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Saldo em {formatMonthYear(currentDate).split(' ')[0]}</CardTitle>
              <Wallet className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              
              {dashboardData.hasCurrentData ? (
                 dashboardData.hasPrevData ? (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${dashboardData.balanceTrend >= 0 ? "text-success" : "text-destructive"}`}>
                        {dashboardData.balanceTrend >= 0 ? "+" : ""}
                        {dashboardData.balanceTrend.toFixed(1)}% 
                        <span className="text-muted-foreground text-xs font-normal">vs mês passado</span>
                    </p>
                 ) : (
                    <p className="text-xs mt-2 text-muted-foreground">Sem dados anteriores para comparar.</p>
                 )
              ) : (
                <p className="text-xs mt-2 text-orange-400">Nenhum registro neste mês.</p>
              )}
            </CardContent>
          </Card>

          {/* Card Gastos */}
          <Card className="finmind-card animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gastos do Mês</CardTitle>
              <TrendingDown className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {dashboardData.expenses.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </div>
              
              {dashboardData.hasCurrentData && dashboardData.hasPrevData ? (
                 <p className={`text-sm mt-2 flex items-center gap-1 ${dashboardData.expensesTrend <= 0 ? "text-success" : "text-destructive"}`}>
                     {dashboardData.expensesTrend > 0 ? "+" : ""}
                     {dashboardData.expensesTrend.toFixed(1)}% 
                     <span className="text-muted-foreground text-xs font-normal">vs mês passado</span>
                 </p>
              ) : (
                 <p className="text-xs mt-2 text-muted-foreground">
                    {dashboardData.hasCurrentData ? "Sem comparação anterior." : "Sem gastos registrados."}
                 </p>
              )}
            </CardContent>
          </Card>

          {/* Card Meta */}
          <Card className="finmind-card animate-slide-up">
             <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {currentGoal ? currentGoal.title : "Meta Atual"}
                </CardTitle>
                <Target className="w-5 h-5 text-primary" />
             </CardHeader>
             <CardContent>
                {currentGoal ? (
                    <>
                        <div className="text-2xl font-bold text-foreground">
                             {currentGoal.targetAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </div>
                        <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className="text-foreground font-medium">
                                {Math.round((currentGoal.currentAmount / currentGoal.targetAmount) * 100)}%
                            </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-finmind-dark transition-all"
                                style={{ width: `${Math.round((currentGoal.currentAmount / currentGoal.targetAmount) * 100)}%` }}
                            />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-2 text-center">
                        <p className="text-xs text-gray-500 mb-3">Nenhuma meta principal definida.</p>
                        <Button variant="outline" size="sm" onClick={() => navigate("/goals")} className="w-full">
                            Definir Meta Agora
                        </Button>
                    </div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card className="finmind-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground">Transações de {formatMonthYear(currentDate).split(' ')[0]}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {recentTransactions.length === 0 ? (
                    <div className="text-center py-8 opacity-50">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-gray-500">Nenhum lançamento neste mês.</p>
                        {dashboardData.hasCurrentData === false && (
                            <Button variant="link" onClick={() => navigate("/transactions", { state: { defaultDate: currentDate } })}>
                                Fazer primeiro lançamento
                            </Button>
                        )}
                    </div>
                ) : (
                    recentTransactions.map((transaction: any) => (
                    <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted transition-colors"
                    >
                        <div>
                        <p className="font-medium text-foreground">{transaction.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">{transaction.category}</p>
                        </div>
                        <div className="text-right">
                        <p
                            className={`font-bold ${
                            transaction.type === 'income' 
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                        >
                            {transaction.type === 'income' ? "+" : "-"}
                            {transaction.amount.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date === "Hoje" || transaction.date === "Ontem" ? new Date().toISOString() : transaction.date).toLocaleDateString('pt-BR')}
                        </p>
                        </div>
                    </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- CARD DA IA DINÂMICO --- */}
          {/* Agora ele muda de cor baseado no status (Red, Yellow, Green) */}
          <Card className={`finmind-card ${aiStatus.colorClass}`}>
             <CardHeader>
               <CardTitle className="text-foreground flex items-center gap-2">
                 <aiStatus.icon className={`w-5 h-5 ${aiStatus.iconColor}`} /> 
                 {aiStatus.title}
               </CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-foreground/80 mb-4 text-sm leading-relaxed">
                    {aiStatus.message}
                </p>
                
                {/* O Botão agora leva para /ai */}
                <Button 
                  variant="outline" 
                  className="w-full bg-white/50 hover:bg-white border-primary/20"
                  onClick={() => navigate("/ai")}
                >
                  Ver mais recomendações
                </Button>
             </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-lg hover:scale-110 transition-transform z-30 bg-primary hover:bg-finmind-dark text-white"
          onClick={() => navigate("/transactions", { state: { defaultDate: currentDate } })}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </main>
    </div>
  );
}