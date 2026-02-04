import { GoogleGenAI } from "@google/genai";
import { Transaction, Project } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFinances = async (
  transactions: Transaction[],
  projects: Project[]
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Error: API Key no configurada.";

  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  
  // Simplify data for the prompt to save tokens, focusing on category aggregates
  const expensesByCategory: Record<string, number> = {};
  transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
     expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
  });

  const prompt = `
    Actúa como un experto consultor financiero para una empresa de construcción de casas Wood Frame.
    Analiza los siguientes datos resumidos:
    
    Total Ingresos: $${income}
    Total Gastos: $${expense}
    Balance: $${income - expense}
    
    Desglose de gastos por categoría:
    ${JSON.stringify(expensesByCategory, null, 2)}
    
    Proyectos activos: ${projects.map(p => p.name).join(', ')}

    Por favor, provee:
    1. Un breve diagnóstico de la salud financiera.
    2. Identifica si hay algún gasto desproporcionado para el método constructivo Wood Frame (ej. si el gasto en madera vs mano de obra es lógico).
    3. Dos recomendaciones concretas para optimizar costos o flujo de caja.

    Responde en formato Markdown, sé conciso y profesional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Ocurrió un error al consultar a Gemini. Por favor intenta más tarde.";
  }
};
