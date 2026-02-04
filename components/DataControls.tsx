import React, { useRef, useState } from 'react';
import { Download, Upload, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { AppData, Project, Transaction } from '../types';
import { Button } from './ui/Button';

interface DataControlsProps {
  data: AppData;
  onImport: (data: AppData) => void;
}

export const DataControls: React.FC<DataControlsProps> = ({ data, onImport }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const escapeCSV = (str: string | number) => {
    if (str === null || str === undefined) return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExportCSV = () => {
    try {
      // CSV Headers
      const headers = ['Fecha', 'Descripción', 'Monto', 'Tipo', 'Categoría', 'Proyecto'];
      
      // Map transactions to CSV rows
      const rows = data.transactions.map(t => {
        const project = data.projects.find(p => p.id === t.projectId);
        const typeDisplay = t.type === 'INCOME' ? 'Ingreso' : 'Gasto';
        return [
          escapeCSV(t.date),
          escapeCSV(t.description),
          escapeCSV(t.amount),
          escapeCSV(typeDisplay),
          escapeCSV(t.category),
          escapeCSV(project ? project.name : 'Sin Proyecto')
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `woodframe_registros_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'Archivo CSV descargado.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {
      console.error(e);
      setMessage({ type: 'error', text: 'Error al generar el archivo.' });
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("Archivo vacío");

        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length < 2) throw new Error("Formato inválido: Muy pocas líneas");
        
        // Headers are expected at line 0, data starts at line 1
        // Expected columns: Fecha, Descripción, Monto, Tipo, Categoría, Proyecto

        const newTransactions: Transaction[] = [];
        const projectMap = new Map<string, string>(); // Name -> ID mapping
        const incCats = new Set<string>();
        const expCats = new Set<string>();

        // Helper to generate IDs
        const getProjectId = (name: string) => {
           if (!name) return 'unknown';
           if (!projectMap.has(name)) {
               // Generate a simple ID
               const id = `p_${Math.random().toString(36).substr(2, 9)}`;
               projectMap.set(name, id);
           }
           return projectMap.get(name)!;
        };

        let successCount = 0;

        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            // Allow for some flexibility in column count if trailing commas are missing
            if (cols.length < 5) continue; 

            // Map columns based on Export order: 
            // 0: Date, 1: Desc, 2: Amount, 3: Type, 4: Category, 5: Project
            const date = cols[0];
            const description = cols[1];
            const amount = parseFloat(cols[2]);
            const typeStr = cols[3]; // 'Ingreso' or 'Gasto'
            const category = cols[4];
            const projectName = cols[5] || 'Sin Proyecto';

            if (isNaN(amount) || !date) continue;

            const type = (typeStr?.toLowerCase().includes('ingreso')) ? 'INCOME' : 'EXPENSE';
            
            // Collect categories for settings
            if (type === 'INCOME') incCats.add(category);
            else expCats.add(category);

            newTransactions.push({
                id: crypto.randomUUID(),
                date,
                description,
                amount,
                type,
                category,
                projectId: getProjectId(projectName)
            });
            successCount++;
        }

        const newProjects: Project[] = Array.from(projectMap.entries()).map(([name, id]) => ({
            id, 
            name
        }));

        if (successCount === 0) throw new Error("No se pudieron leer registros válidos");

        onImport({
            transactions: newTransactions,
            projects: newProjects,
            expenseCategories: Array.from(expCats),
            incomeCategories: Array.from(incCats)
        });

        setMessage({ type: 'success', text: `Se importaron ${successCount} registros exitosamente.` });
        if (fileInputRef.current) fileInputRef.current.value = '';

      } catch (err: any) {
        console.error(err);
        setMessage({ type: 'error', text: err.message || 'Error al procesar el archivo' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-slate-200 mb-8">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet size={28} className="text-green-600"/>
            RESPALDO DATOS (EXCEL)
        </h3>
        <p className="text-base text-slate-600 mt-2 font-medium">Guarda tus datos o cárgalos en otro celular.</p>
      </div>
      
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="lg" onClick={handleExportCSV} icon={<Download size={24}/>} fullWidth className="border-green-600 text-green-800 bg-green-50">
          DESCARGAR (GUARDAR)
        </Button>
        <div className="flex items-center gap-2">
             <div className="h-px bg-slate-300 flex-1"></div>
             <span className="text-slate-400 font-bold">O</span>
             <div className="h-px bg-slate-300 flex-1"></div>
        </div>
        <Button variant="secondary" size="lg" onClick={() => fileInputRef.current?.click()} icon={<Upload size={24}/>} fullWidth className="border-blue-600 text-blue-800 bg-blue-50">
          CARGAR (RESTAURAR)
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv" 
          onChange={handleImportFile}
        />
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded-xl text-lg font-bold flex items-center border-2 ${message.type === 'success' ? 'bg-green-100 text-green-900 border-green-500' : 'bg-red-100 text-red-900 border-red-500'}`}>
          {message.type === 'success' ? <Check size={24} className="mr-3"/> : <AlertCircle size={24} className="mr-3"/>}
          {message.text}
        </div>
      )}
    </div>
  );
};