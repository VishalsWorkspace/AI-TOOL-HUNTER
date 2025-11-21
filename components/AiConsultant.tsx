"use client";
import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AiConsultant({ allTools }: { allTools: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=Idle, 1=Analyzing, 2=Recommendation
  const [userTask, setUserTask] = useState("");
  const [recommendation, setRecommendation] = useState<any>(null);

  // ... inside the component ...
  const handleConsultation = async () => {
    if (!userTask) return;
    setStep(1); // Analyzing UI

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        body: JSON.stringify({ query: userTask }),
      });
      const data = await res.json();

      if (data.success && data.recommendation) {
        setRecommendation({
            ...data.recommendation,
            description: data.reason // Use the AI's reason as description
        });
        setStep(2);
      } else {
        // Fallback if AI finds nothing
        setStep(0);
        alert("I couldn't find a perfect match in our database yet. Try 'Deep Search' on the main page!");
      }
    } catch (e) {
      console.error(e);
      setStep(0);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-2xl shadow-emerald-500/20 z-50 flex items-center justify-center"
      >
        <Bot className="h-8 w-8 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-zinc-950 p-4 flex justify-between items-center border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Bot className="text-emerald-500 h-5 w-5" />
          <span className="font-bold text-white">AI Consultant</span>
        </div>
        <button onClick={() => setIsOpen(false)}><X className="h-4 w-4 text-zinc-500 hover:text-white" /></button>
      </div>

      {/* Body */}
      <div className="p-6 min-h-[300px] flex flex-col justify-center">
        
        {step === 0 && (
          <>
            <h3 className="text-lg font-medium text-white mb-2">What are you building?</h3>
            <p className="text-zinc-400 text-sm mb-4">I'll analyze our database to find the perfect tool for you.</p>
            <textarea 
              className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white text-sm focus:ring-2 focus:ring-emerald-600 outline-none resize-none"
              rows={3}
              placeholder="e.g., I need to edit a PDF contract..."
              value={userTask}
              onChange={(e) => setUserTask(e.target.value)}
            />
            <Button onClick={handleConsultation} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
              Find Best Tool <Send className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-pulse">
            <Bot className="h-12 w-12 text-emerald-500 mb-4" />
            <h3 className="text-white font-bold">Analyzing Task...</h3>
            <p className="text-zinc-500 text-xs mt-2">Scanning features, pricing, and reviews...</p>
          </div>
        )}

        {step === 2 && recommendation && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2 text-center">Top Recommendation</p>
            <div className="bg-zinc-950 border border-emerald-500/30 p-4 rounded-lg">
              <h2 className="text-xl font-bold text-white mb-2">{recommendation.title}</h2>
              <p className="text-zinc-400 text-sm mb-4">{recommendation.description}</p>
              <a 
                href={recommendation.link} 
                target="_blank"
                className="block w-full bg-white text-black text-center py-2 rounded font-bold hover:bg-zinc-200"
              >
                Open {recommendation.title}
              </a>
            </div>
            <button onClick={() => setStep(0)} className="w-full text-center text-zinc-500 text-xs mt-4 hover:text-white">
              Ask something else
            </button>
          </div>
        )}

      </div>
    </div>
  );
}