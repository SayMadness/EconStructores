import { Project } from './types';

export const INITIAL_PROJECTS: Project[] = [
  { id: 'gen', name: 'General / Oficina' },
  { id: 'p1', name: 'Casa Modelo 45m2' },
  { id: 'p2', name: 'Cabaña Alpina' },
];

export const EXPENSE_CATEGORIES = [
  'Madera Estructural',
  'Placas (OSB/Fenólico)',
  'Aislación (Lana/EPS)',
  'Revestimiento Exterior',
  'Revestimiento Interior',
  'Techumbre/Zinguería',
  'Fundaciones/Base',
  'Aberturas (Puertas/Ventanas)',
  'Instalación Eléctrica',
  'Instalación Sanitaria',
  'Mano de Obra',
  'Herramientas',
  'Fletes/Transporte',
  'Permisos/Impuestos',
  'Marketing/Publicidad',
  'Otros',
];

export const INCOME_CATEGORIES = [
  'Anticipo Cliente',
  'Pago Avance de Obra',
  'Pago Final',
  'Venta de Sobrantes',
  'Inversión Externa',
  'Otros',
];

export const STORAGE_KEY = 'woodframe_books_data_v1';
