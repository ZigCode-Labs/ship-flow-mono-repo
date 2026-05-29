export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'month'
  | 'week';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface RadioOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

export interface CheckboxOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}
