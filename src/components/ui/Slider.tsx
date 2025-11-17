import { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
}

export function Slider({ label, value, min = 0, max = 100, step = 1, ...props }: SliderProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {label}
          </label>
          <span className="text-sm font-semibold text-sky-600 dark:text-sky-400">{value}</span>
        </div>
      )}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer slider"
        {...props}
      />
    </div>
  );
}
