import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Star, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";

// Definição do tipo da Meta
interface Goal {
  id: number;
  title: string;
  targetAmount: number; // Valor do objetivo (ex: 5000)
  currentAmount: number; // Quanto já guardou (ex: 1000)
  isPriority: boolean; // Se é a meta atual do Dashboard
}

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  
  // Estados do formulário
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCurrent, setNewCurrent] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Carregar metas salvas ao abrir
  useEffect(() => {
    const storedGoals = localStorage.getItem("finmind_goals");
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);

  // Salvar nova meta
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();

    const targetVal = parseFloat(newTarget.replace(",", "."));
    const currentVal = parseFloat(newCurrent.replace(",", ".")) || 0;

    if (!newTitle || isNaN(targetVal)) {
      toast.error("Preencha o nome e o valor da meta.");
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: newTitle,
      targetAmount: targetVal,
      currentAmount: currentVal,
      isPriority: goals.length === 0, // Se for a primeira, já vira prioritária
    };

    const updatedGoals = [...goals, newGoal];
    saveGoals(updatedGoals);
    
    // Limpar form
    setNewTitle("");
    setNewTarget("");
    setNewCurrent("");
    setIsFormOpen(false);
    toast.success("Meta criada com sucesso!");
  };

  // Função central para salvar no LocalStorage e atualizar estado
  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem("finmind_goals", JSON.stringify(updatedGoals));
  };

  // Define qual meta vai aparecer no Dashboard
  const setPriority = (id: number) => {
    const updatedGoals = goals.map(g => ({
      ...g,
      isPriority: g.id === id // Só a clicada vira true, o resto false
    }));
    saveGoals(updatedGoals);
    toast.success("Meta atualizada no Dashboard!");
  };

  // Excluir meta
  const handleDelete = (id: number) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    saveGoals(updatedGoals);
    toast.info("Meta removida.");
  };

  // Calcular porcentagem para a barra de progresso
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <h1 className="text-2xl font-bold">Minhas Metas</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        
        {/* Botão para abrir formulário */}
        {!isFormOpen && (
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="w-full py-6 text-lg bg-[#008F8C] hover:bg-[#015958] text-white shadow-lg"
          >
            <Plus className="mr-2" /> Nova Meta
          </Button>
        )}

        {/* Formulário de Nova Meta */}
        {isFormOpen && (
          <Card className="animate-slide-up border-primary/20 bg-white">
            <CardHeader>
              <CardTitle>Criar Nova Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Meta</label>
                  <Input 
                    placeholder="Ex: Reserva de Emergência" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Valor Total (R$)</label>
                    <Input 
                      type="number"
                      placeholder="5000,00" 
                      value={newTarget}
                      onChange={(e) => setNewTarget(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Já tenho (R$)</label>
                    <Input 
                      type="number"
                      placeholder="0,00" 
                      value={newCurrent}
                      onChange={(e) => setNewCurrent(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-[#008F8C] hover:bg-[#015958]">
                    Salvar Meta
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Metas */}
        <div className="space-y-4">
          {goals.length === 0 && !isFormOpen && (
            <div className="text-center py-10 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Você ainda não tem metas cadastradas.</p>
            </div>
          )}

          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            
            return (
              <Card 
                key={goal.id} 
                className={`transition-all hover:shadow-md ${goal.isPriority ? 'border-[#008F8C] border-2 bg-[#f0fdf9]' : 'bg-white'}`}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {goal.title}
                        {goal.isPriority && (
                          <span className="text-xs bg-[#008F8C] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> Atual
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de {' '}
                        {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    
                    {/* Menu de Ações (Prioridade e Excluir) */}
                    <div className="flex gap-2">
                        {!goal.isPriority && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setPriority(goal.id)}
                            title="Definir como Meta Atual"
                            className="text-[#008F8C] hover:bg-[#008F8C]/10"
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(goal.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#008F8C] to-[#015958] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}