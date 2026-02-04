import React, { useState, useEffect } from 'react';
import { Plus, X, Check, ArrowLeft, Delete, Calendar } from 'lucide-react';
import { Transaction, Project, TransactionType } from '../types';
import { Button } from './ui/Button';

interface TransactionFormProps {
  projects: Project[];
  expenseCategories: string[];
  incomeCategories: string[];
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onAddProject: (name: string) => string; // Returns new ID
  onAddCategory: (name: string, type: TransactionType) => void;
  onClose: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  projects, 
  expenseCategories,
  incomeCategories,
  onAdd, 
  onAddProject,
  onAddCategory,
  onClose 
}) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // UI States
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // Selection states
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [category, setCategory] = useState(expenseCategories[0]);

  // New Item Creation States
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const activeCategories = type === 'EXPENSE' ? expenseCategories : incomeCategories;

  // Reset category when type changes
  useEffect(() => {
    setCategory(type === 'EXPENSE' ? expenseCategories[0] : incomeCategories[0]);
  }, [type, expenseCategories, incomeCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check for category and project
    if (!category || !projectId) {
        alert("Falta seleccionar Proyecto o Categoría");
        return;
    }
    if (!amount) {
        alert("Falta el Monto");
        return;
    }

    onAdd({
      date,
      description,
      amount: parseFloat(amount),
      type,
      category,
      projectId,
    });
    onClose();
  };

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
        const newId = onAddProject(newProjectName.trim());
        setProjectId(newId);
        setIsCreatingProject(false);
        setNewProjectName('');
    }
  };

  const handleCreateCategory = () => {
      if (newCategoryName.trim()) {
          onAddCategory(newCategoryName.trim(), type);
          setCategory(newCategoryName.trim());
          setIsCreatingCategory(false);
          setNewCategoryName('');
      }
  };

  const handleNumPad = (value: string) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
    } else if (value === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
    } else {
      // Prevent multiple leading zeros, but allow '0.'
      if (amount === '0' && value === '0') return;
      if (amount === '0' && value !== '.') {
        setAmount(value);
      } else {
        setAmount(prev => prev + value);
      }
    }
  };

  const formatDisplayAmount = (val: string) => {
     if (!val) return '0';
     // Split integer and decimal parts
     const parts = val.split('.');
     // Format integer part with thousands separator (dots)
     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
     return parts.join(','); // Use comma for decimal separator visual
  };

  // Base input style: High contrast, large text, thick border
  const inputStyle = "w-full h-14 px-4 text-lg border-2 border-slate-400 rounded-xl focus:border-orange-600 focus:ring-4 focus:ring-orange-100 bg-white text-slate-900 font-medium placeholder-slate-400";
  const labelStyle = "block text-base font-bold text-slate-800 mb-2";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-100 flex flex-col h-[100dvh]">
      {/* Header Mobile Friendly */}
      <div className="bg-slate-900 text-white px-4 py-4 flex items-center justify-between shrink-0 shadow-md">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-800 active:bg-slate-700">
            <ArrowLeft size={32} />
        </button>
        <h3 className="text-xl font-bold tracking-wide">NUEVA TRANSACCIÓN</h3>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* Massive Toggle Type */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('INCOME')}
            className={`h-16 text-lg font-bold rounded-xl border-4 transition-all ${
              type === 'INCOME' 
                ? 'bg-green-100 border-green-600 text-green-800 shadow-inner' 
                : 'bg-white border-slate-300 text-slate-500'
            }`}
          >
            INGRESO (+)
          </button>
          <button
            type="button"
            onClick={() => setType('EXPENSE')}
            className={`h-16 text-lg font-bold rounded-xl border-4 transition-all ${
              type === 'EXPENSE' 
                ? 'bg-red-100 border-red-600 text-red-800 shadow-inner' 
                : 'bg-white border-slate-300 text-slate-500'
            }`}
          >
            GASTO (-)
          </button>
        </div>

        {/* Amount Trigger */}
        <div>
          <label className={labelStyle}>MONTO ($)</label>
          <button
             type="button"
             onClick={() => setIsCalculatorOpen(true)}
             className={`w-full flex items-center justify-end px-4 h-24 bg-white border-4 ${type === 'INCOME' ? 'border-green-600' : 'border-red-600'} rounded-xl text-5xl font-black text-slate-900 tracking-wider shadow-sm transition-transform active:scale-[0.98]`}
          >
             <span className="text-slate-400 mr-auto text-3xl">$</span>
             {formatDisplayAmount(amount)}
          </button>
        </div>

        {/* Date & Project */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className={labelStyle}>FECHA</label>
            <div className="relative">
                 {/* Standard input with huge clickable area */}
                 <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`${inputStyle} h-20 text-2xl font-bold`}
                 />
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <Calendar size={32} />
                 </div>
            </div>
          </div>
          
          <div>
            <label className={labelStyle}>PROYECTO</label>
            {!isCreatingProject ? (
                <div className="flex gap-2">
                    <select
                        value={projectId}
                        onChange={(e) => {
                            if (e.target.value === '__NEW__') setIsCreatingProject(true);
                            else setProjectId(e.target.value);
                        }}
                        className={`${inputStyle} h-16`}
                    >
                        {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                        <option value="__NEW__">➕ CREAR NUEVO...</option>
                    </select>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input 
                      type="text"
                      autoFocus
                      placeholder="NOMBRE PROYECTO"
                      className={`${inputStyle} h-16 uppercase`}
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                    />
                    <button type="button" onClick={handleCreateProject} className="bg-orange-600 text-white w-16 rounded-xl flex items-center justify-center shadow-md border-2 border-orange-800"><Check size={32}/></button>
                    <button type="button" onClick={() => setIsCreatingProject(false)} className="bg-slate-300 text-slate-700 w-16 rounded-xl flex items-center justify-center border-2 border-slate-400"><X size={32}/></button>
                </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelStyle}>CATEGORÍA</label>
          {!isCreatingCategory ? (
              <select
              value={category}
              onChange={(e) => {
                  if (e.target.value === '__NEW__') setIsCreatingCategory(true);
                  else setCategory(e.target.value);
              }}
              className={`${inputStyle} h-16`}
              >
              {activeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
              ))}
                  <option value="__NEW__">➕ CREAR NUEVA...</option>
              </select>
          ) : (
              <div className="flex gap-2">
                  <input 
                  type="text"
                  autoFocus
                  placeholder="NOMBRE CATEGORÍA"
                  className={`${inputStyle} h-16 uppercase`}
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  />
                   <button type="button" onClick={handleCreateCategory} className="bg-orange-600 text-white w-16 rounded-xl flex items-center justify-center shadow-md border-2 border-orange-800"><Check size={32}/></button>
                   <button type="button" onClick={() => setIsCreatingCategory(false)} className="bg-slate-300 text-slate-700 w-16 rounded-xl flex items-center justify-center border-2 border-slate-400"><X size={32}/></button>
              </div>
          )}
        </div>

        {/* Description - Optional */}
        <div>
          <label className={labelStyle}>NOTA <span className="text-slate-500 font-normal">(Opcional)</span></label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputStyle}
            placeholder="Ej: Clavos 2 pulgadas"
          />
        </div>

        <div className="h-24"></div> {/* Spacer for scroll */}
      </form>

      {/* Sticky Bottom Actions */}
      <div className="bg-white p-4 border-t-2 border-slate-300 flex gap-4 shrink-0 pb-safe">
        <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            CANCELAR
        </Button>
        <Button type="button" onClick={handleSubmit} variant="primary" size="lg" className="flex-1" icon={<Plus size={24}/>}>
            GUARDAR
        </Button>
      </div>

      {/* MODAL CALCULATOR */}
      {isCalculatorOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-sm flex flex-col justify-end">
              <div className="bg-white rounded-t-2xl overflow-hidden shadow-2xl animate-slide-up h-[85vh] flex flex-col">
                   {/* Calculator Header / Display */}
                   <div className={`p-6 border-b-4 ${type === 'INCOME' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'} flex-none`}>
                       <p className="text-slate-500 font-bold mb-2 uppercase text-sm">Ingresando Monto ({type === 'INCOME' ? 'Ingreso' : 'Gasto'})</p>
                       <div className="text-6xl font-black text-slate-900 tracking-tight text-right break-all">
                           ${formatDisplayAmount(amount)}
                       </div>
                   </div>

                   {/* Keypad */}
                   <div className="grid grid-cols-3 flex-1 bg-slate-100">
                        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                            <button
                                type="button"
                                key={num}
                                onClick={() => handleNumPad(num.toString())}
                                className="bg-white border-r border-b border-slate-200 text-4xl font-bold text-slate-800 active:bg-slate-200 active:text-black flex items-center justify-center"
                            >
                                {num}
                            </button>
                        ))}
                        {/* Bottom Row */}
                        <button
                            type="button"
                            onClick={() => handleNumPad('.')}
                            className="bg-white border-r border-b border-slate-200 text-4xl font-bold text-slate-800 active:bg-slate-200 flex items-center justify-center"
                        >
                            ,
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNumPad('0')}
                            className="bg-white border-r border-b border-slate-200 text-4xl font-bold text-slate-800 active:bg-slate-200 flex items-center justify-center"
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={() => handleNumPad('backspace')}
                            className="bg-slate-100 border-r border-b border-slate-200 text-red-600 active:bg-red-100 active:text-red-800 flex items-center justify-center"
                        >
                            <Delete size={40} />
                        </button>
                   </div>
                   
                   {/* Calculator Actions */}
                   <div className="p-4 bg-white border-t border-slate-200 flex gap-4 shrink-0">
                       <Button variant="secondary" size="lg" className="flex-1 text-xl" onClick={() => {
                           setAmount(''); // Optional: clear on cancel? Or just close? Let's just close to not lose data by accident, but user can clear with backspace
                           setIsCalculatorOpen(false);
                       }}>
                           VOLVER
                       </Button>
                       <Button variant="primary" size="lg" className="flex-[2] text-xl bg-blue-600 border-blue-800" onClick={() => setIsCalculatorOpen(false)} icon={<Check size={32}/>}>
                           CONFIRMAR
                       </Button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};