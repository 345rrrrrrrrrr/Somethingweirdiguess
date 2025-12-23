
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '', footer }) => {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden backdrop-blur-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-slate-900/30 border-t border-slate-700">
          {footer}
        </div>
      )}
    </div>
  );
};
