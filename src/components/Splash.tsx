import { Brain } from "lucide-react";
import { useEffect, useState } from "react";

export const Splash = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-finmind-darker flex flex-col items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative">
        <Brain className="w-24 h-24 text-primary animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold text-white mt-8 mb-2">FinMind</h1>
      <p className="text-white/70 text-sm">Transforme seus gastos em inteligência.</p>
    </div>
  );
};
