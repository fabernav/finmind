import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Splash } from "@/components/Splash";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário já estiver logado, pode ir direto para o dashboard
    // Por enquanto, sempre mostra o splash e redireciona para auth
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    navigate("/auth");
  };

  if (showSplash) {
    return <Splash onComplete={handleSplashComplete} />;
  }

  return null;
};

export default Index;
