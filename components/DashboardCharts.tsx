import React, { useMemo, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Transaction, Project } from '../types';
import { Filter } from 'lucide-react';

interface DashboardChartsProps {
  transactions: Transaction[];
  projects: Project[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ transactions, projects }) => {
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterExpenseCategory, setFilterExpenseCategory] = useState<string>('all');
  const [filterIncomeCategory, setFilterIncomeCategory] = useState<string>('all');

  // Filter transactions based on selection
  const filteredData = useMemo(() => {
    return transactions.filter(t => {
      // 1. Filter by Project
      const matchProject = filterProject === 'all' || t.projectId === filterProject;
      if (!matchProject) return false;

      // 2. Filter by Category based on Type
      if (t.type === 'EXPENSE') {
        return filterExpenseCategory === 'all' || t.category === filterExpenseCategory;
      }
      if (t.type === 'INCOME') {
        return filterIncomeCategory === 'all' || t.category === filterIncomeCategory;
      }
      
      return true;
    });
  }, [transactions, filterProject, filterExpenseCategory, filterIncomeCategory]);

  // Aggregate for Pie Charts
  const expenseByCat = useMemo(() => {
    const data: Record<string, number> = {};
    filteredData.filter(t => t.type === 'EXPENSE').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const incomeByCat = useMemo(() => {
    const data: Record<string, number> = {};
    filteredData.filter(t => t.type === 'INCOME').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Aggregate for Bar Chart (Time Series)
  const timeSeriesData = useMemo(() => {
    const data: Record<string, { date: string; income: number; expense: number }> = {};
    
    // Sort chronologically first
    const sorted = [...filteredData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(t => {
      if (!data[t.date]) {
        data[t.date] = { date: t.date, income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') data[t.date].income += t.amount;
      else data[t.date].expense += t.amount;
    });

    return Object.values(data);
  }, [filteredData]);

  // Get unique categories for dropdowns based on existing data
  const availableExpenseCategories = useMemo(() => {
    return Array.from(new Set(transactions.filter(t => t.type === 'EXPENSE').map(t => t.category))).sort();
  }, [transactions]);

  const availableIncomeCategories = useMemo(() => {
    return Array.from(new Set(transactions.filter(t => t.type === 'INCOME').map(t => t.category))).sort();
  }, [transactions]);

  const selectStyle = "w-full border-2 border-slate-300 rounded-xl px-4 py-3 text-base font-bold text-slate-800 focus:ring-4 focus:border-orange-500 bg-white h-14";

  return (
    <div className="space-y-8 pb-8">
      {/* Mobile Optimized Filters */}
      <div className="bg-white p-5 rounded-xl shadow-md border-2 border-slate-200">
        <div className="flex items-center text-slate-800 font-bold text-lg mb-4 border-b-2 border-slate-100 pb-2">
          <Filter size={24} className="mr-2 text-orange-600" />
          FILTROS GLOBALES
        </div>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Proyecto</label>
            <select 
                className={selectStyle}
                value={filterProject}
                onChange={e => setFilterProject(e.target.value)}
            >
                <option value="all">TODOS LOS PROYECTOS</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
             <label className="block text-xs font-bold text-red-500 uppercase mb-1">Categoría Gastos</label>
             <select 
                className={`${selectStyle} border-red-200 bg-red-50`}
                value={filterExpenseCategory}
                onChange={e => setFilterExpenseCategory(e.target.value)}
            >
                <option value="all">TODOS LOS GASTOS</option>
                {availableExpenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-green-500 uppercase mb-1">Categoría Ingresos</label>
            <select 
                className={`${selectStyle} border-green-200 bg-green-50`}
                value={filterIncomeCategory}
                onChange={e => setFilterIncomeCategory(e.target.value)}
            >
                <option value="all">TODOS LOS INGRESOS</option>
                {availableIncomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Pie */}
        <div className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200">
          <h3 className="text-xl font-bold mb-4 text-slate-900 border-l-8 border-red-600 pl-3">GASTOS</h3>
          <div className="h-72">
            {expenseByCat.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCat}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {expenseByCat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} contentStyle={{fontSize: '16px', fontWeight: 'bold'}} />
                  <Legend verticalAlign="bottom" height={70} iconSize={20} wrapperStyle={{fontSize: '14px', fontWeight: '600'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold text-lg">
                <p>SIN DATOS</p>
              </div>
            )}
          </div>
        </div>

        {/* Income Pie */}
        <div className="bg-white p-4 rounded-xl shadow-md border-2 border-slate-200">
          <h3 className="text-xl font-bold mb-4 text-slate-900 border-l-8 border-green-600 pl-3">INGRESOS</h3>
          <div className="h-72">
            {incomeByCat.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCat}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    fill="#82ca9d"
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {incomeByCat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value}`} contentStyle={{fontSize: '16px', fontWeight: 'bold'}} />
                  <Legend verticalAlign="bottom" height={70} iconSize={20} wrapperStyle={{fontSize: '14px', fontWeight: '600'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 font-bold text-lg">
                <p>SIN DATOS</p>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-xl shadow-md border-2 border-slate-200">
          <h3 className="text-xl font-bold mb-4 text-slate-900">
            FLUJO DE CAJA (TIEMPO)
          </h3>
          <div className="h-80">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeSeriesData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeWidth={2} />
                  <XAxis dataKey="date" stroke="#0f172a" fontSize={14} fontWeight={700} tickFormatter={(str) => new Date(str).toLocaleDateString()} />
                  <YAxis stroke="#0f172a" fontSize={14} fontWeight={700} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '16px', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value}`, undefined]}
                  />
                  <Legend wrapperStyle={{fontSize: '16px', fontWeight: 'bold', paddingTop: '10px'}} />
                  <Bar dataKey="income" name="Ingresos" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Gastos" fill="#dc2626" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold text-lg">SIN DATOS</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};