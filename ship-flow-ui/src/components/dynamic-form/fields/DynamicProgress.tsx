'use client';

import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ProgressFieldConfig } from '../types';

interface DynamicProgressProps {
  config: ProgressFieldConfig;
  value?: number;
  onChange?: (value: number) => void;
  error?: string;
}

export function DynamicProgress({ config, value, onChange, error }: DynamicProgressProps) {
  const progressValue = value ?? config.defaultValue ?? 0;
  const maxValue = config.max ?? 100;

  const getColorClass = () => {
    switch (config.color) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-2 ${config.className || ''}`}>
      {config.label && (
        <Label
          htmlFor={config.id}
          className={config.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
        >
          {config.label}
        </Label>
      )}
      <div className="space-y-2">
        <Progress value={progressValue} max={maxValue} className={getColorClass()} />
        {config.showValue && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0</span>
            <span className="font-medium">{Math.round((progressValue / maxValue) * 100)}%</span>
            <span>{maxValue}</span>
          </div>
        )}
      </div>
      {config.description && <p className="text-sm text-muted-foreground">{config.description}</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
