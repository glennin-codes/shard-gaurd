import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  title?: string;
  icon?: ReactNode;
  className?: string;
}

const Card = ({ children, title, icon, className = '' }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          {icon && <div className="text-blue-500 dark:text-blue-400">{icon}</div>}
          {title && (
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200">
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

export default Card; 