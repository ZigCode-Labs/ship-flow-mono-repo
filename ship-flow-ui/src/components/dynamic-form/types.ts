export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'tel'
  | 'url'
  | 'search'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'progress'
  | 'textarea'
  | 'range';

export interface BaseFieldConfig {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  defaultValue?: any;
  className?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface InputFieldConfig extends BaseFieldConfig {
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'tel'
    | 'url'
    | 'search';
}

export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  multiple?: boolean;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox';
  options?: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  inline?: boolean;
}

export interface RadioFieldConfig extends BaseFieldConfig {
  type: 'radio';
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  inline?: boolean;
}

export interface ProgressFieldConfig extends BaseFieldConfig {
  type: 'progress';
  value?: number;
  max?: number;
  showValue?: boolean;
  color?: 'default' | 'success' | 'warning' | 'error';
}

export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  rows?: number;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export interface RangeFieldConfig extends BaseFieldConfig {
  type: 'range';
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
}

export type FieldConfig =
  | InputFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | ProgressFieldConfig
  | TextareaFieldConfig
  | RangeFieldConfig;

export interface FormConfig {
  id: string;
  title?: string;
  description?: string;
  fields: FieldConfig[];
  submitButton?: {
    text: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
  };
  onSubmit?: (data: Record<string, any>) => void;
}

export interface FormValues {
  [key: string]: any;
}
