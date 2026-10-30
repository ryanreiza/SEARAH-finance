import React from 'react';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  gradientClass?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  subtitle,
  actions,
  gradientClass = 'from-slate-900 to-slate-800 text-white',
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200/60">
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-md shrink-0 border border-white/20`}
        >
          {icon}
        </div>
        <div>
          <h1 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
