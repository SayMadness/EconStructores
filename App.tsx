import React, { useState, useEffect } from 'react';
import { Plus, LayoutDashboard, Table as TableIcon, Settings, Wallet, Trash2, AlertTriangle, Menu } from 'lucide-react';
import { Transaction, Project, AppData, TransactionType } from './types';
import { INITIAL_PROJECTS, STORAGE_KEY, EXPENSE_CATEGORIES as DEFAULT_EXPENSES, INCOME_CATEGORIES as DEFAULT_INCOME } from './constants';
import { TransactionForm } from './components/TransactionForm';
import { DashboardCharts } from './components/DashboardCharts';
import { DataControls } from './components/DataControls';
import { Button } from './components/ui/Button';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'settings'>('ledger');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  // State for dynamic categories
  const [expenseCategories, setExpenseCategories] = useState<string[]>(DEFAULT_EXPENSES);
  const [incomeCategories, setIncomeCategories] = useState<string[]>(DEFAULT_INCOME);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Custom Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppData = JSON.parse(saved);
        setTransactions(parsed.transactions || []);
        setProjects(parsed.projects.length ? parsed.projects : INITIAL_PROJECTS);
        // Load custom categories if they exist, otherwise use defaults
        if (parsed.expenseCategories && parsed.expenseCategories.length) {
            setExpenseCategories(parsed.expenseCategories);
        }
        if (parsed.incomeCategories && parsed.incomeCategories.length) {
            setIncomeCategories(parsed.incomeCategories);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      const data: AppData = { 
        transactions, 
        projects,
        expenseCategories,
        incomeCategories
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [transactions, projects, expenseCategories, incomeCategories, isLoaded]);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: crypto.randomUUID(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const requestDelete = (title: string, message: string, onConfirm: () => void) => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm
    });
  };

  const deleteTransaction = (id: string) => {
    requestDelete('BORRAR REGISTRO', '¿Seguro que quieres borrar este registro? No se puede deshacer.', () => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    });
  };

  const handleAddProject = (name: string): string => {
      const newId = `p_${Date.now()}`;
      const newProject: Project = { id: newId, name };
      setProjects(prev => [...prev, newProject]);
      return newId;
  };

  const handleDeleteProject = (id: string) => {
    requestDelete('BORRAR PROYECTO', '¿Borrar proyecto? Los registros quedarán huerfanos.', () => {
        setProjects(prev => prev.filter(p => p.id !== id));
    });
  };

  const handleAddCategory = (name: string, type: TransactionType) => {
      if (type === 'EXPENSE') {
          setExpenseCategories(prev => [...prev, name]);
      } else {
          setIncomeCategories(prev => [...prev, name]);
      }
  };

  const handleDeleteCategory = (name: string, type: TransactionType) => {
    requestDelete('BORRAR CATEGORÍA', `¿Eliminar "${name}"?`, () => {
        if (type === 'EXPENSE') {
            setExpenseCategories(prev => prev.filter(c => c !== name));
        } else {
            setIncomeCategories(prev => prev.filter(c => c !== name));
        }
    });
  };

  const handleImport = (data: AppData) => {
    setTransactions(data.transactions);
    setProjects(data.projects);
    if (data.expenseCategories) setExpenseCategories(data.expenseCategories);
    if (data.incomeCategories) setIncomeCategories(data.incomeCategories);
    if (!data.expenseCategories) setExpenseCategories(DEFAULT_EXPENSES);
    if (!data.incomeCategories) setIncomeCategories(DEFAULT_INCOME);
  };

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col pb-24">
      {/* Mobile-First Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
                <div className="bg-white p-1 rounded-full">
                    <Wallet className="text-orange-600" size={24} />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-xl tracking-tight leading-none">ECON<span className="text-orange-500">STRUCTORES</span></span>
                </div>
            </div>
          </div>
          <p className="text-[10px] text-orange-200 font-medium italic text-center border-t border-slate-800 pt-1">
            "Saber es poder. Un registro imperfecto supera a ningun registro"
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4">
        
        {/* High Contrast Stats Cards */}
        {activeTab !== 'settings' && (
             <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="bg-white p-5 rounded-xl shadow-md border-l-8 border-orange-500 flex justify-between items-center">
                    <div>
                        <p className="text-slate-500 text-sm font-bold uppercase mb-1">BALANCE FINAL</p>
                        <p className={`text-4xl font-black ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>${balance.toLocaleString()}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-green-100">
                        <p className="text-green-700 text-xs font-bold uppercase">INGRESOS</p>
                        <p className="text-xl font-black text-green-700 mt-1">${totalIncome.toLocaleString()}</p>
                     </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-red-100">
                        <p className="text-red-700 text-xs font-bold uppercase">GASTOS</p>
                        <p className="text-xl font-black text-red-700 mt-1">${totalExpense.toLocaleString()}</p>
                     </div>
                </div>
            </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase border-b-4 border-slate-300 pb-2">
                  Gráficos
              </h2>
              <DashboardCharts transactions={transactions} projects={projects} />
            </div>
          )}

          {activeTab === 'ledger' && (
             <div className="animate-fade-in">
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-2xl font-black text-slate-900 uppercase border-b-4 border-slate-300 pb-2 flex-1">
                    Libro Diario
                  </h2>
                </div>
                
                {/* Mobile: Card View */}
                <div className="space-y-4 md:hidden">
                    {transactions.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl text-center border-2 border-slate-300 border-dashed">
                             <p className="text-xl text-slate-400 font-bold">Sin registros</p>
                             <p className="text-slate-500 mt-2">Toca el botón + para empezar</p>
                        </div>
                    ) : (
                        [...transactions].reverse().map(t => (
                            <div key={t.id} className="bg-white p-5 rounded-xl shadow-md border-2 border-slate-200">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded text-sm uppercase">
                                        {new Date(t.date).toLocaleDateString()}
                                    </span>
                                    <span className={`text-2xl font-black ${t.type === 'INCOME' ? 'text-green-700' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="mb-4">
                                    <p className="font-bold text-lg text-slate-900 leading-tight">{t.category}</p>
                                    <p className="text-slate-600 text-sm mt-1 font-medium">{t.description || "Sin descripción"}</p>
                                </div>
                                <div className="flex items-center justify-between border-t-2 border-slate-100 pt-3">
                                    <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded uppercase tracking-wide">
                                        {projects.find(p => p.id === t.projectId)?.name}
                                    </span>
                                    <button 
                                        onClick={() => deleteTransaction(t.id)}
                                        className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm shadow-sm flex items-center gap-2"
                                    >
                                        <Trash2 size={18} /> BORRAR
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop: Table View (Hidden on Mobile) */}
                <div className="hidden md:block bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Proyecto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Categoría</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Monto</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                              No hay registros aún.
                            </td>
                          </tr>
                        ) : (
                          [...transactions].reverse().map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {new Date(t.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                {t.description}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {projects.find(p => p.id === t.projectId)?.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                {t.category}
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => deleteTransaction(t.id)} className="text-red-600 hover:text-red-900 font-bold">Eliminar</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-fade-in space-y-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase border-b-4 border-slate-300 pb-2">
                  Configuración
                </h2>
                
                <DataControls 
                  data={{ 
                    transactions, 
                    projects, 
                    expenseCategories, 
                    incomeCategories 
                  }} 
                  onImport={handleImport} 
                />
                
                <div className="space-y-8">
                    {/* Projects List Mobile Optimized */}
                    <div className="bg-white p-5 rounded-xl shadow-md border-2 border-slate-200">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 border-b-2 border-slate-100 pb-2">
                            PROYECTOS ACTIVOS
                        </h3>
                        <div className="space-y-3">
                            {projects.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                                    <span className="font-bold text-lg text-slate-800">{p.name}</span>
                                    <button 
                                        onClick={() => handleDeleteProject(p.id)}
                                        className="text-white bg-red-600 p-3 rounded-lg shadow-sm"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expense Categories Mobile Optimized */}
                    <div className="bg-white p-5 rounded-xl shadow-md border-2 border-slate-200">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 border-b-2 border-slate-100 pb-2">
                            CATEGORÍAS GASTOS
                        </h3>
                        <div className="space-y-3">
                            {expenseCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-100">
                                    <span className="font-bold text-lg text-slate-800">{cat}</span>
                                    <button 
                                        onClick={() => handleDeleteCategory(cat, 'EXPENSE')}
                                        className="text-white bg-red-600 p-3 rounded-lg shadow-sm"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Income Categories Mobile Optimized */}
                     <div className="bg-white p-5 rounded-xl shadow-md border-2 border-slate-200">
                        <h3 className="text-xl font-bold mb-4 text-slate-900 border-b-2 border-slate-100 pb-2">
                            CATEGORÍAS INGRESOS
                        </h3>
                        <div className="space-y-3">
                            {incomeCategories.map(cat => (
                                <div key={cat} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-100">
                                    <span className="font-bold text-lg text-slate-800">{cat}</span>
                                    <button 
                                        onClick={() => handleDeleteCategory(cat, 'INCOME')}
                                        className="text-white bg-red-600 p-3 rounded-lg shadow-sm"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Fixed) */}
      <nav className="fixed bottom-0 w-full bg-slate-900 text-slate-400 h-20 flex justify-around items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-slate-800">
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'ledger' ? 'text-white bg-slate-800 border-t-4 border-orange-500' : ''}`}
        >
          <TableIcon size={28} strokeWidth={activeTab === 'ledger' ? 3 : 2} />
          <span className="text-xs font-bold mt-1 uppercase">Registros</span>
        </button>
        
        {/* Floating Add Button Wrapper */}
        <div className="relative -top-6">
            <button 
                onClick={() => setIsFormOpen(true)}
                className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-slate-100 active:scale-95 transition-transform"
            >
                <Plus size={40} strokeWidth={3} />
            </button>
        </div>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dashboard' ? 'text-white bg-slate-800 border-t-4 border-orange-500' : ''}`}
        >
          <LayoutDashboard size={28} strokeWidth={activeTab === 'dashboard' ? 3 : 2} />
          <span className="text-xs font-bold mt-1 uppercase">Gráficos</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'settings' ? 'text-white bg-slate-800 border-t-4 border-orange-500' : ''}`}
        >
          <Settings size={28} strokeWidth={activeTab === 'settings' ? 3 : 2} />
          <span className="text-xs font-bold mt-1 uppercase">Ajustes</span>
        </button>
      </nav>

      {/* High Contrast Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 border-4 border-red-500">
                 <div className="flex flex-col items-center text-center mb-6">
                     <div className="bg-red-100 p-4 rounded-full mb-4">
                        <AlertTriangle size={48} className="text-red-600" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase">{confirmState.title}</h3>
                     <p className="text-slate-800 text-lg font-medium mt-2">{confirmState.message}</p>
                 </div>
                 <div className="flex flex-col gap-4">
                     <Button variant="danger" size="xl" onClick={() => {
                         confirmState.onConfirm();
                         setConfirmState(prev => ({...prev, isOpen: false}));
                     }}>
                        SÍ, ELIMINAR
                     </Button>
                     <Button variant="secondary" size="lg" fullWidth onClick={() => setConfirmState(prev => ({...prev, isOpen: false}))}>
                        CANCELAR
                     </Button>
                 </div>
             </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {isFormOpen && (
        <TransactionForm 
          projects={projects} 
          expenseCategories={expenseCategories}
          incomeCategories={incomeCategories}
          onAdd={addTransaction} 
          onAddProject={handleAddProject}
          onAddCategory={handleAddCategory}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}