import React, { useState } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { analyzeFinances } from '../services/geminiService';
import { Transaction, Project } from '../types';
import { Button } from './ui/Button';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  transactions: Transaction[];
  projects: Project[];
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ transactions, projects }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeFinances(transactions, projects);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="text-orange-400" size={24} />
          <h3 className="text-lg font-semibold">Consultor IA WoodFrame</h3>
        </div>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleAnalyze} 
          disabled={loading || transactions.length === 0}
          className="bg-orange-600 hover:bg-orange-500 border-none"
        >
          {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : null}
          {loading ? 'Analizando...' : 'Analizar Finanzas'}
        </Button>
      </div>

      <div className="min-h-[100px] text-slate-300 text-sm leading-relaxed">
        {analysis ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : (
          <p className="italic opacity-70">
            Haz clic en "Analizar Finanzas" para obtener un reporte sobre la rentabilidad de tus proyectos Wood Frame, detección de anomalías en gastos de materiales y recomendaciones de ahorro usando Google Gemini.
          </p>
        )}
      </div>
    </div>
  );
};
