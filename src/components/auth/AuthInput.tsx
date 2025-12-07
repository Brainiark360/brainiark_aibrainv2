import { InputHTMLAttributes } from 'react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthInput({ label, className = '', ...props }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label className="body-os text-[rgb(var(--foreground))] font-medium">
        {label}
      </label>
      <input
        className={`
          w-full px-3 py-2 rounded-lg
          bg-[rgb(var(--input))] text-[rgb(var(--foreground))]
          border border-[rgb(var(--border))]
          focus:outline-none focus:ring-2 focus:ring-[rgb(var(--os-accent))]
          placeholder:text-[rgb(var(--muted-foreground))]
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
    </div>
  );
}