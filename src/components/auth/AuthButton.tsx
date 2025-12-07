import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

export function AuthButton({
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`
        w-full py-3 px-4 rounded-lg
        bg-gradient-to-br from-[rgb(var(--os-accent))] to-[rgb(var(--os-accent-soft))]
        text-white font-medium
        hover:opacity-90
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        relative
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}