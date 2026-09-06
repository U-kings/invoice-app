import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface PeriodOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

interface PeriodSelectProps<T extends string> {
  period: T;
  // This securely matches your Dispatch<SetStateAction<T>> from useState
  setPeriod: (value: T | ((prevState: T) => T)) => void; 
  periodOptions: readonly PeriodOption<T>[];
  isFetching?: boolean;
}

// Making the component Generic dynamically resolves string literal vs string errors
export function PeriodSelect<T extends string>({ 
  period, 
  setPeriod, 
  periodOptions, 
  isFetching 
}: PeriodSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLabel = periodOptions.find((opt) => opt.value === period)?.label || period;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block w-auto">
      <button
        type="button"
        disabled={isFetching}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Revenue period"
        aria-expanded={isOpen}
        className="flex h-10 w-full gap-2 items-center justify-between rounded-xl border bg-background px-4 text-sm font-medium transition-colors outline-none hover:bg-muted/50 focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span>{currentLabel}</span>
        <ChevronDown 
          className={`h-4 w-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && !isFetching && (
        <ul className="absolute right-0 z-50 mt-1.5 w-full min-w-40 overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95 duration-100">
          {periodOptions.map((option) => {
            const isSelected = period === option.value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => {
                    setPeriod(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors outline-none cursor-default select-none
                    ${isSelected 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
