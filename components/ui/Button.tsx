import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  // Base style: thicker borders for contrast, bolder text
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    // High contrast orange
    primary: "bg-orange-600 text-white border-2 border-orange-700 hover:bg-orange-700 focus:ring-orange-500 shadow-md",
    // High contrast white/slate
    secondary: "bg-white text-slate-900 border-2 border-slate-400 hover:bg-slate-100 focus:ring-slate-500 shadow-sm",
    // High contrast red
    danger: "bg-red-600 text-white border-2 border-red-800 hover:bg-red-700 focus:ring-red-500 shadow-md",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-200 hover:text-slate-950",
  };

  const sizes = {
    sm: "h-10 px-4 text-sm", // Increased from h-8
    md: "h-12 px-6 text-base", // Increased from h-10
    lg: "h-14 px-8 text-lg", // Increased from h-12
    xl: "h-16 px-8 text-xl w-full", // Massive for main actions
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon && <span className={`${children ? 'mr-3' : ''} transform scale-125`}>{icon}</span>}
      {children}
    </button>
  );
};