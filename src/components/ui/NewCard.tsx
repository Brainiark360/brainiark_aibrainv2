// components/ui/Card.tsx
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const cardClasses = `
    bg-white rounded-2xl border border-gray-100 p-6 shadow-sm
    transition-all duration-200
    ${hover ? 'hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5' : ''}
    ${className}
  `;

  const content = (
    <div className={cardClasses}>
      {children}
    </div>
  );

  if (onClick) {
    return (
      <motion.div
        whileHover={hover ? { scale: 1.01 } : {}}
        whileTap={{ scale: 0.99 }}
        onClick={onClick}
        className="cursor-pointer"
      >
        {content}
      </motion.div>
    );
  }

  return content;
}