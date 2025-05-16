declare module 'react-hook-form' {
  import * as React from 'react';

  export type FieldValues = Record<string, any>;
  
  export type FieldPath<TFieldValues extends FieldValues> = string;
  
  export interface UseFormProps<TFieldValues extends FieldValues = FieldValues> {
    mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
    reValidateMode?: 'onSubmit' | 'onChange' | 'onBlur';
    defaultValues?: Partial<TFieldValues>;
    resolver?: any;
    context?: any;
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    shouldUseNativeValidation?: boolean;
    criteriaMode?: 'firstError' | 'all';
    delayError?: number;
  }

  export interface FieldError {
    type: string;
    message?: string;
  }

  export interface Field {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: any;
    name: string;
    ref: (instance: any) => void;
  }

  export interface FieldState {
    invalid: boolean;
    isTouched: boolean;
    isDirty: boolean;
    error?: FieldError;
  }

  export interface FormState {
    isDirty: boolean;
    dirtyFields: Record<string, boolean>;
    touchedFields: Record<string, boolean>;
    errors: Record<string, FieldError>;
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitCount: number;
  }

  export interface UseFormReturn<TFieldValues extends FieldValues = FieldValues> {
    control: any;
    handleSubmit: (onSubmit: (data: TFieldValues) => void) => (e?: React.BaseSyntheticEvent) => void;
    reset: (values?: Partial<TFieldValues>) => void;
    formState: FormState;
  }
  
  export interface ControllerProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
  > {
    name: TName;
    control?: any;
    defaultValue?: any;
    disabled?: boolean;
    rules?: any;
    render: ({ field, fieldState, formState }: {
      field: Field;
      fieldState: FieldState;
      formState: FormState;
    }) => React.ReactElement;
  }
  
  export const Controller: React.FC<ControllerProps>;
  export const FormProvider: React.FC<any>;
  export function useFormContext(): any;
  export function useForm<TFieldValues extends FieldValues = FieldValues>(props?: UseFormProps<TFieldValues>): UseFormReturn<TFieldValues>;
}