'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ id, checked = false, onCheckedChange, disabled, className }, ref) => {
    return (
      <button
        ref={ref}
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'peer h-7 w-7 shrink-0 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'border-slate-300 bg-white hover:border-green-400 hover:bg-green-50',
          checked && 'bg-green-500 border-green-500',
          className
        )}
      >
        {checked && <Check className="h-5 w-5 text-white" strokeWidth={3} />}
      </button>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
