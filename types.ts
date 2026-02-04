export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  projectId: string;
}

export interface AppData {
  projects: Project[];
  transactions: Transaction[];
  expenseCategories?: string[];
  incomeCategories?: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  type?: string;
}

export interface TimeSeriesPoint {
  date: string;
  income: number;
  expense: number;
}